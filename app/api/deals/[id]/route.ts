import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"
import { z } from "zod"

const dealUpdateSchema = z.object({
  status: z.enum(["DRAFT", "ACTIVE", "CLOSED", "CANCELED"]).optional(),
  productName: z.string().min(1).optional(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const deal = await prisma.deal.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        installments: {
          orderBy: { index: "asc" },
        },
        payments: {
          orderBy: { paidAt: "desc" },
        },
        documents: true,
        createdByUser: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
      },
    })

    if (!deal) {
      return NextResponse.json({ error: "Сделка не найдена" }, { status: 404 })
    }

    // Проверка доступа для клиентов
    if (session.user.role === "CLIENT") {
      const client = await prisma.client.findFirst({
        where: { phone: session.user.phone },
      })
      if (!client || deal.clientId !== client.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    return NextResponse.json(deal)
  } catch (error) {
    console.error("Deal GET error:", error)
    return NextResponse.json(
      { error: "Ошибка получения сделки" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const data = dealUpdateSchema.parse(body)

    const oldDeal = await prisma.deal.findUnique({
      where: { id: params.id },
    })

    if (!oldDeal) {
      return NextResponse.json({ error: "Сделка не найдена" }, { status: 404 })
    }

    const deal = await prisma.deal.update({
      where: { id: params.id },
      data,
    })

    await createAuditLog({
      actorUserId: session.user.id,
      entity: "Deal",
      entityId: deal.id,
      action: "UPDATE",
      diffJson: { old: oldDeal, new: deal },
    })

    return NextResponse.json(deal)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error("Deal PATCH error:", error)
    return NextResponse.json(
      { error: "Ошибка обновления сделки" },
      { status: 500 }
    )
  }
}
