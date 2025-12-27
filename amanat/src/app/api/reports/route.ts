import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// GET - Get reports summary
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    const dateFilter: Record<string, unknown> = {}
    if (dateFrom) dateFilter.gte = new Date(dateFrom)
    if (dateTo) dateFilter.lte = new Date(dateTo)

    const dealDateFilter = Object.keys(dateFilter).length > 0
      ? { createdAt: dateFilter }
      : {}

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get deals stats
    const [
      totalDeals,
      activeDeals,
      closedDeals,
      draftDeals,
      canceledDeals,
      deals,
      payments,
      overdueInstallments,
    ] = await Promise.all([
      prisma.deal.count({ where: dealDateFilter }),
      prisma.deal.count({ where: { ...dealDateFilter, status: "ACTIVE" } }),
      prisma.deal.count({ where: { ...dealDateFilter, status: "CLOSED" } }),
      prisma.deal.count({ where: { ...dealDateFilter, status: "DRAFT" } }),
      prisma.deal.count({ where: { ...dealDateFilter, status: "CANCELED" } }),
      prisma.deal.findMany({
        where: { ...dealDateFilter, status: { in: ["ACTIVE", "CLOSED"] } },
        select: {
          purchasePrice: true,
          salePrice: true,
          amountToFinance: true,
        },
      }),
      prisma.payment.aggregate({
        where: {
          paidAt: Object.keys(dateFilter).length > 0 ? dateFilter as { gte?: Date; lte?: Date } : undefined,
        },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.installment.findMany({
        where: {
          status: { not: "PAID" },
          dueDate: { lt: today },
          deal: { status: "ACTIVE" },
        },
        select: { amount: true },
      }),
    ])

    // Calculate totals
    const totalProfit = deals.reduce((sum, d) => sum + (d.salePrice - d.purchasePrice), 0)
    const totalRevenue = payments._sum.amount || 0
    const totalReceivables = deals.reduce((sum, d) => sum + d.amountToFinance, 0) - totalRevenue
    const overdueAmount = overdueInstallments.reduce((sum, i) => sum + i.amount, 0)

    // Get monthly stats for charts
    const monthlyStats = await getMonthlyStats()

    // Get top managers
    const topManagers = await prisma.deal.groupBy({
      by: ["createdByUserId"],
      where: { status: { in: ["ACTIVE", "CLOSED"] } },
      _count: true,
      _sum: { salePrice: true },
      orderBy: { _count: { createdByUserId: "desc" } },
      take: 5,
    })

    const managersWithNames = await Promise.all(
      topManagers.map(async (m) => {
        const user = await prisma.user.findUnique({
          where: { id: m.createdByUserId },
          select: { fullName: true },
        })
        return {
          userId: m.createdByUserId,
          name: user?.fullName || "Неизвестно",
          dealsCount: m._count,
          totalSales: m._sum.salePrice || 0,
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalDeals,
          activeDeals,
          closedDeals,
          draftDeals,
          canceledDeals,
          totalRevenue,
          totalProfit,
          totalReceivables,
          overdueAmount,
          overdueCount: overdueInstallments.length,
          paymentsCount: payments._count,
        },
        monthly: monthlyStats,
        topManagers: managersWithNames,
      },
    })
  } catch (error) {
    console.error("Get reports error:", error)
    return NextResponse.json(
      { success: false, error: "Ошибка при получении отчётов" },
      { status: 500 }
    )
  }
}

async function getMonthlyStats() {
  const months = []
  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

    const [deals, payments] = await Promise.all([
      prisma.deal.count({
        where: {
          createdAt: { gte: date, lt: nextMonth },
          status: { in: ["ACTIVE", "CLOSED"] },
        },
      }),
      prisma.payment.aggregate({
        where: {
          paidAt: { gte: date, lt: nextMonth },
        },
        _sum: { amount: true },
      }),
    ])

    months.push({
      month: date.toLocaleDateString("ru-RU", { month: "short", year: "numeric" }),
      deals,
      revenue: payments._sum.amount || 0,
    })
  }

  return months
}
