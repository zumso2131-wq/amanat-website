// ============================================
// API PDF — Генерация договора и графика
// ============================================

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireManager } from "@/lib/auth"
import { formatMoney, formatDate } from "@/lib/calculations"

// ============================================
// GET — Генерация PDF (HTML для печати)
// ============================================

export async function GET(request: NextRequest) {
  try {
    await requireManager()

    const { searchParams } = new URL(request.url)
    const dealId = searchParams.get("dealId")
    const type = searchParams.get("type") // "contract" или "schedule"

    if (!dealId) {
      return NextResponse.json(
        { success: false, error: "Не указан ID сделки" },
        { status: 400 }
      )
    }

    if (!type || !["contract", "schedule"].includes(type)) {
      return NextResponse.json(
        { success: false, error: "Укажите type: contract или schedule" },
        { status: 400 }
      )
    }

    // Загружаем сделку
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        client: true,
        createdByUser: true,
        installments: { orderBy: { index: "asc" } },
      },
    })

    if (!deal) {
      return NextResponse.json(
        { success: false, error: "Сделка не найдена" },
        { status: 404 }
      )
    }

    // Генерируем HTML
    const html = type === "contract" 
      ? generateContractHTML(deal)
      : generateScheduleHTML(deal)

    // Сохраняем запись о документе
    await prisma.document.create({
      data: {
        dealId: deal.id,
        type: type === "contract" ? "CONTRACT" : "SCHEDULE",
        filePathOrUrl: `/api/pdf?dealId=${dealId}&type=${type}`,
        fileName: `${deal.dealNumber}_${type}.pdf`,
      },
    })

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    })
  } catch (error) {
    console.error("GET /api/pdf error:", error)
    return NextResponse.json(
      { success: false, error: "Ошибка генерации документа" },
      { status: 500 }
    )
  }
}

// ============================================
// Генерация HTML договора
// ============================================

