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

    const payments = await prisma.payment.findMany({
      include: {
        deal: {
          include: { client: true },
        },
      },
      orderBy: { paidAt: 'desc' },
    });

    const headers = [
      'ID',
      'Дата',
      'Клиент',
      'Сделка',
      'Сумма',
      'Способ',
      'Комментарий',
    ];

    const rows = payments.map((payment) => [
      payment.id,
      formatDate(payment.paidAt),
      payment.deal.client.fullName,
      payment.deal.productName,
      Number(payment.amount),
      payment.method,
      payment.comment || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="payments-${formatDate(new Date())}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
