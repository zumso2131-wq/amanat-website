import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { dealSchema, dealFilterSchema } from "@/lib/validations"
import { auth } from "@/lib/auth"
import { logCreate } from "@/lib/audit"
import { calculateDeal, generateDealNumber } from "@/lib/calculations"

// GET - List deals
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const params = dealFilterSchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search"),
      status: searchParams.get("status"),
      clientId: searchParams.get("clientId"),
      managerId: searchParams.get("managerId"),
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    })

    const where: Record<string, unknown> = {}
    
    if (params.status) {
      where.status = params.status
    }
    if (params.clientId) {
      where.clientId = params.clientId
    }
    if (params.managerId) {
      where.createdByUserId = params.managerId
    }
    if (params.search) {
      where.OR = [
        { dealNumber: { contains: params.search, mode: "insensitive" } },
        { productName: { contains: params.search, mode: "insensitive" } },
        { client: { fullName: { contains: params.search, mode: "insensitive" } } },
        { client: { phone: { contains: params.search } } },
      ]
    }

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        orderBy: { [params.sortBy || "createdAt"]: params.sortOrder },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: {
          client: {
            select: { id: true, fullName: true, phone: true },
          },
          createdByUser: {
            select: { id: true, fullName: true },
          },
          _count: {
            select: { installments: true, payments: true },
          },
        },
      }),
      prisma.deal.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: deals,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    })
  } catch (error) {
    console.error("Get deals error:", error)
    return NextResponse.json(
      { success: false, error: "Ошибка при получении сделок" },
      { status: 500 }
    )
  }
}

// POST - Create deal with installments
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const data = dealSchema.parse(body)

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: data.clientId },
    })
    if (!client) {
      return NextResponse.json(
        { success: false, error: "Клиент не найден" },
        { status: 404 }
      )
    }

    // Calculate deal using our single source of truth
    const calculation = calculateDeal({
      purchasePrice: data.purchasePrice,
      months: data.months,
      downPayment: data.downPayment,
      startDate: data.startDate,
      customMarkup: data.months === 3 ? data.markupPercentFinal : undefined,
    })

    // Generate unique deal number
    let dealNumber = generateDealNumber()
    let attempts = 0
    while (attempts < 10) {
      const existing = await prisma.deal.findUnique({ where: { dealNumber } })
      if (!existing) break
      dealNumber = generateDealNumber()
      attempts++
    }

    // Create deal with installments in a transaction
    const deal = await prisma.$transaction(async (tx) => {
      // Create the deal
      const newDeal = await tx.deal.create({
        data: {
          dealNumber,
          clientId: data.clientId,
          productName: data.productName,
          productSku: data.productSku || null,
          purchasePrice: calculation.purchasePrice,
          markupPercentFinal: calculation.markupPercentFinal,
          salePrice: calculation.salePrice,
          downPayment: calculation.downPayment,
          amountToFinance: calculation.amountToFinance,
          months: calculation.months,
          startDate: data.startDate,
          monthlyBasePayment: calculation.monthlyBasePayment,
          lastPaymentAdjustment: calculation.lastPaymentAdjustment,
          status: "DRAFT",
          createdByUserId: session.user.id,
        },
      })

      // Create installments
      await tx.installment.createMany({
        data: calculation.installments.map((inst) => ({
          dealId: newDeal.id,
          index: inst.index,
          dueDate: inst.dueDate,
          amount: inst.amount,
          status: "DUE",
        })),
      })

      return newDeal
    })

    // Fetch full deal with installments
    const fullDeal = await prisma.deal.findUnique({
      where: { id: deal.id },
      include: {
        client: true,
        installments: {
          orderBy: { index: "asc" },
        },
        createdByUser: {
          select: { id: true, fullName: true },
        },
      },
    })

    // Audit log
    await logCreate(session.user.id, "Deal", deal.id, deal as unknown as Record<string, unknown>)

    return NextResponse.json({ success: true, data: fullDeal })
  } catch (error) {
    console.error("Create deal error:", error)
    if (error instanceof Error) {
      if (error.name === "ZodError") {
        return NextResponse.json(
          { success: false, error: "Проверьте правильность введённых данных" },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: "Ошибка при создании сделки" },
      { status: 500 }
    )
  }
}
