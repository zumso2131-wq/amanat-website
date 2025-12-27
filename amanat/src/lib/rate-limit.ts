// ============================================
// RATE LIMITING — Защита от брутфорса
// ============================================

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store (для production используйте Redis)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Очистка старых записей каждые 5 минут
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

interface RateLimitConfig {
  windowMs: number  // Окно в мс
  maxRequests: number  // Макс. запросов в окне
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { windowMs: 60 * 1000, maxRequests: 10 }
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  if (!entry || entry.resetTime < now) {
    // Новая запись или истёкшая
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    }
  }

  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    }
  }

  entry.count++
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  }
}

/**
 * Rate limit для аутентификации
 * 5 попыток в минуту на IP
 */
export function checkAuthRateLimit(ip: string) {
  return checkRateLimit(`auth:${ip}`, {
    windowMs: 60 * 1000, // 1 минута
    maxRequests: 5, // 5 попыток
  })
}

/**
 * Rate limit для API
 * 100 запросов в минуту на IP
 */
export function checkApiRateLimit(ip: string) {
  return checkRateLimit(`api:${ip}`, {
    windowMs: 60 * 1000,
    maxRequests: 100,
  })
}
