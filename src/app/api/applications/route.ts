// ============================================
// API ЗАЯВОК — GET (список) + POST (создание)
// ============================================

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireManager } from "@/lib/auth"
import { applicationSchema } from "@/lib/validations"

// ============================================
// GET — Список заявок (только для менеджеров)
// ============================================

export async function GET(request: NextRequest) {
  try {
    await requireManager()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const applications = await prisma.application.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    })

    return NextResponse.json({
      success: true,
      data: applications,
    })
  } catch (error) {
    console.error("GET /api/applications error:", error)
    return NextResponse.json(
      { success: false, error: "Ошибка загрузки заявок" },
      { status: 500 }
    )
  }
}

// ============================================
// POST — Создание заявки (публичный)
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = applicationSchema.parse(body)

    const application = await prisma.application.create({
      data: {
        fullName: validatedData.fullName,
        phone: validatedData.phone,
        product: validatedData.product || null,
        message: validatedData.message || null,
        status: "NEW",
      },
    })

    console.log("New application:", application.id, validatedData.fullName, validatedData.phone)

    return NextResponse.json({
      success: true,
      data: application,
      message: "Заявка успешно создана",
    })
  } catch (error) {
    console.error("POST /api/applications error:", error)
    return NextResponse.json(
      { success: false, error: "Ошибка создания заявки" },
      { status: 500 }
    )
  }
}
