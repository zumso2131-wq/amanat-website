import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"
import { calculateDeal, calculateDueDate } from "@/lib/calculations"
import { z } from "zod"
import { Decimal } from "@prisma/client/runtime/library"

const dealSchema = z.object({
  clientId: z.string(),
  productName: z.string().min(1),
  purchasePrice: z.number().positive(),
  markupPercentFinal: z.number().min(0).optional(),
  downPayment: z.number().min(0).default(0),
  months: z.number().int().min(3).max(12),
  startDate: z.string(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status")
    const clientId = searchParams.get("clientId")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

    const where: any = {}
    
    if (search) {
      where.productName = { contains: search, mode: "insensitive" as const }
    }
    if (status) {
      where.status = status
    }
    if (clientId) {
      where.clientId = clientId
    }
    if (session.user.role === "CLIENT") {
      // Клиенты видят только свои сделки
      const client = await prisma.client.findFirst({
        where: { phone: session.user.phone },
      })
      if (client) {
        where.clientId = client.id
      } else {
        return NextResponse.json({ deals: [], pagination: { page, limit, total: 0, pages: 0 } })
      }
    }

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          client: true,
          installments: {
            orderBy: { index: "asc" },
          },
          payments: true,
        },
      }),
      prisma.deal.count({ where }),
    ])

    return NextResponse.json({
      deals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Deals GET error:", error)
    return NextResponse.json(
      { error: "Ошибка получения сделок" },
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
    const data = dealSchema.parse(body)

    // Вычисляем параметры сделки
    const calculation = calculateDeal({
      purchasePrice: data.purchasePrice,
      months: data.months,
      markupPercentFinal: data.markupPercentFinal,
      downPayment: data.downPayment,
    })

    const startDate = new Date(data.startDate)

    // Создаём сделку
    const deal = await prisma.deal.create({
      data: {
        clientId: data.clientId,
        productName: data.productName,
        purchasePrice: new Decimal(data.purchasePrice),
        markupPercentFinal: new Decimal(calculation.markupPercentFinal),
        salePrice: new Decimal(calculation.salePrice),
        downPayment: new Decimal(calculation.downPayment),
        amountToFinance: new Decimal(calculation.amountToFinance),
        months: data.months,
        startDate,
        monthlyBasePayment: new Decimal(calculation.monthlyBasePayment),
        lastPaymentAdjustment: new Decimal(calculation.lastPaymentAdjustment),
        status: "DRAFT",
        createdByUserId: session.user.id,
      },
    })

    // Создаём график платежей
    const installments = await Promise.all(
      calculation.installments.map((inst) =>
        prisma.installment.create({
          data: {
            dealId: deal.id,
            index: inst.index,
            dueDate: calculateDueDate(startDate, inst.index),
            amount: new Decimal(inst.amount),
            status: "DUE",
          },
        })
      )
    )

    await createAuditLog({
      actorUserId: session.user.id,
      entity: "Deal",
      entityId: deal.id,
      action: "CREATE",
      diffJson: { deal, installments: installments.length },
    })

    return NextResponse.json({
      ...deal,
      installments,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error("Deal POST error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ошибка создания сделки" },
      { status: 500 }
    )
  }
}
