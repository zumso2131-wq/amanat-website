// ============================================
// API ЭКСПОРТА CSV
// ============================================

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireManager } from "@/lib/auth"
import { formatDate, formatMoney } from "@/lib/calculations"

function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ""
  const str = String(value)
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function toCSV(headers: string[], rows: (string | number | null)[][]): string {
  const headerLine = headers.map(escapeCSV).join(",")
  const dataLines = rows.map((row) => row.map(escapeCSV).join(","))
  return [headerLine, ...dataLines].join("\n")
}

export async function GET(request: NextRequest) {
  try {
    await requireManager()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    if (!type || !["clients", "deals", "payments", "overdue"].includes(type)) {
      return NextResponse.json(
        { success: false, error: "Укажите type: clients, deals, payments или overdue" },
        { status: 400 }
      )
    }

    let csv = ""
    let filename = ""

    switch (type) {
      case "clients": {
        const clients = await prisma.client.findMany({
          include: { _count: { select: { deals: true } } },
          orderBy: { createdAt: "desc" },
        })

        const headers = ["ID", "ФИО", "Телефон", "ИИН", "Адрес", "Сделок", "Создан"]
        const rows = clients.map((c) => [
          c.id,
          c.fullName,
          c.phone,
          c.iin,
          c.address,
          c._count.deals,
          formatDate(c.createdAt),
        ])

        csv = toCSV(headers, rows)
        filename = `clients_${new Date().toISOString().split("T")[0]}.csv`
        break
      }

      case "deals": {
        const deals = await prisma.deal.findMany({
          include: {
            client: { select: { fullName: true, phone: true } },
            createdByUser: { select: { fullName: true } },
            payments: true,
          },
          orderBy: { createdAt: "desc" },
        })

        const headers = [
          "Номер", "Клиент", "Телефон", "Товар", 
          "Закуп", "Наценка", "Продажа", "Взнос", "К выплате",
          "Оплачено", "Остаток", "Срок", "Статус", "Менеджер", "Дата"
        ]
        const rows = deals.map((d) => {
          const paid = d.payments.reduce((s, p) => s + p.amount, 0)
          return [
            d.dealNumber,
            d.client.fullName,
            d.client.phone,
            d.productName,
            d.purchasePrice,
            `${d.markupPercentFinal}%`,
            d.salePrice,
            d.downPayment,
            d.amountToFinance,
            paid,
            d.amountToFinance - paid,
            `${d.months} мес`,
            d.status,
            d.createdByUser.fullName,
            formatDate(d.createdAt),
          ]
        })

        csv = toCSV(headers, rows)
        filename = `deals_${new Date().toISOString().split("T")[0]}.csv`
        break
      }

      case "payments": {
        const payments = await prisma.payment.findMany({
          include: {
            deal: {
              select: {
                dealNumber: true,
                client: { select: { fullName: true } },
              },
            },
          },
          orderBy: { paidAt: "desc" },
        })

        const headers = ["ID", "Сделка", "Клиент", "Сумма", "Способ", "Дата", "Комментарий"]
        const rows = payments.map((p) => [
          p.id,
          p.deal.dealNumber,
          p.deal.client.fullName,
          p.amount,
          p.method,
          formatDate(p.paidAt),
          p.comment,
        ])

        csv = toCSV(headers, rows)
        filename = `payments_${new Date().toISOString().split("T")[0]}.csv`
        break
      }

      case "overdue": {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const overdue = await prisma.installment.findMany({
          where: {
            status: { not: "PAID" },
            dueDate: { lt: today },
          },
          include: {
            deal: {
              select: {
                dealNumber: true,
                client: { select: { fullName: true, phone: true } },
                createdByUser: { select: { fullName: true } },
              },
            },
          },
          orderBy: { dueDate: "asc" },
        })

        const headers = ["Сделка", "Клиент", "Телефон", "Платёж #", "Дата", "Сумма", "Дней просрочки", "Менеджер"]
        const rows = overdue.map((o) => {
          const daysOverdue = Math.floor((today.getTime() - new Date(o.dueDate).getTime()) / (1000 * 60 * 60 * 24))
          return [
            o.deal.dealNumber,
            o.deal.client.fullName,
            o.deal.client.phone,
            o.index,
            formatDate(o.dueDate),
            o.amount,
            daysOverdue,
            o.deal.createdByUser.fullName,
          ]
        })

        csv = toCSV(headers, rows)
        filename = `overdue_${new Date().toISOString().split("T")[0]}.csv`
        break
      }
    }

    // BOM для Excel
    const bom = "\uFEFF"
    
    return new NextResponse(bom + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("GET /api/export error:", error)
    return NextResponse.json(
      { success: false, error: "Ошибка экспорта" },
      { status: 500 }
    )
  }
}
