// ============================================
// API ОТЧЁТОВ — GET
// ============================================

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireManager } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await requireManager()

    // Все сделки
    const deals = await prisma.deal.findMany({
      include: {
        payments: true,
        installments: true,
      },
    })

    // Расчёты
    let totalDeals = deals.length
    let activeDeals = 0
    let closedDeals = 0
    let totalProfit = 0    // прибыль = sum(salePrice - purchasePrice)
    let totalRevenue = 0   // выручка = sum(payments)
    let totalReceivables = 0  // дебиторка = sum(remaining)
    let overdueAmount = 0
    let overdueCount = 0

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (const deal of deals) {
      // Статус
      if (deal.status === "ACTIVE") activeDeals++
      if (deal.status === "CLOSED") closedDeals++

      // Прибыль (только активные и закрытые)
      if (deal.status === "ACTIVE" || deal.status === "CLOSED") {
        totalProfit += deal.salePrice - deal.purchasePrice
      }

      // Выручка
      const paid = deal.payments.reduce((s, p) => s + p.amount, 0)
      totalRevenue += paid

      // Дебиторка
      if (deal.status === "ACTIVE") {
        totalReceivables += deal.amountToFinance - paid
      }

      // Просрочки
      for (const inst of deal.installments) {
        if (inst.status !== "PAID" && new Date(inst.dueDate) < today) {
          overdueAmount += inst.amount
          overdueCount++
        }
      }
    }

    // Тренды по месяцам (последние 6 месяцев)
    const monthlyData: Array<{ month: string; deals: number; revenue: number }> = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const monthDeals = deals.filter((d) => {
        const created = new Date(d.createdAt)
        return created >= monthStart && created <= monthEnd
      }).length

      const monthRevenue = deals.reduce((sum, deal) => {
        return sum + deal.payments
          .filter((p) => {
            const paidAt = new Date(p.paidAt)
            return paidAt >= monthStart && paidAt <= monthEnd
          })
          .reduce((s, p) => s + p.amount, 0)
      }, 0)

      monthlyData.push({
        month: monthStart.toLocaleDateString("ru-RU", { month: "short", year: "2-digit" }),
        deals: monthDeals,
        revenue: monthRevenue,
      })
    }

    // Топ менеджеров
    const managerStats = new Map<string, { name: string; deals: number; revenue: number }>()
    
    for (const deal of deals) {
      if (deal.status === "CANCELED") continue
      
      const manager = await prisma.user.findUnique({
        where: { id: deal.createdByUserId },
        select: { id: true, fullName: true },
      })
      
      if (manager) {
        const existing = managerStats.get(manager.id) || { name: manager.fullName, deals: 0, revenue: 0 }
        existing.deals++
        existing.revenue += deal.payments.reduce((s, p) => s + p.amount, 0)
        managerStats.set(manager.id, existing)
      }
    }

    const topManagers = Array.from(managerStats.values())
      .sort((a, b) => b.deals - a.deals)
      .slice(0, 5)

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalDeals,
          activeDeals,
          closedDeals,
          totalProfit,
          totalRevenue,
          totalReceivables,
          overdueAmount,
          overdueCount,
        },
        monthlyData,
        topManagers,
      },
    })
  } catch (error) {
    console.error("GET /api/reports error:", error)
    return NextResponse.json(
      { success: false, error: "Ошибка загрузки отчётов" },
      { status: 500 }
    )
  }
}
