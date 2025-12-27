import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"
import { z } from "zod"

const clientSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(1),
  passportNumber: z.string().optional(),
  passportIssuedBy: z.string().optional(),
  passportIssuedAt: z.string().optional(),
  address: z.string().optional(),
  note: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { fullName: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { deals: true },
          },
        },
      }),
      prisma.client.count({ where }),
    ])

    return NextResponse.json({
      clients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Clients GET error:", error)
    return NextResponse.json(
      { error: "Ошибка получения клиентов" },
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
    const data = clientSchema.parse(body)

    const client = await prisma.client.create({
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
      action: "CREATE",
      diffJson: data,
    })

    return NextResponse.json(client)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error("Client POST error:", error)
    return NextResponse.json(
      { error: "Ошибка создания клиента" },
      { status: 500 }
    )
  }
}
