import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { UserRole } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.MANAGER)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deals = await prisma.deal.findMany({
      include: {
        client: true,
        createdBy: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Создание CSV
    const headers = [
      'ID',
      'Клиент',
      'Телефон',
      'Товар',
      'Цена закупа',
      'Наценка %',
      'Цена продажи',
      'Первый взнос',
      'К выплате',
      'Срок (мес)',
      'Платёж/мес',
      'Дата выдачи',
      'Статус',
      'Менеджер',
      'Дата создания',
    ];

    const rows = deals.map((deal) => [
      deal.id,
      deal.client.fullName,
      deal.client.phone,
      deal.productName,
      Number(deal.purchasePrice),
      Number(deal.markupPercentFinal),
      Number(deal.salePrice),
      Number(deal.downPayment),
      Number(deal.amountToFinance),
      deal.months,
      Number(deal.monthlyBasePayment),
      formatDate(deal.startDate),
      deal.status,
      deal.createdBy.fullName,
      formatDate(deal.createdAt),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="deals-${formatDate(new Date())}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
