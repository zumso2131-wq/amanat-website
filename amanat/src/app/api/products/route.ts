import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { productSchema, paginationSchema } from "@/lib/validations"
import { auth } from "@/lib/auth"
import { logCreate } from "@/lib/audit"

// GET - List products
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const params = paginationSchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search"),
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    })

    const category = searchParams.get("category")
    const isActive = searchParams.get("isActive")

    const where: Record<string, unknown> = {}
    
    if (category) where.category = category
    if (isActive !== null) where.isActive = isActive === "true"
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { sku: { contains: params.search, mode: "insensitive" } },
        { category: { contains: params.search, mode: "insensitive" } },
      ]
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { [params.sortBy || "createdAt"]: params.sortOrder },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: products,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    })
  } catch (error) {
    console.error("Get products error:", error)
    return NextResponse.json(
      { success: false, error: "Ошибка при получении товаров" },
      { status: 500 }
    )
  }
}

// POST - Create product (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const data = productSchema.parse(body)

    // Check if SKU already exists
    const existing = await prisma.product.findUnique({
      where: { sku: data.sku },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Товар с таким артикулом уже существует" },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        category: data.category || null,
        description: data.description || null,
        defaultPurchasePrice: data.defaultPurchasePrice,
        imageUrl: data.imageUrl || null,
      },
    })

    // Audit log
    await logCreate(session.user.id, "Product", product.id, product as Record<string, unknown>)

    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    console.error("Create product error:", error)
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Проверьте правильность введённых данных" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: "Ошибка при создании товара" },
      { status: 500 }
    )
  }
}
