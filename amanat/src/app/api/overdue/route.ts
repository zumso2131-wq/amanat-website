import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { overdueFilterSchema } from "@/lib/validations"
import { auth } from "@/lib/auth"
import { getDaysOverdue } from "@/lib/calculations"

// GET - List overdue installments
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const params = overdueFilterSchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      managerId: searchParams.get("managerId"),
      clientId: searchParams.get("clientId"),
      minDaysOverdue: searchParams.get("minDaysOverdue"),
      sortBy: searchParams.get("sortBy") || "dueDate",
      sortOrder: searchParams.get("sortOrder") || "asc",
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const where: Record<string, unknown> = {
      status: { not: "PAID" },
      dueDate: { lt: today },
      deal: {
        status: "ACTIVE",
      },
    }

    if (params.managerId) {
      where.deal = {
        ...(where.deal as object),
        createdByUserId: params.managerId,
      }
    }

    if (params.clientId) {
      where.deal = {
        ...(where.deal as object),
        clientId: params.clientId,
      }
    }

    const [installments, total] = await Promise.all([
      prisma.installment.findMany({
        where,
        orderBy: { [params.sortBy || "dueDate"]: params.sortOrder },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: {
          deal: {
            include: {
              client: {
                select: { id: true, fullName: true, phone: true },
              },
              createdByUser: {
                select: { id: true, fullName: true },
              },
            },
          },
        },
      }),
      prisma.installment.count({ where }),
    ])

    // Add days overdue to each installment
    const overdueInstallments = installments.map((inst) => ({
      ...inst,
      daysOverdue: getDaysOverdue(inst.dueDate),
    }))

    // Filter by minDaysOverdue if specified
    const filtered = params.minDaysOverdue
      ? overdueInstallments.filter((i) => i.daysOverdue >= (params.minDaysOverdue || 0))
      : overdueInstallments

    // Calculate summary
    const summary = {
      totalCount: total,
      totalAmount: filtered.reduce((sum, i) => sum + i.amount, 0),
      avgDaysOverdue: filtered.length > 0
        ? Math.round(filtered.reduce((sum, i) => sum + i.daysOverdue, 0) / filtered.length)
        : 0,
    }

    return NextResponse.json({
      success: true,
      data: filtered,
      summary,
      total: filtered.length,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(filtered.length / params.limit),
    })
  } catch (error) {
    console.error("Get overdue error:", error)
    return NextResponse.json(
      { success: false, error: "Ошибка при получении просрочек" },
      { status: 500 }
    )
  }
}

// POST - Update overdue statuses (cron job or manual trigger)
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Update all due installments that are past their due date to OVERDUE
    const result = await prisma.installment.updateMany({
      where: {
        status: "DUE",
        dueDate: { lt: today },
        deal: { status: "ACTIVE" },
      },
      data: {
        status: "OVERDUE",
      },
    })

    return NextResponse.json({
      success: true,
      message: `Обновлено ${result.count} просроченных платежей`,
      count: result.count,
    })
  } catch (error) {
    console.error("Update overdue error:", error)
    return NextResponse.json(
      { success: false, error: "Ошибка при обновлении просрочек" },
      { status: 500 }
    )
  }
}
