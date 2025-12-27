import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { formatDate, formatMoney } from "@/lib/calculations"

// GET - Generate PDF document
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const dealId = searchParams.get("dealId")
    const type = searchParams.get("type") // contract or schedule

    if (!dealId || !type) {
      return NextResponse.json(
        { success: false, error: "Укажите dealId и type (contract/schedule)" },
        { status: 400 }
      )
    }

    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        client: true,
        installments: { orderBy: { index: "asc" } },
        createdByUser: { select: { fullName: true } },
      },
    })

    if (!deal) {
      return NextResponse.json(
        { success: false, error: "Сделка не найдена" },
        { status: 404 }
      )
    }

    let html = ""
    let filename = ""

    if (type === "contract") {
      html = generateContractHTML(deal)
      filename = `contract_${deal.dealNumber}.html`
    } else if (type === "schedule") {
      html = generateScheduleHTML(deal)
      filename = `schedule_${deal.dealNumber}.html`
    } else {
      return NextResponse.json(
        { success: false, error: "Тип должен быть contract или schedule" },
        { status: 400 }
      )
    }

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json(
      { success: false, error: "Ошибка при генерации документа" },
      { status: 500 }
    )
  }
}

interface DealWithRelations {
  id: string
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
  monthlyBasePayment: number
  lastPaymentAdjustment: number
  status: string
  createdAt: Date
  client: {
    fullName: string
    phone: string
    iin: string | null
    passportNumber: string | null
    passportIssuedBy: string | null
    address: string | null
  }
  installments: Array<{
    index: number
    dueDate: Date
    amount: number
    status: string
    paidAt: Date | null
  }>
  createdByUser: {
    fullName: string
  }
}

