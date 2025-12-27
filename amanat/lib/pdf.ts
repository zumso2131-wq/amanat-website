import PDFDocument from 'pdfkit';
import { formatMoney, formatDate } from './utils';

interface ContractData {
  dealId: string;
  dealNumber: string;
  date: Date;
  client: {
    fullName: string;
    phone: string;
    passportNumber: string | null;
    address: string | null;
  };
  product: {
    name: string;
    purchasePrice: number;
    salePrice: number;
  };
  terms: {
    downPayment: number;
    amountToFinance: number;
    months: number;
    monthlyPayment: number;
    startDate: Date;
  };
  company: {
    name: string;
    bin: string;
    address: string;
    phone: string;
  };
}

export function generateContractPDF(data: ContractData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Заголовок
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('ДОГОВОР РАССРОЧКИ', { align: 'center' })
        .fontSize(12)
        .font('Helvetica')
        .text(`№ ${data.dealNumber} от ${formatDate(data.date)}`, { align: 'center' })
        .moveDown(2);

      // Стороны договора
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('1. СТОРОНЫ ДОГОВОРА')
        .moveDown(0.5);

      doc
        .fontSize(11)
        .font('Helvetica')
        .text(`Продавец: ${data.company.name}`, { continued: false })
        .text(`БИН: ${data.company.bin}`)
        .text(`Адрес: ${data.company.address}`)
        .text(`Телефон: ${data.company.phone}`)
        .moveDown(0.5);

      doc
        .text(`Покупатель: ${data.client.fullName}`)
        .text(`Телефон: ${data.client.phone}`);

      if (data.client.passportNumber) {
        doc.text(`Удостоверение личности: ${data.client.passportNumber}`);
      }
      if (data.client.address) {
        doc.text(`Адрес: ${data.client.address}`);
      }

      doc.moveDown(1.5);

      // Предмет договора
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('2. ПРЕДМЕТ ДОГОВОРА')
        .moveDown(0.5);

      doc
        .fontSize(11)
        .font('Helvetica')
        .text(`Продавец обязуется передать в собственность Покупателя, а Покупатель обязуется принять и оплатить товар:`)
        .moveDown(0.5)
        .text(`Наименование: ${data.product.name}`)
        .text(`Цена продажи: ${formatMoney(data.product.salePrice)}`)
        .moveDown(1.5);

      // Условия оплаты
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('3. УСЛОВИЯ ОПЛАТЫ')
        .moveDown(0.5);

      doc
        .fontSize(11)
        .font('Helvetica')
        .text(`Первоначальный взнос: ${formatMoney(data.terms.downPayment)}`)
        .text(`Сумма к финансированию: ${formatMoney(data.terms.amountToFinance)}`)
        .text(`Срок рассрочки: ${data.terms.months} месяцев`)
        .text(`Ежемесячный платёж: ${formatMoney(data.terms.monthlyPayment)}`)
        .text(`Дата начала: ${formatDate(data.terms.startDate)}`)
        .moveDown(1.5);

      // Обязательства сторон
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('4. ОБЯЗАТЕЛЬСТВА СТОРОН')
        .moveDown(0.5);

      doc
        .fontSize(11)
        .font('Helvetica')
        .text('4.1. Продавец обязуется:')
        .text('   - Передать товар в исправном состоянии', { indent: 20 })
        .text('   - Предоставить все необходимые документы', { indent: 20 })
        .moveDown(0.5);

      doc
        .text('4.2. Покупатель обязуется:')
        .text('   - Своевременно вносить платежи согласно графику', { indent: 20 })
        .text('   - Бережно относиться к товару', { indent: 20 })
        .moveDown(1.5);

      // Ответственность
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('5. ОТВЕТСТВЕННОСТЬ СТОРОН')
        .moveDown(0.5);

      doc
        .fontSize(11)
        .font('Helvetica')
        .text('При нарушении сроков оплаты Покупатель обязан уведомить Продавца и согласовать новый график платежей.')
        .moveDown(1.5);

      // Подписи
      doc.moveDown(2);
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('ПОДПИСИ СТОРОН', { align: 'center' })
        .moveDown(2);

      const signatureY = doc.y;
      doc.text('Продавец:', 50, signatureY);
      doc.text('Покупатель:', 320, signatureY);
      doc.moveDown(2);
      doc.text('_________________', 50);
      doc.text('_________________', 320, doc.y - 15);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

interface ScheduleData {
  dealNumber: string;
  client: { fullName: string };
  product: { name: string };
  installments: Array<{
    index: number;
    dueDate: Date;
    amount: number;
    status: string;
  }>;
}

export function generateSchedulePDF(data: ScheduleData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Заголовок
      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .text('ГРАФИК ПЛАТЕЖЕЙ', { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(11)
        .font('Helvetica')
        .text(`Договор № ${data.dealNumber}`)
        .text(`Клиент: ${data.client.fullName}`)
        .text(`Товар: ${data.product.name}`)
        .moveDown(1.5);

      // Таблица
      const tableTop = doc.y;
      const col1X = 50;
      const col2X = 150;
      const col3X = 300;
      const col4X = 450;

      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('№', col1X, tableTop);
      doc.text('Дата платежа', col2X, tableTop);
      doc.text('Сумма', col3X, tableTop);
      doc.text('Статус', col4X, tableTop);

      doc.moveDown(0.5);
      doc.moveTo(col1X, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.3);

      doc.font('Helvetica');
      data.installments.forEach((inst) => {
        const y = doc.y;
        doc.text(inst.index.toString(), col1X, y);
        doc.text(formatDate(inst.dueDate), col2X, y);
        doc.text(formatMoney(inst.amount), col3X, y);
        const statusText =
          inst.status === 'PAID' ? 'Оплачен' :
          inst.status === 'OVERDUE' ? 'Просрочен' : 'К оплате';
        doc.text(statusText, col4X, y);
        doc.moveDown(0.5);
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
