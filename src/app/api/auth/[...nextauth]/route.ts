// ============================================
// NEXTAUTH API ROUTE
// ============================================
// Обработчик запросов аутентификации
// GET — получение сессии, CSRF токена
// POST — вход, выход

import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers
