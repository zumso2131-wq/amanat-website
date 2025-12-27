import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { applicationSchema } from "@/lib/validations"
import { auth } from "@/lib/auth"

// POST - Create application (public)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = applicationSchema.parse(body)

    const application = await prisma.application.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        product: data.product || null,
        message: data.message || null,
      },
    })

    return NextResponse.json({ success: true, data: application })
  } catch (error) {
    console.error("Application error:", error)
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Проверьте правильность введённых данных" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: "Ошибка при создании заявки" },
      { status: 500 }
    )
  }
}

// GET - List applications (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status")

    const where = status ? { status } : {}

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.application.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: applications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Get applications error:", error)
    return NextResponse.json(
      { success: false, error: "Ошибка при получении заявок" },
      { status: 500 }
    )
  }
}
