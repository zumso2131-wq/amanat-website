import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { clientSchema, paginationSchema } from "@/lib/validations"
import { auth } from "@/lib/auth"
import { logCreate } from "@/lib/audit"

// GET - List clients
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const params = paginationSchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search"),
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    })

    const where = params.search
      ? {
          OR: [
            { fullName: { contains: params.search, mode: "insensitive" as const } },
            { phone: { contains: params.search } },
            { iin: { contains: params.search } },
          ],
        }
      : {}

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy: { [params.sortBy || "createdAt"]: params.sortOrder },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: {
          _count: {
            select: { deals: true },
          },
        },
      }),
      prisma.client.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: clients,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    })
  } catch (error) {
    console.error("Get clients error:", error)
    return NextResponse.json(
      { success: false, error: "Ошибка при получении клиентов" },
      { status: 500 }
    )
  }
}

// POST - Create client
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const data = clientSchema.parse(body)

    // Check if phone already exists
    const existing = await prisma.client.findUnique({
      where: { phone: data.phone },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Клиент с таким номером телефона уже существует" },
        { status: 400 }
      )
    }

    const client = await prisma.client.create({
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
    await logCreate(session.user.id, "Client", client.id, client as Record<string, unknown>)

    return NextResponse.json({ success: true, data: client })
  } catch (error) {
    console.error("Create client error:", error)
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Проверьте правильность введённых данных" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: "Ошибка при создании клиента" },
      { status: 500 }
    )
  }
}
