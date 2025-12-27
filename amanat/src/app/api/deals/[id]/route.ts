import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { logUpdate, logDelete } from "@/lib/audit"
import { z } from "zod"

// GET - Get single deal with all details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        client: true,
        installments: {
          orderBy: { index: "asc" },
          include: {
            payments: true,
          },
        },
        payments: {
          orderBy: { paidAt: "desc" },
        },
        documents: {
          orderBy: { createdAt: "desc" },
        },
        createdByUser: {
          select: { id: true, fullName: true, role: true },
        },
      },
    })

    if (!deal) {
      return NextResponse.json(
        { success: false, error: "Сделка не найдена" },
        { status: 404 }
      )
    }

    // Calculate additional info
    const totalPaid = deal.payments.reduce((sum, p) => sum + p.amount, 0)
    const remaining = deal.amountToFinance - totalPaid
    const paidInstallments = deal.installments.filter(i => i.status === "PAID").length
    const overdueInstallments = deal.installments.filter(i => {
      if (i.status === "PAID") return false
      return new Date(i.dueDate) < new Date()
    }).length

    return NextResponse.json({
      success: true,
      data: {
        ...deal,
        totalPaid,
        remaining,
        paidInstallments,
        overdueInstallments,
        progress: deal.installments.length > 0 
          ? Math.round((paidInstallments / deal.installments.length) * 100)
          : 0,
      },
    })
  } catch (error) {
    console.error("Get deal error:", error)
    return NextResponse.json(
      { success: false, error: "Ошибка при получении сделки" },
      { status: 500 }
    )
  }
}

// PUT - Update deal status
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    const updateSchema = z.object({
      status: z.enum(["DRAFT", "ACTIVE", "CLOSED", "CANCELED"]).optional(),
    })

    const data = updateSchema.parse(body)

    const existing = await prisma.deal.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Сделка не найдена" },
        { status: 404 }
      )
    }

    // Validate status transitions
    if (data.status) {
      const validTransitions: Record<string, string[]> = {
        DRAFT: ["ACTIVE", "CANCELED"],
        ACTIVE: ["CLOSED", "CANCELED"],
        CLOSED: [],
        CANCELED: [],
      }

      if (!validTransitions[existing.status].includes(data.status)) {
        return NextResponse.json(
          { success: false, error: `Невозможно изменить статус с ${existing.status} на ${data.status}` },
          { status: 400 }
        )
      }
    }

    const deal = await prisma.deal.update({
      where: { id },
      data: {
        status: data.status,
      },
      include: {
        client: true,
        installments: {
          orderBy: { index: "asc" },
        },
      },
    })

    // Audit log
    await logUpdate(
      session.user.id,
      "Deal",
      deal.id,
      existing as unknown as Record<string, unknown>,
      deal as unknown as Record<string, unknown>
    )

    return NextResponse.json({ success: true, data: deal })
  } catch (error) {
    console.error("Update deal error:", error)
    return NextResponse.json(
      { success: false, error: "Ошибка при обновлении сделки" },
      { status: 500 }
    )
  }
}

// DELETE - Delete deal (admin only, draft only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.deal.findUnique({
      where: { id },
      include: { payments: true },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Сделка не найдена" },
        { status: 404 }
      )
    }

    if (existing.status !== "DRAFT") {
      return NextResponse.json(
        { success: false, error: "Можно удалить только сделки в статусе Черновик" },
        { status: 400 }
      )
    }

    if (existing.payments.length > 0) {
      return NextResponse.json(
        { success: false, error: "Невозможно удалить сделку с платежами" },
        { status: 400 }
      )
    }

    // Delete in transaction (installments will be cascade deleted)
    await prisma.deal.delete({ where: { id } })

    // Audit log
    await logDelete(session.user.id, "Deal", id, existing as unknown as Record<string, unknown>)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete deal error:", error)
    return NextResponse.json(
      { success: false, error: "Ошибка при удалении сделки" },
      { status: 500 }
    )
  }
}
