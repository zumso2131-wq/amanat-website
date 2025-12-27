// ============================================
// API КЛИЕНТОВ — GET (список) + POST (создание)
// ============================================

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireManager } from "@/lib/auth"
import { clientSchema, paginationSchema } from "@/lib/validations"
import { logCreate } from "@/lib/audit"

// ============================================
// GET — Список клиентов
// ============================================

export async function GET(request: NextRequest) {
  try {
    await requireManager()

    const { searchParams } = new URL(request.url)
    const params = paginationSchema.parse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 100,
      search: searchParams.get("search") || "",
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    })

    const where: Record<string, unknown> = {}

    if (params.search) {
      where.OR = [
        { fullName: { contains: params.search, mode: "insensitive" } },
        { phone: { contains: params.search, mode: "insensitive" } },
        { iin: { contains: params.search, mode: "insensitive" } },
      ]
    }

    const total = await prisma.client.count({ where })

    const clients = await prisma.client.findMany({
      where,
      include: {
        _count: {
          select: { deals: true },
        },
      },
      orderBy: {
        [params.sortBy || "createdAt"]: params.sortOrder,
      },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    })

    return NextResponse.json({
      success: true,
      data: clients,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    })
  } catch (error) {
    console.error("GET /api/clients error:", error)
    return NextResponse.json(
      { success: false, error: "Ошибка загрузки клиентов" },
      { status: 500 }
    )
  }
}

// ============================================
// POST — Создание клиента
// ============================================

export async function POST(request: NextRequest) {
  try {
    const user = await requireManager()

    const body = await request.json()
    const validatedData = clientSchema.parse(body)

    // Проверка уникальности телефона
    const existingClient = await prisma.client.findUnique({
      where: { phone: validatedData.phone },
    })

    if (existingClient) {
      return NextResponse.json(
        { success: false, error: "Клиент с таким телефоном уже существует" },
        { status: 400 }
      )
    }

    const client = await prisma.client.create({
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

    await logCreate(user.id, "Client", client.id, {
      fullName: client.fullName,
      phone: client.phone,
    })

    return NextResponse.json({
      success: true,
      data: client,
      message: "Клиент создан",
    })
  } catch (error) {
    console.error("POST /api/clients error:", error)
    return NextResponse.json(
      { success: false, error: "Ошибка создания клиента" },
      { status: 500 }
    )
  }
}
