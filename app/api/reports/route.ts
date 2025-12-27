import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const fromDate = searchParams.get("fromDate")
    const toDate = searchParams.get("toDate")

    const where: any = {}
    if (fromDate || toDate) {
      where.createdAt = {}
      if (fromDate) {
        where.createdAt.gte = new Date(fromDate)
      }
      if (toDate) {
        where.createdAt.lte = new Date(toDate)
      }
    }

    // Прибыль = сумма всех salePrice - purchasePrice
    const deals = await prisma.deal.findMany({
      where: {
        ...where,
        status: { not: "CANCELED" },
      },
      select: {
        purchasePrice: true,
        salePrice: true,
        payments: {
          select: {
            amount: true,
          },
        },
        amountToFinance: true,
        installments: {
          select: {
            amount: true,
            status: true,
          },
        },
      },
    })

    let totalProfit = 0
    let totalRevenue = 0
    let totalDebt = 0

    deals.forEach((deal) => {
      const profit = Number(deal.salePrice) - Number(deal.purchasePrice)
      totalProfit += profit

      const revenue = deal.payments.reduce((sum, p) => sum + Number(p.amount), 0)
      totalRevenue += revenue

      const totalAmount = deal.installments.reduce((sum, i) => sum + Number(i.amount), 0)
      const paidAmount = deal.installments
        .filter((i) => i.status === "PAID")
        .reduce((sum, i) => sum + Number(i.amount), 0)
      const remaining = totalAmount - paidAmount
      totalDebt += remaining
    })

    return NextResponse.json({
      profit: totalProfit,
      revenue: totalRevenue,
      debt: totalDebt,
      dealsCount: deals.length,
    })
  } catch (error) {
    console.error("Reports GET error:", error)
    return NextResponse.json(
      { error: "Ошибка получения отчётов" },
      { status: 500 }
    )
  }
}
