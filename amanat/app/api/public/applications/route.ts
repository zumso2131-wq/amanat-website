import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { applicationSchema } from '@/lib/validations';
import { normalizePhone } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = applicationSchema.parse(body);

    const phone = normalizePhone(validated.phone);

    // Создаём уведомление для администраторов
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'MANAGER'] },
        isActive: true,
      },
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'SYSTEM',
          title: 'Новая заявка',
          message: `Новая заявка от ${validated.fullName} (${phone}). Товар: ${validated.productName}`,
          payloadJson: JSON.stringify(validated),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Application error:', error);
    return NextResponse.json(
      { error: error.message || 'Ошибка при обработке заявки' },
      { status: 400 }
    );
  }
}
