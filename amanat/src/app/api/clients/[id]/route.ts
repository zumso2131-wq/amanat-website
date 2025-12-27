import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { clientSchema } from "@/lib/validations"
import { auth } from "@/lib/auth"
import { logUpdate, logDelete } from "@/lib/audit"

// GET - Get single client
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        deals: {
          include: {
            installments: true,
            payments: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Клиент не найден" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: client })
  } catch (error) {
    console.error("Get client error:", error)
    return NextResponse.json(
      { success: false, error: "Ошибка при получении клиента" },
      { status: 500 }
    )
  }
}

// PUT - Update client
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
    const data = clientSchema.parse(body)

    const existing = await prisma.client.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Клиент не найден" },
        { status: 404 }
      )
    }

    // Check if phone is already taken by another client
    if (data.phone !== existing.phone) {
      const phoneExists = await prisma.client.findFirst({
        where: { phone: data.phone, id: { not: id } },
      })
      if (phoneExists) {
        return NextResponse.json(
          { success: false, error: "Клиент с таким номером телефона уже существует" },
          { status: 400 }
        )
      }
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        iin: data.iin || null,
        passportNumber: data.passportNumber || null,
        passportIssuedBy: data.passportIssuedBy || null,
        passportIssuedAt: data.passportIssuedAt || null,
        address: data.address || null,
        note: data.note || null,
      },
    })

    // Audit log
    await logUpdate(
      session.user.id,
      "Client",
      client.id,
      existing as Record<string, unknown>,
      client as Record<string, unknown>
    )

    return NextResponse.json({ success: true, data: client })
  } catch (error) {
    console.error("Update client error:", error)
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Проверьте правильность введённых данных" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: "Ошибка при обновлении клиента" },
      { status: 500 }
    )
  }
}

// DELETE - Delete client
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

    const existing = await prisma.client.findUnique({
      where: { id },
      include: { _count: { select: { deals: true } } },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Клиент не найден" },
        { status: 404 }
      )
    }

    if (existing._count.deals > 0) {
      return NextResponse.json(
        { success: false, error: "Невозможно удалить клиента с активными сделками" },
        { status: 400 }
      )
    }

    await prisma.client.delete({ where: { id } })

    // Audit log
    await logDelete(session.user.id, "Client", id, existing as Record<string, unknown>)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete client error:", error)
    return NextResponse.json(
      { success: false, error: "Ошибка при удалении клиента" },
      { status: 500 }
    )
  }
}
