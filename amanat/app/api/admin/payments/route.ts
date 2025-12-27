import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { paymentSchema } from '@/lib/validations';
import { createAuditLog } from '@/lib/audit';
import { AuditAction, UserRole, InstallmentStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
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
        installment: true,
      },
      orderBy: { paidAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(payments);
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
    const validated = paymentSchema.parse(body);

    // Создание платежа
    const payment = await prisma.payment.create({
      data: {
        dealId: validated.dealId,
        installmentId: validated.installmentId,
        amount: validated.amount,
        paidAt: validated.paidAt ? new Date(validated.paidAt) : new Date(),
        method: validated.method,
        comment: validated.comment,
      },
    });

    // Обновление статуса платежа если указан
    if (validated.installmentId) {
      const installment = await prisma.installment.findUnique({
        where: { id: validated.installmentId },
      });

      if (installment && installment.status !== InstallmentStatus.PAID) {
        await prisma.installment.update({
          where: { id: validated.installmentId },
          data: {
            status: InstallmentStatus.PAID,
            paidAt: new Date(),
          },
        });
      }
    }

    // Проверка: закрыта ли сделка
    const deal = await prisma.deal.findUnique({
      where: { id: validated.dealId },
      include: {
        payments: true,
        installments: true,
      },
    });

    if (deal) {
      const totalPaid = deal.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const amountToFinance = Number(deal.amountToFinance);

      if (totalPaid >= amountToFinance) {
        await prisma.deal.update({
          where: { id: deal.id },
          data: { status: 'CLOSED' },
        });
      }
    }

    // Audit log
    await createAuditLog({
      actorUserId: session.user.id,
      entity: 'Payment',
      entityId: payment.id,
      action: AuditAction.CREATE,
      after: payment,
    });

    return NextResponse.json(payment);
  } catch (error: any) {
    console.error('Create payment error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
