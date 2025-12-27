import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"
import { z } from "zod"
import { Decimal } from "@prisma/client/runtime/library"

const paymentSchema = z.object({
  dealId: z.string(),
  installmentId: z.string().optional(),
  amount: z.number().positive(),
  method: z.enum(["CASH", "CARD", "TRANSFER"]).default("CASH"),
  comment: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const dealId = searchParams.get("dealId")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

    const where: any = {}
    if (dealId) {
      where.dealId = dealId
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { paidAt: "desc" },
        include: {
          deal: {
            include: {
              client: true,
            },
          },
          installment: true,
          createdByUser: {
            select: {
              id: true,
              fullName: true,
              phone: true,
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ])

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Payments GET error:", error)
    return NextResponse.json(
      { error: "Ошибка получения платежей" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const data = paymentSchema.parse(body)

    // Получаем сделку
    const deal = await prisma.deal.findUnique({
      where: { id: data.dealId },
    })

    if (!deal) {
      return NextResponse.json({ error: "Сделка не найдена" }, { status: 404 })
    }

    // Создаём платёж
    const payment = await prisma.payment.create({
      data: {
        dealId: data.dealId,
        installmentId: data.installmentId,
        amount: new Decimal(data.amount),
        method: data.method,
        comment: data.comment,
        createdByUserId: session.user.id,
      },
    })

    // Если платёж привязан к конкретному платежу, обновляем его статус
    if (data.installmentId) {
      const installment = await prisma.installment.findUnique({
        where: { id: data.installmentId },
      })

      if (installment) {
        const paidAmount = Number(installment.amount)
        const paymentAmount = data.amount

        // Проверяем, покрывает ли платёж сумму платежа
        const paymentsForInstallment = await prisma.payment.aggregate({
          where: { installmentId: data.installmentId },
          _sum: { amount: true },
        })

        const totalPaid = Number(paymentsForInstallment._sum.amount || 0)

        if (totalPaid >= paidAmount) {
          await prisma.installment.update({
            where: { id: data.installmentId },
            data: {
              status: "PAID",
              paidAt: new Date(),
            },
          })
        }
      }
    }

    // Обновляем статусы просроченных платежей
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.installment.updateMany({
      where: {
        dealId: data.dealId,
        dueDate: { lt: today },
        status: { not: "PAID" },
      },
      data: {
        status: "OVERDUE",
      },
    })

    await createAuditLog({
      actorUserId: session.user.id,
      entity: "Payment",
      entityId: payment.id,
      action: "CREATE",
      diffJson: data,
    })

    return NextResponse.json(payment)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error("Payment POST error:", error)
    return NextResponse.json(
      { error: "Ошибка создания платежа" },
      { status: 500 }
    )
  }
}
