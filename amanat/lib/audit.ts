import { prisma } from './prisma';
import { AuditAction } from '@prisma/client';

interface AuditLogData {
  actorUserId: string;
  entity: string;
  entityId: string;
  action: AuditAction;
  before?: any;
  after?: any;
}

export async function createAuditLog(data: AuditLogData) {
  const { actorUserId, entity, entityId, action, before, after } = data;

  let diffJson: string | undefined;

  if (action === AuditAction.UPDATE && before && after) {
    const diff: any = {};
    Object.keys(after).forEach((key) => {
      if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
        diff[key] = {
          old: before[key],
          new: after[key],
        };
      }
    });
    diffJson = JSON.stringify(diff);
  } else if (action === AuditAction.CREATE && after) {
    diffJson = JSON.stringify({ created: after });
  } else if (action === AuditAction.DELETE && before) {
    diffJson = JSON.stringify({ deleted: before });
  }

  await prisma.auditLog.create({
    data: {
      actorUserId,
      entity,
      entityId,
      action,
      diffJson,
    },
  });
}

export async function getAuditLogs(filters?: {
  entity?: string;
  entityId?: string;
  actorUserId?: string;
  limit?: number;
}) {
  const { entity, entityId, actorUserId, limit = 100 } = filters || {};

  return await prisma.auditLog.findMany({
    where: {
      ...(entity && { entity }),
      ...(entityId && { entityId }),
      ...(actorUserId && { actorUserId }),
    },
    include: {
      actor: {
        select: {
          id: true,
          fullName: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
}
