// ============================================
// API ПРОСРОЧЕК — GET (список) + POST (обновление статусов)
// ============================================

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireManager } from "@/lib/auth"
import { getDaysOverdue } from "@/lib/calculations"

// ============================================
// GET — Список просроченных платежей
// ============================================

export async function GET(request: NextRequest) {
  try {
    await requireManager()

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("clientId")
    const minDays = searchParams.get("minDays")

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Ищем installments где dueDate < today и status != PAID
    const where: Record<string, unknown> = {
      dueDate: { lt: today },
      status: { not: "PAID" },
    }

    // Фильтр по клиенту
    if (clientId) {
      where.deal = { clientId }
    }

    const overdueInstallments = await prisma.installment.findMany({
      where,
      include: {
        deal: {
          include: {
            client: {
              select: {
                id: true,
                fullName: true,
                phone: true,
              },
            },
            createdByUser: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: { dueDate: "asc" },
    })

    // Маппинг и фильтрация по минимальным дням просрочки
    let result = overdueInstallments.map((inst) => ({
      id: inst.id,
      dealId: inst.dealId,
      dealNumber: inst.deal.dealNumber,
      clientId: inst.deal.client.id,
      clientName: inst.deal.client.fullName,
      clientPhone: inst.deal.client.phone,
      managerName: inst.deal.createdByUser.fullName,
      index: inst.index,
      dueDate: inst.dueDate,
      amount: inst.amount,
      status: inst.status,
      daysOverdue: getDaysOverdue(inst.dueDate),
    }))

    // Фильтр по минимальным дням
    if (minDays) {
      const minDaysNum = parseInt(minDays)
      result = result.filter((r) => r.daysOverdue >= minDaysNum)
    }

    // Статистика
    const summary = {
      totalCount: result.length,
      totalAmount: result.reduce((sum, r) => sum + r.amount, 0),
      avgDaysOverdue: result.length > 0 
        ? Math.round(result.reduce((sum, r) => sum + r.daysOverdue, 0) / result.length)
        : 0,
    }

    return NextResponse.json({
      success: true,
      data: result,
      summary,
    })
  } catch (error) {
    console.error("GET /api/overdue error:", error)
    return NextResponse.json(
      { success: false, error: "Ошибка загрузки просрочек" },
      { status: 500 }
    )
  }
}

// ============================================
// POST — Обновить статусы просроченных
// ============================================

export async function POST() {
  try {
    await requireManager()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Находим все DUE installments с просроченной датой
    const result = await prisma.installment.updateMany({
      where: {
        status: "DUE",
        dueDate: { lt: today },
      },
      data: {
        status: "OVERDUE",
      },
    })

    return NextResponse.json({
      success: true,
      message: `Обновлено статусов: ${result.count}`,
      updated: result.count,
    })
  } catch (error) {
    console.error("POST /api/overdue error:", error)
    return NextResponse.json(
      { success: false, error: "Ошибка обновления статусов" },
      { status: 500 }
    )
  }
}