function generateContractHTML(deal: {
  dealNumber: string
  productName: string
  productSku: string | null
  purchasePrice: number
  markupPercentFinal: number
  salePrice: number
  downPayment: number
  amountToFinance: number
  months: number
  startDate: Date
  client: {
    fullName: string
    phone: string
    iin: string | null
    passportNumber: string | null
    address: string | null
  }
  createdByUser: {
    fullName: string
  }
  installments: Array<{
    index: number
    dueDate: Date
    amount: number
  }>
}): string {
  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Договор ${deal.dealNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.5; padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { font-size: 18pt; margin-bottom: 10px; }
    .header p { color: #666; }
    .section { margin-bottom: 20px; }
    .section-title { font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
    .row { display: flex; margin-bottom: 5px; }
    .row .label { width: 200px; color: #666; }
    .row .value { flex: 1; font-weight: 500; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
    th { background: #f5f5f5; }
    .text-right { text-align: right; }
    .signatures { margin-top: 50px; display: flex; justify-content: space-between; }
    .signature-block { width: 45%; }
    .signature-line { border-bottom: 1px solid #000; height: 40px; margin-bottom: 5px; }
    .footer { margin-top: 40px; text-align: center; color: #666; font-size: 10pt; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>ДОГОВОР РАССРОЧКИ</h1>
    <p>№ ${deal.dealNumber} от ${formatDate(deal.startDate)}</p>
  </div>

  <div class="section">
    <div class="section-title">1. СТОРОНЫ ДОГОВОРА</div>
    <p><strong>Продавец:</strong> ТОО "Аманат", БИН 123456789012</p>
    <p><strong>Покупатель:</strong> ${deal.client.fullName}</p>
    <p>Телефон: ${deal.client.phone}${deal.client.iin ? `, ИИН: ${deal.client.iin}` : ""}</p>
    ${deal.client.address ? `<p>Адрес: ${deal.client.address}</p>` : ""}
  </div>

  <div class="section">
    <div class="section-title">2. ПРЕДМЕТ ДОГОВОРА</div>
    <div class="row"><span class="label">Товар:</span><span class="value">${deal.productName}</span></div>
    ${deal.productSku ? `<div class="row"><span class="label">Артикул:</span><span class="value">${deal.productSku}</span></div>` : ""}
  </div>

  <div class="section">
    <div class="section-title">3. ФИНАНСОВЫЕ УСЛОВИЯ</div>
    <div class="row"><span class="label">Цена товара:</span><span class="value">${formatMoney(deal.salePrice)}</span></div>
    <div class="row"><span class="label">Наценка за рассрочку:</span><span class="value">${deal.markupPercentFinal}%</span></div>
    <div class="row"><span class="label">Первоначальный взнос:</span><span class="value">${formatMoney(deal.downPayment)}</span></div>
    <div class="row"><span class="label">Сумма к выплате:</span><span class="value"><strong>${formatMoney(deal.amountToFinance)}</strong></span></div>
    <div class="row"><span class="label">Срок рассрочки:</span><span class="value">${deal.months} месяцев</span></div>
    <div class="row"><span class="label">Дата выдачи товара:</span><span class="value">${formatDate(deal.startDate)}</span></div>
  </div>

  <div class="section">
    <div class="section-title">4. ГРАФИК ПЛАТЕЖЕЙ</div>
    <table>
      <thead>
        <tr>
          <th>№</th>
          <th>Дата платежа</th>
          <th class="text-right">Сумма</th>
        </tr>
      </thead>
      <tbody>
        ${deal.installments.map((inst) => `
          <tr>
            <td>${inst.index}</td>
            <td>${formatDate(inst.dueDate)}</td>
            <td class="text-right">${formatMoney(inst.amount)}</td>
          </tr>
        `).join("")}
        <tr>
          <td colspan="2"><strong>ИТОГО:</strong></td>
          <td class="text-right"><strong>${formatMoney(deal.amountToFinance)}</strong></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">5. УСЛОВИЯ</div>
    <p>5.1. Покупатель обязуется своевременно вносить платежи согласно графику.</p>
    <p>5.2. В случае просрочки платежа более 30 дней, Продавец вправе потребовать досрочного погашения.</p>
    <p>5.3. Право собственности на товар переходит к Покупателю после полной оплаты.</p>
  </div>

  <div class="signatures">
    <div class="signature-block">
      <p><strong>ПРОДАВЕЦ:</strong></p>
      <p>ТОО "Аманат"</p>
      <p>Менеджер: ${deal.createdByUser.fullName}</p>
      <div class="signature-line"></div>
      <p>Подпись / Дата</p>
    </div>
    <div class="signature-block">
      <p><strong>ПОКУПАТЕЛЬ:</strong></p>
      <p>${deal.client.fullName}</p>
      <p>Тел: ${deal.client.phone}</p>
      <div class="signature-line"></div>
      <p>Подпись / Дата</p>
    </div>
  </div>

  <div class="footer">
    <p>Документ сформирован автоматически системой "Аманат"</p>
  </div>
</body>
</html>
  `
}

// ============================================
// Генерация HTML графика платежей
// ============================================

function generateScheduleHTML(deal: {
  dealNumber: string
  productName: string
  salePrice: number
  downPayment: number
  amountToFinance: number
  months: number
  startDate: Date
  client: {
    fullName: string
    phone: string
  }
  installments: Array<{
    index: number
    dueDate: Date
    amount: number
    status: string
  }>
}): string {
  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>График платежей ${deal.dealNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.5; padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { font-size: 16pt; margin-bottom: 5px; }
    .info { margin-bottom: 20px; }
    .info p { margin-bottom: 5px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
    th { background: #f5f5f5; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .paid { color: green; }
    .overdue { color: red; }
    .total-row { font-weight: bold; background: #f9f9f9; }
    .signature { margin-top: 40px; }
    .signature-line { border-bottom: 1px solid #000; width: 200px; display: inline-block; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>ГРАФИК ПЛАТЕЖЕЙ</h1>
    <p>Сделка № ${deal.dealNumber}</p>
  </div>

  <div class="info">
    <p><strong>Клиент:</strong> ${deal.client.fullName} (${deal.client.phone})</p>
    <p><strong>Товар:</strong> ${deal.productName}</p>
    <p><strong>Цена:</strong> ${formatMoney(deal.salePrice)} | <strong>Взнос:</strong> ${formatMoney(deal.downPayment)}</p>
    <p><strong>Сумма к выплате:</strong> ${formatMoney(deal.amountToFinance)} за ${deal.months} мес.</p>
    <p><strong>Дата начала:</strong> ${formatDate(deal.startDate)}</p>
  </div>

  <table>
    <thead>
      <tr>
        <th class="text-center" style="width:50px">№</th>
        <th>Дата платежа</th>
        <th class="text-right">Сумма</th>
        <th class="text-center">Статус</th>
        <th>Подпись</th>
      </tr>
    </thead>
    <tbody>
      ${deal.installments.map((inst) => `
        <tr>
          <td class="text-center">${inst.index}</td>
          <td>${formatDate(inst.dueDate)}</td>
          <td class="text-right">${formatMoney(inst.amount)}</td>
          <td class="text-center ${inst.status === "PAID" ? "paid" : inst.status === "OVERDUE" ? "overdue" : ""}">
            ${inst.status === "PAID" ? "✓ Оплачено" : inst.status === "OVERDUE" ? "Просрочено" : "Ожидает"}
          </td>
          <td></td>
        </tr>
      `).join("")}
      <tr class="total-row">
        <td colspan="2">ИТОГО:</td>
        <td class="text-right">${formatMoney(deal.amountToFinance)}</td>
        <td colspan="2"></td>
      </tr>
    </tbody>
  </table>

  <div class="signature">
    <p>Клиент: <span class="signature-line"></span> / ${deal.client.fullName}</p>
  </div>
</body>
</html>
  `
}
