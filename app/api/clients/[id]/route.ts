import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"
import { z } from "zod"

const clientUpdateSchema = z.object({
  fullName: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  passportNumber: z.string().optional(),
  passportIssuedBy: z.string().optional(),
  passportIssuedAt: z.string().optional(),
  address: z.string().optional(),
  note: z.string().optional(),
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

    const client = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        deals: {
          include: {
            installments: true,
            payments: true,
          },
        },
      },
    })

    if (!client) {
      return NextResponse.json({ error: "Клиент не найден" }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error("Client GET error:", error)
    return NextResponse.json(
      { error: "Ошибка получения клиента" },
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
    const data = clientUpdateSchema.parse(body)

    const oldClient = await prisma.client.findUnique({
      where: { id: params.id },
    })

    if (!oldClient) {
      return NextResponse.json({ error: "Клиент не найден" }, { status: 404 })
    }

    const client = await prisma.client.update({
      where: { id: params.id },
      data: {
        ...data,
        passportIssuedAt: data.passportIssuedAt
          ? new Date(data.passportIssuedAt)
          : undefined,
      },
    })

    await createAuditLog({
      actorUserId: session.user.id,
      entity: "Client",
      entityId: client.id,
      action: "UPDATE",
      diffJson: { old: oldClient, new: client },
    })

    return NextResponse.json(client)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error("Client PATCH error:", error)
    return NextResponse.json(
      { error: "Ошибка обновления клиента" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await prisma.client.findUnique({
      where: { id: params.id },
    })

    if (!client) {
      return NextResponse.json({ error: "Клиент не найден" }, { status: 404 })
    }

    await prisma.client.delete({
      where: { id: params.id },
    })

    await createAuditLog({
      actorUserId: session.user.id,
      entity: "Client",
      entityId: params.id,
      action: "DELETE",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Client DELETE error:", error)
    return NextResponse.json(
      { error: "Ошибка удаления клиента" },
      { status: 500 }
    )
  }
}
