// ============================================
// API СДЕЛКИ — GET / PUT / DELETE
// ============================================

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireManager, requireAdmin } from "@/lib/auth"
import { logUpdate, logDelete } from "@/lib/audit"
import { z } from "zod"

// Схема обновления статуса
const updateStatusSchema = z.object({
  status: z.enum(["DRAFT", "ACTIVE", "CLOSED", "CANCELED"]),
})

// ============================================
// GET — Детали сделки
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireManager()
    const { id } = await params

    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        client: true,
        createdByUser: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
        installments: {
          orderBy: { index: "asc" },
        },
        payments: {
          orderBy: { paidAt: "desc" },
        },
      },
    })

    if (!deal) {
      return NextResponse.json(
        { success: false, error: "Сделка не найдена" },
        { status: 404 }
      )
    }

    // Расчёт выплаченной суммы и остатка
    const totalPaid = deal.payments.reduce((sum: number, p) => sum + p.amount, 0)
    const remaining = deal.amountToFinance - totalPaid
    const progress = deal.amountToFinance > 0 
      ? Math.round((totalPaid / deal.amountToFinance) * 100) 
      : 0

    // Количество просроченных платежей
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const overdueCount = deal.installments.filter(
      (i) => i.status !== "PAID" && new Date(i.dueDate) < today
    ).length

    // Маппинг для фронта
    return NextResponse.json({
      success: true,
      data: {
        ...deal,
        manager: deal.createdByUser,
        totalPaid,
        remaining,
        progress,
        overdueCount,
      },
    })
  } catch (error) {
    console.error("GET /api/deals/[id] error:", error)
    return NextResponse.json(
      { success: false, error: "Ошибка загрузки сделки" },
      { status: 500 }
    )
  }
}

// ============================================
// PUT — Обновление статуса сделки
// ============================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireManager()
    const { id } = await params

    const body = await request.json()
    const { status } = updateStatusSchema.parse(body)

    // Проверка существования сделки
    const existingDeal = await prisma.deal.findUnique({
      where: { id },
      include: { installments: true },
    })

    if (!existingDeal) {
      return NextResponse.json(
        { success: false, error: "Сделка не найдена" },
        { status: 404 }
      )
    }

    // Проверка разрешённых переходов статуса
    const allowedTransitions: Record<string, string[]> = {
      DRAFT: ["ACTIVE", "CANCELED"],
      ACTIVE: ["CLOSED", "CANCELED"],
      CLOSED: [], // Закрытую сделку нельзя изменить
      CANCELED: [], // Отменённую сделку нельзя изменить
    }

    if (!allowedTransitions[existingDeal.status]?.includes(status)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Нельзя изменить статус с "${existingDeal.status}" на "${status}"` 
        },
        { status: 400 }
      )
    }

    // Обновление статуса
    const updatedDeal = await prisma.deal.update({
      where: { id },
      data: { status },
      include: {
        client: true,
        installments: { orderBy: { index: "asc" } },
      },
    })

    // Аудит
    await logUpdate(user.id, "Deal", id, 
      { status: existingDeal.status },
      { status }
    )

    return NextResponse.json({
      success: true,
      data: updatedDeal,
      message: `Статус сделки изменён на "${status}"`,
    })
  } catch (error) {
    console.error("PUT /api/deals/[id] error:", error)
    return NextResponse.json(
      { success: false, error: "Ошибка обновления сделки" },
      { status: 500 }
    )
  }
}

// ============================================
// DELETE — Удаление сделки (только DRAFT, только ADMIN)
// ============================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin()
    const { id } = await params

    // Проверка сделки
    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        payments: true,
        installments: true,
      },
    })

    if (!deal) {
      return NextResponse.json(
        { success: false, error: "Сделка не найдена" },
        { status: 404 }
      )
    }

    // Нельзя удалять активные/закрытые сделки
    if (deal.status !== "DRAFT" && deal.status !== "CANCELED") {
      return NextResponse.json(
        { success: false, error: "Можно удалять только черновики и отменённые сделки" },
        { status: 400 }
      )
    }

    // Нельзя удалять если есть платежи
    if (deal.payments.length > 0) {
      return NextResponse.json(
        { success: false, error: "Нельзя удалить сделку с платежами" },
        { status: 400 }
      )
    }

    // Удаление в транзакции
    await prisma.$transaction(async (tx) => {
      // Сначала удаляем installments
      await tx.installment.deleteMany({ where: { dealId: id } })
      // Затем сделку
      await tx.deal.delete({ where: { id } })
    })

    // Аудит
    await logDelete(user.id, "Deal", id, {
      dealNumber: deal.dealNumber,
      clientId: deal.clientId,
      productName: deal.productName,
    })

    return NextResponse.json({
      success: true,
      message: "Сделка удалена",
    })
  } catch (error) {
    console.error("DELETE /api/deals/[id] error:", error)
    return NextResponse.json(
      { success: false, error: "Ошибка удаления сделки" },
      { status: 500 }
    )
  }
}
