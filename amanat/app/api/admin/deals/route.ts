import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { dealSchema } from '@/lib/validations';
import { calculateDeal, generateInstallmentSchedule } from '@/lib/calculations';
import { createAuditLog } from '@/lib/audit';
import { AuditAction, UserRole, DealStatus, InstallmentStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.MANAGER)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deals = await prisma.deal.findMany({
      include: {
        client: true,
        createdBy: { select: { fullName: true } },
        installments: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(deals);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.MANAGER)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = dealSchema.parse(body);

    // Расчёт сделки
    const calc = calculateDeal({
      purchasePrice: validated.purchasePrice,
      months: validated.months,
      downPayment: validated.downPayment,
      markupPercentInput: validated.markupPercentInput,
    });

    const startDate = new Date(validated.startDate);

    // Создание сделки
    const deal = await prisma.deal.create({
      data: {
        clientId: validated.clientId,
        productName: validated.productName,
        purchasePrice: calc.purchasePrice,
        markupPercentFinal: calc.markupPercentFinal,
        salePrice: calc.salePrice,
        downPayment: calc.downPayment,
        amountToFinance: calc.amountToFinance,
        months: calc.months,
        startDate,
        monthlyBasePayment: calc.monthlyBasePayment,
        lastPaymentAdjustment: calc.lastPaymentAdjustment,
        status: DealStatus.ACTIVE,
        createdByUserId: session.user.id,
        note: validated.note,
      },
    });

    // Генерация графика платежей
    const schedule = generateInstallmentSchedule(calc, startDate);

    for (const item of schedule) {
      await prisma.installment.create({
        data: {
          dealId: deal.id,
          index: item.index,
          dueDate: item.dueDate,
          amount: item.amount,
          status: InstallmentStatus.DUE,
        },
      });
    }

    // Audit log
    await createAuditLog({
      actorUserId: session.user.id,
      entity: 'Deal',
      entityId: deal.id,
      action: AuditAction.CREATE,
      after: deal,
    });

    // Уведомление клиента
    const client = await prisma.client.findUnique({
      where: { id: validated.clientId },
      include: { user: true },
    });

    if (client?.user) {
      await prisma.notification.create({
        data: {
          userId: client.user.id,
          type: 'DEAL_CREATED',
          title: 'Новая сделка',
          message: `Оформлена сделка на ${validated.productName}. Сумма: ${calc.salePrice} ₸`,
          payloadJson: JSON.stringify({ dealId: deal.id }),
        },
      });
    }

    return NextResponse.json(deal);
  } catch (error: any) {
    console.error('Create deal error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
