import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateContractPDF, generateSchedulePDF } from '@/lib/pdf';

export async function GET(
  req: NextRequest,
  { params }: { params: { dealId: string; type: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dealId, type } = params;

    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        client: true,
        installments: { orderBy: { index: 'asc' } },
      },
    });

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Проверка доступа
    if (
      session.user.role === 'CLIENT' &&
      deal.client.userId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Получаем настройки компании
    const settings = await prisma.systemSetting.findMany();
    const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]));

    const company = {
      name: settingsMap.company_name || 'ТОО "Аманат"',
      bin: settingsMap.company_bin || '123456789012',
      address: settingsMap.company_address || 'г. Алматы',
      phone: settingsMap.company_phone || '+7 (777) 123-45-67',
    };

    if (type === 'contract') {
      const pdfBuffer = await generateContractPDF({
        dealId: deal.id,
        dealNumber: deal.id.slice(-8).toUpperCase(),
        date: deal.createdAt,
        client: {
          fullName: deal.client.fullName,
          phone: deal.client.phone,
          passportNumber: deal.client.passportNumber,
          address: deal.client.address,
        },
        product: {
          name: deal.productName,
          purchasePrice: Number(deal.purchasePrice),
          salePrice: Number(deal.salePrice),
        },
        terms: {
          downPayment: Number(deal.downPayment),
          amountToFinance: Number(deal.amountToFinance),
          months: deal.months,
          monthlyPayment: Number(deal.monthlyBasePayment),
          startDate: deal.startDate,
        },
        company,
      });

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="contract-${deal.id}.pdf"`,
        },
      });
    } else if (type === 'schedule') {
      const pdfBuffer = await generateSchedulePDF({
        dealNumber: deal.id.slice(-8).toUpperCase(),
        client: { fullName: deal.client.fullName },
        product: { name: deal.productName },
        installments: deal.installments.map(inst => ({
          index: inst.index,
          dueDate: inst.dueDate,
          amount: Number(inst.amount),
          status: inst.status,
        })),
      });

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="schedule-${deal.id}.pdf"`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
