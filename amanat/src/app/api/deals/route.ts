// ============================================
// API СДЕЛОК — GET (список) + POST (создание)
// ============================================

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireManager } from "@/lib/auth"
import { dealSchema, paginationSchema } from "@/lib/validations"
import { calculateDeal, generateDealNumber } from "@/lib/calculations"
import { logCreate } from "@/lib/audit"

// ============================================
// GET — Список сделок
// ============================================

export async function GET(request: NextRequest) {
  try {
    // Проверка прав (ADMIN или MANAGER)
    await requireManager()

    // Параметры запроса
    const { searchParams } = new URL(request.url)
    const params = paginationSchema.parse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 20,
      search: searchParams.get("search") || "",
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    })

    // Фильтры
    const status = searchParams.get("status")
    const clientId = searchParams.get("clientId")
    const createdByUserId = searchParams.get("managerId")

    // Построение WHERE условия
    const where: Record<string, unknown> = {}

    if (params.search) {
      where.OR = [
        { dealNumber: { contains: params.search, mode: "insensitive" } },
        { productName: { contains: params.search, mode: "insensitive" } },
        { client: { fullName: { contains: params.search, mode: "insensitive" } } },
      ]
    }

    if (status) {
      where.status = status
    }

    if (clientId) {
      where.clientId = clientId
    }

    if (createdByUserId) {
      where.createdByUserId = createdByUserId
    }

    // Подсчёт общего количества
    const total = await prisma.deal.count({ where })

    // Получение данных с пагинацией
    const deals = await prisma.deal.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            fullName: true,
          },
        },
        _count: {
          select: {
            installments: true,
            payments: true,
          },
        },
      },
      orderBy: {
        [params.sortBy || "createdAt"]: params.sortOrder,
      },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    })

    // Маппинг для фронтенда (createdByUser -> manager)
    const mappedDeals = deals.map((deal) => ({
      ...deal,
      manager: deal.createdByUser,
    }))

    return NextResponse.json({
      success: true,
      data: mappedDeals,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    })
  } catch (error) {
    console.error("GET /api/deals error:", error)
    return NextResponse.json(
      { success: false, error: "Ошибка загрузки сделок" },
      { status: 500 }
    )
  }
}

// ============================================
// POST — Создание сделки с графиком платежей
// ============================================

export async function POST(request: NextRequest) {
  try {
    // Проверка прав
    const user = await requireManager()

    // Парсинг и валидация данных
    const body = await request.json()
    const validatedData = dealSchema.parse(body)

    // Проверка существования клиента
    const client = await prisma.client.findUnique({
      where: { id: validatedData.clientId },
    })

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Клиент не найден" },
        { status: 404 }
      )
    }

    // ========================================
    // РАСЧЁТ СДЕЛКИ ПО ПРАВИЛАМ AMANAT
    // ========================================
    const calculation = calculateDeal({
      purchasePrice: validatedData.purchasePrice,
      months: validatedData.months,
      downPayment: validatedData.downPayment,
      startDate: validatedData.startDate,
      // Для 3 месяцев используем пользовательскую наценку
      customMarkup: validatedData.months === 3 
        ? validatedData.markupPercentFinal 
        : undefined,
    })

    // Генерация номера сделки
    const dealNumber = generateDealNumber()

    // ========================================
    // ТРАНЗАКЦИЯ: Сделка + График платежей
    // ========================================
    const deal = await prisma.$transaction(async (tx) => {
      // 1. Создание сделки
      const newDeal = await tx.deal.create({
        data: {
          dealNumber,
          clientId: validatedData.clientId,
          createdByUserId: user.id, // Менеджер = создатель сделки
          
          // Товар
          productName: validatedData.productName,
          productSku: validatedData.productSku || null,
          
          // Финансы (фиксируются при создании)
          purchasePrice: calculation.purchasePrice,
          markupPercentFinal: calculation.markupPercentFinal,
          salePrice: calculation.salePrice,
          downPayment: calculation.downPayment,
          amountToFinance: calculation.amountToFinance,
          
          // Расчёт графика
          monthlyBasePayment: calculation.monthlyBasePayment,
          lastPaymentAdjustment: calculation.lastPaymentAdjustment,
          
          // Сроки
          months: calculation.months,
          startDate: validatedData.startDate,
          
          // Статус
          status: "ACTIVE",
        },
      })

      // 2. Создание графика платежей (Installments)
      const installmentsData = calculation.installments.map((inst) => ({
        dealId: newDeal.id,
        index: inst.index,
        dueDate: inst.dueDate,
        amount: inst.amount,
        status: "DUE" as const,
      }))

      await tx.installment.createMany({
        data: installmentsData,
      })

      // 3. Возврат сделки с графиком
      return tx.deal.findUnique({
        where: { id: newDeal.id },
        include: {
          client: true,
          installments: {
            orderBy: { index: "asc" },
          },
        },
      })
    })

    // Аудит
    await logCreate(user.id, "Deal", deal!.id, {
      dealNumber,
      clientId: validatedData.clientId,
      productName: validatedData.productName,
      purchasePrice: calculation.purchasePrice,
      salePrice: calculation.salePrice,
      months: calculation.months,
      installmentsCount: calculation.installments.length,
    })

    return NextResponse.json({
      success: true,
      data: deal,
      message: "Сделка успешно создана",
    })
  } catch (error) {
    console.error("POST /api/deals error:", error)
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Ошибка валидации данных", details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Ошибка создания сделки" },
      { status: 500 }
    )
  }
}
