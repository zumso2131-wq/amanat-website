import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { paymentSchema, paginationSchema } from "@/lib/validations"
import { auth } from "@/lib/auth"
import { logCreate } from "@/lib/audit"

// GET - List payments
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const params = paginationSchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search"),
      sortBy: searchParams.get("sortBy") || "paidAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    })

    const dealId = searchParams.get("dealId")
    const method = searchParams.get("method")

    const where: Record<string, unknown> = {}
    if (dealId) where.dealId = dealId
    if (method) where.method = method
    if (params.search) {
      where.OR = [
        { deal: { dealNumber: { contains: params.search, mode: "insensitive" } } },
        { deal: { client: { fullName: { contains: params.search, mode: "insensitive" } } } },
      ]
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { [params.sortBy || "paidAt"]: params.sortOrder },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: {
          deal: {
            select: {
              id: true,
              dealNumber: true,
              productName: true,
              client: {
                select: { id: true, fullName: true, phone: true },
              },
            },
          },
          installment: {
            select: { id: true, index: true, dueDate: true, amount: true },
          },
        },
      }),
      prisma.payment.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: payments,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    })
  } catch (error) {
    console.error("Get payments error:", error)
    return NextResponse.json(
      { success: false, error: "Ошибка при получении платежей" },
      { status: 500 }
    )
  }
}

// POST - Create payment
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const data = paymentSchema.parse(body)

    // Verify deal exists and is active
    const deal = await prisma.deal.findUnique({
      where: { id: data.dealId },
      include: {
        installments: {
          orderBy: { index: "asc" },
        },
        payments: true,
      },
    })

    if (!deal) {
      return NextResponse.json(
        { success: false, error: "Сделка не найдена" },
        { status: 404 }
      )
    }

    if (deal.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: "Платежи принимаются только по активным сделкам" },
        { status: 400 }
      )
    }

    // Calculate remaining amount
    const totalPaid = deal.payments.reduce((sum, p) => sum + p.amount, 0)
    const remaining = deal.amountToFinance - totalPaid

    if (data.amount > remaining) {
      return NextResponse.json(
        { success: false, error: `Сумма платежа превышает остаток (${remaining} ₸)` },
        { status: 400 }
      )
    }

    // Find installment to link payment to (if not specified)
    let installmentId = data.installmentId || null
    if (!installmentId) {
      // Find first unpaid installment
      const unpaidInstallment = deal.installments.find(i => i.status !== "PAID")
      if (unpaidInstallment) {
        installmentId = unpaidInstallment.id
      }
    }

    // Create payment and update installment status in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create payment
      const payment = await tx.payment.create({
        data: {
          dealId: data.dealId,
          installmentId,
          amount: data.amount,
          method: data.method,
          comment: data.comment || null,
        },
      })

      // If linked to installment, check if it's fully paid
      if (installmentId) {
        const installment = deal.installments.find(i => i.id === installmentId)
        if (installment) {
          // Get all payments for this installment
          const installmentPayments = await tx.payment.findMany({
            where: { installmentId },
          })
          const totalInstallmentPaid = installmentPayments.reduce((sum, p) => sum + p.amount, 0)

          if (totalInstallmentPaid >= installment.amount) {
            await tx.installment.update({
              where: { id: installmentId },
              data: { 
                status: "PAID", 
                paidAt: new Date() 
              },
            })
          }
        }
      }

      // Check if deal is fully paid
      const newTotalPaid = totalPaid + data.amount
      if (newTotalPaid >= deal.amountToFinance) {
        // Mark all installments as paid
        await tx.installment.updateMany({
          where: { dealId: deal.id, status: { not: "PAID" } },
          data: { status: "PAID", paidAt: new Date() },
        })
        // Close the deal
        await tx.deal.update({
          where: { id: deal.id },
          data: { status: "CLOSED" },
        })
      }

      return payment
    })

    // Fetch full payment with relations
    const payment = await prisma.payment.findUnique({
      where: { id: result.id },
      include: {
        deal: {
          select: {
            id: true,
            dealNumber: true,
            client: { select: { fullName: true } },
          },
        },
        installment: true,
      },
    })

    // Audit log
    await logCreate(session.user.id, "Payment", result.id, result as unknown as Record<string, unknown>)

    return NextResponse.json({ success: true, data: payment })
  } catch (error) {
    console.error("Create payment error:", error)
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Проверьте правильность введённых данных" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: "Ошибка при создании платежа" },
      { status: 500 }
    )
  }
}
