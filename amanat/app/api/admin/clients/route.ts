import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createClientUserSchema } from '@/lib/validations';
import { normalizePhone } from '@/lib/utils';
import { createAuditLog } from '@/lib/audit';
import { hash } from 'bcrypt';
import { AuditAction, UserRole } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.MANAGER)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clients = await prisma.client.findMany({
      include: {
        _count: {
          select: { deals: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(clients);
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
    const validated = createClientUserSchema.parse(body);

    const phone = normalizePhone(validated.phone);

    // Проверка существующего пользователя
    const existing = await prisma.user.findUnique({
      where: { phone },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Пользователь с таким телефоном уже существует' },
        { status: 400 }
      );
    }

    // Создание пользователя и клиента
    const passwordHash = await hash(validated.password, 10);

    const user = await prisma.user.create({
      data: {
        phone,
        passwordHash,
        fullName: validated.fullName,
        role: UserRole.CLIENT,
        isActive: true,
        client: {
          create: {
            fullName: validated.fullName,
            phone,
            passportNumber: validated.passportNumber,
            passportIssuedBy: validated.passportIssuedBy,
            passportIssuedAt: validated.passportIssuedAt
              ? new Date(validated.passportIssuedAt)
              : undefined,
            address: validated.address,
            note: validated.note,
          },
        },
      },
      include: { client: true },
    });

    // Audit log
    await createAuditLog({
      actorUserId: session.user.id,
      entity: 'Client',
      entityId: user.client!.id,
      action: AuditAction.CREATE,
      after: user.client,
    });

    return NextResponse.json(user.client);
  } catch (error: any) {
    console.error('Create client error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
