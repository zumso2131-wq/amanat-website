import { prisma } from './prisma'

export interface AuditLogData {
  actorUserId: string
  entity: string
  entityId: string
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  diffJson?: Record<string, unknown>
}

export async function createAuditLog(data: AuditLogData) {
  try {
    await prisma.auditLog.create({
      data: {
        actorUserId: data.actorUserId,
        entity: data.entity,
        entityId: data.entityId,
        action: data.action,
        diffJson: data.diffJson || {},
      },
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
    // Не прерываем выполнение при ошибке логирования
  }
}
