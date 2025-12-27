// ============================================
// API ПЛАТЕЖЕЙ — GET (список) + POST (создание)
// ============================================

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireManager } from "@/lib/auth"
import { paymentSchema, paginationSchema } from "@/lib/validations"
import { logCreate } from "@/lib/audit"

// ============================================
// GET — Список платежей
// ============================================

export async function GET(request: NextRequest) {
  try {
    await requireManager()

    const { searchParams } = new URL(request.url)
    const params = paginationSchema.parse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 50,
      sortBy: searchParams.get("sortBy") || "paidAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    })

    const dealId = searchParams.get("dealId")
    const method = searchParams.get("method")

    const where: Record<string, unknown> = {}
    if (dealId) where.dealId = dealId
    if (method) where.method = method

    const total = await prisma.payment.count({ where })

    const payments = await prisma.payment.findMany({
      where,
      include: {
        deal: {
          select: {
            id: true,
            dealNumber: true,
            productName: true,
            client: {
              select: {
                id: true,
                fullName: true,
                phone: true,
              },
            },
          },
        },
        installment: {
          select: {
            id: true,
            index: true,
            amount: true,
          },
        },
      },
      orderBy: {
        [params.sortBy || "paidAt"]: params.sortOrder,
      },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    })

    return NextResponse.json({
      success: true,
      data: payments,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    })
  } catch (error) {
    console.error("GET /api/payments error:", error)
    return NextResponse.json(
      { success: false, error: "Ошибка загрузки платежей" },
      { status: 500 }
    )
  }
}

// ============================================
// POST — Создание платежа
// ============================================

export async function POST(request: NextRequest) {
  try {
    const user = await requireManager()

    const body = await request.json()
    const validatedData = paymentSchema.parse(body)

    // Проверка сделки
    const deal = await prisma.deal.findUnique({
      where: { id: validatedData.dealId },
      include: {
        payments: true,
        installments: { orderBy: { index: "asc" } },
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
        { success: false, error: "Платежи можно принимать только по активным сделкам" },
        { status: 400 }
      )
    }

    // Расчёт уже оплаченной суммы
    const totalPaid = deal.payments.reduce((sum, p) => sum + p.amount, 0)
    const remaining = deal.amountToFinance - totalPaid

    if (validatedData.amount > remaining) {
      return NextResponse.json(
        { success: false, error: `Сумма превышает остаток (${remaining} ₸)` },
        { status: 400 }
      )
    }

    // Транзакция: платёж + обновление installment
    const result = await prisma.$transaction(async (tx) => {
      // Создаём платёж
      const payment = await tx.payment.create({
        data: {
          dealId: validatedData.dealId,
          installmentId: validatedData.installmentId || null,
          amount: validatedData.amount,
          method: validatedData.method,
          comment: validatedData.comment || null,
          paidAt: new Date(),
        },
      })

      // Если указан installment — обновляем его статус
      if (validatedData.installmentId) {
        const installment = await tx.installment.findUnique({
          where: { id: validatedData.installmentId },
        })

        if (installment && installment.status !== "PAID") {
          // Считаем все платежи по этому installment
          const instPayments = await tx.payment.findMany({
            where: { installmentId: validatedData.installmentId },
          })
          const instPaid = instPayments.reduce((sum, p) => sum + p.amount, 0)

          // Если оплачено полностью — ставим PAID
          if (instPaid >= installment.amount) {
            await tx.installment.update({
              where: { id: validatedData.installmentId },
              data: { 
                status: "PAID",
                paidAt: new Date(),
              },
            })
          }
        }
      } else {
        // Если installmentId не указан — находим первый неоплаченный
        const nextInstallment = deal.installments.find((i) => i.status !== "PAID")
        if (nextInstallment) {
          // Считаем сумму платежей по сделке без привязки к installment
          const newTotalPaid = totalPaid + validatedData.amount
          
          // Считаем сколько installments покрыто
          let coveredAmount = 0
          for (const inst of deal.installments) {
            if (inst.status === "PAID") continue
            if (coveredAmount + inst.amount <= newTotalPaid - (deal.payments
              .filter(p => p.installmentId)
              .reduce((s, p) => s + p.amount, 0))) {
              await tx.installment.update({
                where: { id: inst.id },
                data: { status: "PAID", paidAt: new Date() },
              })
              coveredAmount += inst.amount
            }
          }
        }
      }

      // Проверяем, полностью ли оплачена сделка
      const newTotalPaid = totalPaid + validatedData.amount
      if (newTotalPaid >= deal.amountToFinance) {
        await tx.deal.update({
          where: { id: deal.id },
          data: { status: "CLOSED" },
        })
      }

      return payment
    })

    // Аудит
    await logCreate(user.id, "Payment", result.id, {
      dealId: validatedData.dealId,
      amount: validatedData.amount,
      method: validatedData.method,
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: "Платёж принят",
    })
  } catch (error) {
    console.error("POST /api/payments error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Ошибка создания платежа" },
      { status: 500 }
    )
  }
}
