// ============================================
// AUDIT LOG - ЛОГИРОВАНИЕ ДЕЙСТВИЙ
// ============================================

import { prisma } from './prisma'

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE'

export interface AuditParams {
  actorUserId?: string | null
  entity: string
  entityId: string
  action: AuditAction
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

/**
 * Записать действие в лог аудита
 */
export async function logAudit(params: AuditParams): Promise<void> {
  try {
    const { actorUserId, entity, entityId, action, before, after, ipAddress, userAgent } = params

    // Формируем diff
    let diffJson: string | null = null
    if (before || after) {
      diffJson = JSON.stringify({ before: before || null, after: after || null })
    }

    await prisma.auditLog.create({
      data: {
        actorUserId,
        entity,
        entityId,
        action,
        diffJson,
        ipAddress,
        userAgent,
      },
    })
  } catch (error) {
    // Не блокируем основную операцию при ошибке логирования
    console.error('Audit log error:', error)
  }
}

/**
 * Логировать создание сущности
 */
export async function logCreate<T extends Record<string, unknown>>(
  actorUserId: string | null,
  entity: string,
  entityId: string,
  data: T
): Promise<void> {
  await logAudit({
    actorUserId,
    entity,
    entityId,
    action: 'CREATE',
    after: sanitizeForLog(data),
  })
}

/**
 * Логировать обновление сущности
 */
export async function logUpdate<T extends Record<string, unknown>>(
  actorUserId: string | null,
  entity: string,
  entityId: string,
  before: T,
  after: T
): Promise<void> {
  await logAudit({
    actorUserId,
    entity,
    entityId,
    action: 'UPDATE',
    before: sanitizeForLog(before),
    after: sanitizeForLog(after),
  })
}

/**
 * Логировать удаление сущности
 */
export async function logDelete<T extends Record<string, unknown>>(
  actorUserId: string | null,
  entity: string,
  entityId: string,
  data: T
): Promise<void> {
  await logAudit({
    actorUserId,
    entity,
    entityId,
    action: 'DELETE',
    before: sanitizeForLog(data),
  })
}

/**
 * Очистить данные для логирования (убрать чувствительные поля)
 */
function sanitizeForLog(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...data }
  
  // Убираем пароли и токены
  const sensitiveFields = ['password', 'passwordHash', 'token', 'secret']
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[HIDDEN]'
    }
  }

  // Преобразуем даты в строки
  for (const [key, value] of Object.entries(sanitized)) {
    if (value instanceof Date) {
      sanitized[key] = value.toISOString()
    }
  }

  return sanitized
}

/**
 * Получить историю изменений сущности
 */
export async function getEntityHistory(entity: string, entityId: string) {
  return prisma.auditLog.findMany({
    where: { entity, entityId },
    include: {
      actorUser: {
        select: { id: true, fullName: true, role: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Получить все действия пользователя
 */
export async function getUserActions(userId: string, limit = 50) {
  return prisma.auditLog.findMany({
    where: { actorUserId: userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}
