// ============================================
// API КЛИЕНТА — GET / PUT / DELETE
// ============================================

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireManager, requireAdmin } from "@/lib/auth"
import { clientSchema } from "@/lib/validations"
import { logUpdate, logDelete } from "@/lib/audit"

// ============================================
// GET — Детали клиента
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireManager()
    const { id } = await params

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        deals: {
          orderBy: { createdAt: "desc" },
          include: {
            _count: {
              select: { payments: true, installments: true },
            },
          },
        },
      },
    })

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Клиент не найден" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: client,
    })
  } catch (error) {
    console.error("GET /api/clients/[id] error:", error)
    return NextResponse.json(
      { success: false, error: "Ошибка загрузки клиента" },
      { status: 500 }
    )
  }
}

// ============================================
// PUT — Обновление клиента
// ============================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireManager()
    const { id } = await params

    const body = await request.json()
    const validatedData = clientSchema.parse(body)

    // Проверка существования
    const existingClient = await prisma.client.findUnique({
      where: { id },
    })

    if (!existingClient) {
      return NextResponse.json(
        { success: false, error: "Клиент не найден" },
        { status: 404 }
      )
    }

    // Проверка уникальности телефона (если меняется)
    if (validatedData.phone !== existingClient.phone) {
      const phoneExists = await prisma.client.findUnique({
        where: { phone: validatedData.phone },
      })
      if (phoneExists) {
        return NextResponse.json(
          { success: false, error: "Клиент с таким телефоном уже существует" },
          { status: 400 }
        )
      }
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        fullName: validatedData.fullName,
        phone: validatedData.phone,
        iin: validatedData.iin || null,
        passportNumber: validatedData.passportNumber || null,
        passportIssuedBy: validatedData.passportIssuedBy || null,
        passportIssuedAt: validatedData.passportIssuedAt || null,
        address: validatedData.address || null,
        note: validatedData.note || null,
      },
    })

    // Аудит
    await logUpdate(user.id, "Client", id, existingClient, updatedClient)

    return NextResponse.json({
      success: true,
      data: updatedClient,
      message: "Клиент обновлён",
    })
  } catch (error) {
    console.error("PUT /api/clients/[id] error:", error)
    return NextResponse.json(
      { success: false, error: "Ошибка обновления клиента" },
      { status: 500 }
    )
  }
}

// ============================================
// DELETE — Удаление клиента
// ============================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin()
    const { id } = await params

    const client = await prisma.client.findUnique({
      where: { id },
      include: { deals: true },
    })

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Клиент не найден" },
        { status: 404 }
      )
    }

    // Нельзя удалять клиента с активными сделками
    const activeDeals = client.deals.filter(
      (d) => d.status === "ACTIVE" || d.status === "DRAFT"
    )
    if (activeDeals.length > 0) {
      return NextResponse.json(
        { success: false, error: "Нельзя удалить клиента с активными сделками" },
        { status: 400 }
      )
    }

    await prisma.client.delete({ where: { id } })

    // Аудит
    await logDelete(user.id, "Client", id, {
      fullName: client.fullName,
      phone: client.phone,
    })

    return NextResponse.json({
      success: true,
      message: "Клиент удалён",
    })
  } catch (error) {
    console.error("DELETE /api/clients/[id] error:", error)
    return NextResponse.json(
      { success: false, error: "Ошибка удаления клиента" },
      { status: 500 }
    )
  }
}
