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
    const clientId = searchParams.get("clientId")
    const managerId = searchParams.get("managerId")
    const fromDate = searchParams.get("fromDate")
    const toDate = searchParams.get("toDate")

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const where: any = {
      dueDate: { lt: today },
      status: { not: "PAID" },
    }

    if (clientId || managerId || fromDate || toDate) {
      where.deal = {}
      if (clientId) {
        where.deal.clientId = clientId
      }
      if (managerId) {
        where.deal.createdByUserId = managerId
      }
      if (fromDate || toDate) {
        where.dueDate = {}
        if (fromDate) {
          where.dueDate.gte = new Date(fromDate)
        }
        if (toDate) {
          where.dueDate.lte = new Date(toDate)
        }
      }
    }

    const overdue = await prisma.installment.findMany({
      where,
      include: {
        deal: {
          include: {
            client: true,
            createdByUser: {
              select: {
                id: true,
                fullName: true,
                phone: true,
              },
            },
          },
        },
        payments: true,
      },
      orderBy: {
        dueDate: "asc",
      },
    })

    // Обновляем статусы на OVERDUE если они ещё DUE
    await prisma.installment.updateMany({
      where: {
        id: { in: overdue.map((i) => i.id) },
        status: "DUE",
      },
      data: {
        status: "OVERDUE",
      },
    })

    return NextResponse.json({ overdue })
  } catch (error) {
    console.error("Overdue GET error:", error)
    return NextResponse.json(
      { error: "Ошибка получения просрочек" },
      { status: 500 }
    )
  }
}
