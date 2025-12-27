import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';
import { AuditAction, UserRole } from '@prisma/client';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.MANAGER)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id } = params;

    const before = await prisma.client.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const updated = await prisma.client.update({
      where: { id },
      data: {
        fullName: body.fullName,
        passportNumber: body.passportNumber,
        passportIssuedBy: body.passportIssuedBy,
        passportIssuedAt: body.passportIssuedAt
          ? new Date(body.passportIssuedAt)
          : undefined,
        address: body.address,
        note: body.note,
      },
    });

    await createAuditLog({
      actorUserId: session.user.id,
      entity: 'Client',
      entityId: id,
      action: AuditAction.UPDATE,
      before,
      after: updated,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Удаление пользователя (клиент удалится каскадно)
    await prisma.user.delete({
      where: { id: client.userId },
    });

    await createAuditLog({
      actorUserId: session.user.id,
      entity: 'Client',
      entityId: id,
      action: AuditAction.DELETE,
      before: client,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
