import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import PDFDocument from "pdfkit"
import { formatCurrency, formatDate } from "@/lib/utils"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const type = req.nextUrl.searchParams.get("type") || "contract"

    const deal = await prisma.deal.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        installments: {
          orderBy: { index: "asc" },
        },
      },
    })

    if (!deal) {
      return NextResponse.json({ error: "Сделка не найдена" }, { status: 404 })
    }

    // Проверка доступа для клиентов
    if (session.user.role === "CLIENT") {
      const client = await prisma.client.findFirst({
        where: { phone: session.user.phone },
      })
      if (!client || deal.clientId !== client.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    // Устанавливаем заголовки для скачивания
    const headers = new Headers()
    headers.set("Content-Type", "application/pdf")
    headers.set(
      "Content-Disposition",
      `attachment; filename="${type === "contract" ? "dogovor" : "grafik"}-${params.id}.pdf"`
    )

    const chunks: Buffer[] = []
    const doc = new PDFDocument({ margin: 50 })
    
    doc.on("data", (chunk: Buffer) => chunks.push(chunk))

    if (type === "contract") {
      // Генерация договора
      doc.fontSize(20).text("ДОГОВОР РАССРОЧКИ", { align: "center" })
      doc.moveDown()

      doc.fontSize(12).text(`Дата: ${formatDate(deal.startDate)}`)
      doc.moveDown()

      doc.text("РЕКВИЗИТЫ КЛИЕНТА:", { underline: true })
      doc.text(`ФИО: ${deal.client.fullName}`)
      doc.text(`Телефон: ${deal.client.phone}`)
      if (deal.client.passportNumber) {
        doc.text(`Паспорт: ${deal.client.passportNumber}`)
      }
      if (deal.client.address) {
        doc.text(`Адрес: ${deal.client.address}`)
      }
      doc.moveDown()

      doc.text("ПРЕДМЕТ ДОГОВОРА:", { underline: true })
      doc.text(`Товар: ${deal.productName}`)
      doc.text(`Цена закупки: ${formatCurrency(Number(deal.purchasePrice))}`)
      doc.text(`Наценка: ${deal.markupPercentFinal}%`)
      doc.text(`Цена продажи: ${formatCurrency(Number(deal.salePrice))}`)
      doc.text(`Первоначальный взнос: ${formatCurrency(Number(deal.downPayment))}`)
      doc.text(`Сумма к выплате: ${formatCurrency(Number(deal.amountToFinance))}`)
      doc.text(`Срок рассрочки: ${deal.months} месяцев`)
      doc.moveDown()

      doc.text("УСЛОВИЯ:", { underline: true })
      doc.text("1. Клиент обязуется вносить ежемесячные платежи согласно графику.")
      doc.text("2. При просрочке платежа начисляется штраф согласно условиям договора.")
      doc.text("3. Клиент имеет право досрочно погасить рассрочку без дополнительных комиссий.")
      doc.moveDown(2)

      doc.text("ПОДПИСИ:", { underline: true })
      doc.moveDown(3)
      doc.text("Клиент: _________________")
      doc.moveDown(2)
      doc.text("Представитель: _________________")
    } else {
      // Генерация графика платежей
      doc.fontSize(20).text("ГРАФИК ПЛАТЕЖЕЙ", { align: "center" })
      doc.moveDown()

      doc.fontSize(12).text(`Сделка: ${deal.productName}`)
      doc.text(`Клиент: ${deal.client.fullName}`)
      doc.text(`Дата начала: ${formatDate(deal.startDate)}`)
      doc.moveDown()

      doc.text("График:", { underline: true })
      doc.moveDown()

      // Таблица графика
      const tableTop = doc.y
      const itemHeight = 20
      const pageWidth = doc.page.width - 100
      const col1Width = pageWidth * 0.2
      const col2Width = pageWidth * 0.4
      const col3Width = pageWidth * 0.4

      // Заголовки
      doc.fontSize(10).font("Helvetica-Bold")
      doc.text("№", 50, tableTop)
      doc.text("Дата платежа", 50 + col1Width, tableTop)
      doc.text("Сумма", 50 + col1Width + col2Width, tableTop, { align: "right" })
      doc.text("Статус", 50 + col1Width + col2Width + col3Width, tableTop, { align: "right" })

      doc.font("Helvetica")
      let y = tableTop + itemHeight

      deal.installments.forEach((inst) => {
        if (y > doc.page.height - 50) {
          doc.addPage()
          y = 50
        }

        doc.text(String(inst.index), 50, y)
        doc.text(formatDate(inst.dueDate), 50 + col1Width, y)
        doc.text(formatCurrency(Number(inst.amount)), 50 + col1Width + col2Width, y, { align: "right" })
        doc.text(
          inst.status === "PAID" ? "Оплачено" : inst.status === "OVERDUE" ? "Просрочено" : "Ожидается",
          50 + col1Width + col2Width + col3Width,
          y,
          { align: "right" }
        )
        y += itemHeight
      })

      doc.moveDown()
      doc.fontSize(12)
      doc.text(`Итого к выплате: ${formatCurrency(Number(deal.amountToFinance))}`, { align: "right" })
    }

    doc.end()

    // Ждём завершения генерации
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => {
        resolve(Buffer.concat(chunks))
      })
      doc.on("error", reject)
    })

    return new NextResponse(pdfBuffer, {
      headers,
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json(
      { error: "Ошибка генерации PDF" },
      { status: 500 }
    )
  }
}