function generateContractHTML(deal: DealWithRelations): string {
  const totalPaid = 0 // Will be calculated later
  const today = formatDate(new Date())

  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Договор рассрочки № ${deal.dealNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.5;
      padding: 20mm;
      max-width: 210mm;
      margin: 0 auto;
    }
    .header { text-align: center; margin-bottom: 20px; }
    .header h1 { font-size: 16pt; margin-bottom: 5px; }
    .header .number { font-size: 14pt; color: #333; }
    .section { margin-bottom: 15px; }
    .section-title { font-weight: bold; margin-bottom: 10px; text-decoration: underline; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { border: 1px solid #333; padding: 8px; text-align: left; }
    th { background: #f5f5f5; }
    .signatures { margin-top: 30px; display: flex; justify-content: space-between; }
    .signature-block { width: 45%; }
    .signature-line { border-bottom: 1px solid #000; margin-top: 40px; padding-top: 5px; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .bold { font-weight: bold; }
    .highlight { background: #ffffd0; }
    @media print {
      body { padding: 10mm; }
      @page { margin: 10mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>ДОГОВОР РАССРОЧКИ</h1>
    <div class="number">№ ${deal.dealNumber}</div>
    <div style="margin-top: 10px;">г. Алматы &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${today}</div>
  </div>

  <div class="section">
    <p>ИП «Аманат», именуемый в дальнейшем «Продавец», с одной стороны, и</p>
    <p><strong>${deal.client.fullName}</strong>, именуемый в дальнейшем «Покупатель»,</p>
    <p>с другой стороны, заключили настоящий договор о нижеследующем:</p>
  </div>

  <div class="section">
    <div class="section-title">1. ПРЕДМЕТ ДОГОВОРА</div>
    <p>1.1. Продавец передаёт, а Покупатель принимает товар: <strong>${deal.productName}</strong>${deal.productSku ? ` (артикул: ${deal.productSku})` : ''}.</p>
    <p>1.2. Покупатель обязуется оплатить товар на условиях рассрочки платежа в соответствии с настоящим договором.</p>
  </div>

  <div class="section">
    <div class="section-title">2. ЦЕНА И ПОРЯДОК РАСЧЁТОВ</div>
    <table>
      <tr>
        <td>Цена товара (с наценкой ${deal.markupPercentFinal}%)</td>
        <td class="text-right bold">${formatMoney(deal.salePrice)}</td>
      </tr>
      <tr>
        <td>Первоначальный взнос</td>
        <td class="text-right">${formatMoney(deal.downPayment)}</td>
      </tr>
      <tr class="highlight">
        <td><strong>Сумма к выплате в рассрочку</strong></td>
        <td class="text-right bold">${formatMoney(deal.amountToFinance)}</td>
      </tr>
      <tr>
        <td>Срок рассрочки</td>
        <td class="text-right">${deal.months} месяцев</td>
      </tr>
      <tr>
        <td>Ежемесячный платёж</td>
        <td class="text-right">${formatMoney(deal.monthlyBasePayment)}</td>
      </tr>
      ${deal.lastPaymentAdjustment > 0 ? `
      <tr>
        <td>Последний платёж</td>
        <td class="text-right">${formatMoney(deal.monthlyBasePayment + deal.lastPaymentAdjustment)}</td>
      </tr>
      ` : ''}
    </table>
    <p>2.1. Платежи вносятся ежемесячно согласно графику (Приложение №1).</p>
    <p>2.2. Дата начала рассрочки: <strong>${formatDate(deal.startDate)}</strong>.</p>
  </div>

  <div class="section">
    <div class="section-title">3. ПРАВА И ОБЯЗАННОСТИ СТОРОН</div>
    <p>3.1. Продавец обязуется:</p>
    <p style="padding-left: 20px;">— передать товар надлежащего качества;</p>
    <p style="padding-left: 20px;">— предоставить график платежей.</p>
    <p>3.2. Покупатель обязуется:</p>
    <p style="padding-left: 20px;">— своевременно вносить платежи согласно графику;</p>
    <p style="padding-left: 20px;">— бережно относиться к товару до полной оплаты;</p>
    <p style="padding-left: 20px;">— уведомлять Продавца об изменении контактных данных.</p>
  </div>

  <div class="section">
    <div class="section-title">4. ОТВЕТСТВЕННОСТЬ СТОРОН</div>
    <p>4.1. При просрочке платежа более 5 дней Продавец вправе начислить неустойку.</p>
    <p>4.2. Право собственности на товар переходит к Покупателю после полной оплаты.</p>
  </div>

  <div class="section">
    <div class="section-title">5. ДАННЫЕ ПОКУПАТЕЛЯ</div>
    <table>
      <tr><td width="200">ФИО</td><td>${deal.client.fullName}</td></tr>
      <tr><td>Телефон</td><td>${deal.client.phone}</td></tr>
      ${deal.client.iin ? `<tr><td>ИИН</td><td>${deal.client.iin}</td></tr>` : ''}
      ${deal.client.passportNumber ? `<tr><td>Паспорт</td><td>${deal.client.passportNumber}</td></tr>` : ''}
      ${deal.client.address ? `<tr><td>Адрес</td><td>${deal.client.address}</td></tr>` : ''}
    </table>
  </div>

  <div class="signatures">
    <div class="signature-block">
      <p><strong>ПРОДАВЕЦ:</strong></p>
      <p>ИП «Аманат»</p>
      <p>Менеджер: ${deal.createdByUser.fullName}</p>
      <div class="signature-line">
        Подпись _______________
      </div>
      <p style="margin-top: 5px;">М.П.</p>
    </div>
    <div class="signature-block">
      <p><strong>ПОКУПАТЕЛЬ:</strong></p>
      <p>${deal.client.fullName}</p>
      <p>&nbsp;</p>
      <div class="signature-line">
        Подпись _______________
      </div>
      <p style="margin-top: 5px;">«___» ___________ 20___г.</p>
    </div>
  </div>

  <div style="margin-top: 30px; text-align: center; font-size: 10pt; color: #666;">
    <p>Договор составлен в двух экземплярах, имеющих одинаковую юридическую силу.</p>
  </div>

  <script>
    // Auto-print when opened
    // window.onload = function() { window.print(); }
  </script>
</body>
</html>
`
}

function generateScheduleHTML(deal: DealWithRelations): string {
  const today = formatDate(new Date())

  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>График платежей № ${deal.dealNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.5;
      padding: 20mm;
      max-width: 210mm;
      margin: 0 auto;
    }
    .header { text-align: center; margin-bottom: 20px; }
    .header h1 { font-size: 14pt; margin-bottom: 5px; }
    .info { margin-bottom: 20px; }
    .info table { width: 100%; }
    .info td { padding: 3px 5px; }
    .schedule-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    .schedule-table th, .schedule-table td { border: 1px solid #333; padding: 8px; text-align: center; }
    .schedule-table th { background: #f5f5f5; }
    .schedule-table .paid { background: #d4edda; }
    .schedule-table .overdue { background: #f8d7da; }
    .total-row { font-weight: bold; background: #e9ecef; }
    .signatures { margin-top: 30px; display: flex; justify-content: space-between; }
    .signature-block { width: 45%; }
    .signature-line { border-bottom: 1px solid #000; margin-top: 40px; padding-top: 5px; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .note { margin-top: 20px; font-size: 10pt; color: #666; }
    @media print {
      body { padding: 10mm; }
      @page { margin: 10mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>ГРАФИК ПЛАТЕЖЕЙ</h1>
    <div>Приложение №1 к договору № ${deal.dealNumber}</div>
    <div style="margin-top: 5px; font-size: 11pt;">от ${formatDate(deal.createdAt)}</div>
  </div>

  <div class="info">
    <table>
      <tr>
        <td width="150"><strong>Покупатель:</strong></td>
        <td>${deal.client.fullName}</td>
        <td width="100"><strong>Телефон:</strong></td>
        <td>${deal.client.phone}</td>
      </tr>
      <tr>
        <td><strong>Товар:</strong></td>
        <td colspan="3">${deal.productName}</td>
      </tr>
      <tr>
        <td><strong>Сумма к выплате:</strong></td>
        <td><strong>${formatMoney(deal.amountToFinance)}</strong></td>
        <td><strong>Срок:</strong></td>
        <td>${deal.months} месяцев</td>
      </tr>
    </table>
  </div>

  <table class="schedule-table">
    <thead>
      <tr>
        <th width="60">№</th>
        <th>Дата платежа</th>
        <th>Сумма</th>
        <th>Статус</th>
        <th>Дата оплаты</th>
        <th>Подпись</th>
      </tr>
    </thead>
    <tbody>
      ${deal.installments.map((inst) => {
        const statusClass = inst.status === 'PAID' ? 'paid' : 
          (new Date(inst.dueDate) < new Date() && inst.status !== 'PAID' ? 'overdue' : '')
        const statusText = inst.status === 'PAID' ? 'Оплачен' :
          (new Date(inst.dueDate) < new Date() ? 'Просрочен' : 'Ожидает')
        return `
          <tr class="${statusClass}">
            <td>${inst.index}</td>
            <td>${formatDate(inst.dueDate)}</td>
            <td>${formatMoney(inst.amount)}</td>
            <td>${statusText}</td>
            <td>${inst.paidAt ? formatDate(inst.paidAt) : '—'}</td>
            <td style="width: 100px;"></td>
          </tr>
        `
      }).join('')}
      <tr class="total-row">
        <td colspan="2">ИТОГО</td>
        <td>${formatMoney(deal.amountToFinance)}</td>
        <td colspan="3"></td>
      </tr>
    </tbody>
  </table>

  <div class="note">
    <p><strong>Примечание:</strong></p>
    <p>• Платежи вносятся ежемесячно не позднее указанной даты.</p>
    <p>• При оплате наличными — подпись кассира и печать.</p>
    <p>• При безналичной оплате — сохраняйте квитанции.</p>
  </div>

  <div class="signatures">
    <div class="signature-block">
      <p><strong>ПРОДАВЕЦ:</strong></p>
      <p>ИП «Аманат»</p>
      <div class="signature-line">
        Подпись _______________
      </div>
      <p style="margin-top: 5px;">М.П.</p>
    </div>
    <div class="signature-block">
      <p><strong>ПОКУПАТЕЛЬ:</strong></p>
      <p>${deal.client.fullName}</p>
      <div class="signature-line">
        Подпись _______________
      </div>
    </div>
  </div>

  <div style="margin-top: 30px; text-align: center; font-size: 10pt; color: #666;">
    <p>Дата формирования документа: ${today}</p>
  </div>
</body>
</html>
`
}
