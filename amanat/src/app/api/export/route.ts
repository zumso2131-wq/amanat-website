import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { formatDate, formatMoney } from "@/lib/calculations"

// GET - Export data as CSV
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") // clients, deals, payments

    let csv = ""
    let filename = ""

    switch (type) {
      case "clients":
        csv = await exportClients()
        filename = `clients_${formatDateForFilename(new Date())}.csv`
        break
      case "deals":
        csv = await exportDeals()
        filename = `deals_${formatDateForFilename(new Date())}.csv`
        break
      case "payments":
        csv = await exportPayments()
        filename = `payments_${formatDateForFilename(new Date())}.csv`
        break
      default:
        return NextResponse.json(
          { success: false, error: "Укажите тип экспорта: clients, deals или payments" },
          { status: 400 }
        )
    }

    // Add BOM for Excel UTF-8 compatibility
    const bom = "\uFEFF"
    const csvWithBom = bom + csv

    return new NextResponse(csvWithBom, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json(
      { success: false, error: "Ошибка при экспорте данных" },
      { status: 500 }
    )
  }
}

function formatDateForFilename(date: Date): string {
  return date.toISOString().split("T")[0]
}

function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ""
  const str = String(value)
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

async function exportClients(): Promise<string> {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { deals: true } },
    },
  })

  const headers = [
    "ID",
    "ФИО",
    "Телефон",
    "ИИН",
    "Паспорт",
    "Адрес",
    "Примечание",
    "Сделок",
    "Дата создания",
  ]

  const rows = clients.map((c) => [
    escapeCSV(c.id),
    escapeCSV(c.fullName),
    escapeCSV(c.phone),
    escapeCSV(c.iin),
    escapeCSV(c.passportNumber),
    escapeCSV(c.address),
    escapeCSV(c.note),
    escapeCSV(c._count.deals),
    escapeCSV(formatDate(c.createdAt)),
  ])

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
}

async function exportDeals(): Promise<string> {
  const deals = await prisma.deal.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { fullName: true, phone: true } },
      createdByUser: { select: { fullName: true } },
      payments: true,
    },
  })

  const headers = [
    "№ Сделки",
    "Клиент",
    "Телефон",
    "Товар",
    "Закуп",
    "Наценка %",
    "Цена продажи",
    "Взнос",
    "К выплате",
    "Срок",
    "Платёж/мес",
    "Статус",
    "Оплачено",
    "Остаток",
    "Менеджер",
    "Дата создания",
  ]

  const rows = deals.map((d) => {
    const totalPaid = d.payments.reduce((sum, p) => sum + p.amount, 0)
    const remaining = d.amountToFinance - totalPaid

    return [
      escapeCSV(d.dealNumber),
      escapeCSV(d.client.fullName),
      escapeCSV(d.client.phone),
      escapeCSV(d.productName),
      escapeCSV(d.purchasePrice),
      escapeCSV(d.markupPercentFinal),
      escapeCSV(d.salePrice),
      escapeCSV(d.downPayment),
      escapeCSV(d.amountToFinance),
      escapeCSV(`${d.months} мес`),
      escapeCSV(d.monthlyBasePayment),
      escapeCSV(getStatusLabel(d.status)),
      escapeCSV(totalPaid),
      escapeCSV(remaining),
      escapeCSV(d.createdByUser.fullName),
      escapeCSV(formatDate(d.createdAt)),
    ]
  })

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
}

async function exportPayments(): Promise<string> {
  const payments = await prisma.payment.findMany({
    orderBy: { paidAt: "desc" },
    include: {
      deal: {
        select: {
          dealNumber: true,
          client: { select: { fullName: true, phone: true } },
        },
      },
      installment: { select: { index: true } },
    },
  })

  const headers = [
    "ID",
    "№ Сделки",
    "Клиент",
    "Телефон",
    "Сумма",
    "Способ оплаты",
    "№ Платежа",
    "Комментарий",
    "Дата оплаты",
  ]

  const rows = payments.map((p) => [
    escapeCSV(p.id),
    escapeCSV(p.deal.dealNumber),
    escapeCSV(p.deal.client.fullName),
    escapeCSV(p.deal.client.phone),
    escapeCSV(p.amount),
    escapeCSV(getMethodLabel(p.method)),
    escapeCSV(p.installment?.index || "-"),
    escapeCSV(p.comment),
    escapeCSV(formatDate(p.paidAt)),
  ])

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: "Черновик",
    ACTIVE: "Активна",
    CLOSED: "Закрыта",
    CANCELED: "Отменена",
  }
  return labels[status] || status
}

function getMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    CASH: "Наличные",
    CARD: "Карта",
    TRANSFER: "Перевод",
  }
  return labels[method] || method
}
