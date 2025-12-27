// ============================================
// ОБЩИЕ УТИЛИТЫ
// ============================================

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Объединение классов Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Форматирование номера телефона
 */
export function formatPhone(phone: string): string {
  // Убираем всё кроме цифр
  const digits = phone.replace(/\D/g, '')
  
  // Форматируем как +7 (XXX) XXX-XX-XX
  if (digits.length === 11 && digits.startsWith('7')) {
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`
  }
  
  // Если 10 цифр, добавляем +7
  if (digits.length === 10) {
    return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8)}`
  }
  
  return phone
}

/**
 * Очистка номера телефона (только цифры)
 */
export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

/**
 * Склонение слов в зависимости от числа
 * @example pluralize(5, ['день', 'дня', 'дней']) => '5 дней'
 */
export function pluralize(n: number, forms: [string, string, string]): string {
  const n10 = n % 10
  const n100 = n % 100
  
  if (n100 >= 11 && n100 <= 19) {
    return `${n} ${forms[2]}`
  }
  
  if (n10 === 1) {
    return `${n} ${forms[0]}`
  }
  
  if (n10 >= 2 && n10 <= 4) {
    return `${n} ${forms[1]}`
  }
  
  return `${n} ${forms[2]}`
}

/**
 * Генерация случайного ID
 */
export function generateId(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Debounce функция
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Задержка выполнения
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Безопасный JSON.parse
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

/**
 * Проверка, является ли объект пустым
 */
export function isEmpty(obj: unknown): boolean {
  if (obj === null || obj === undefined) return true
  if (typeof obj === 'string') return obj.trim() === ''
  if (Array.isArray(obj)) return obj.length === 0
  if (typeof obj === 'object') return Object.keys(obj).length === 0
  return false
}

/**
 * Получить инициалы из имени
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

/**
 * Обрезка текста с многоточием
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length - 3) + '...'
}

/**
 * Конвертация объекта в query string
 */
export function toQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams()
  
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  }
  
  return searchParams.toString()
}

/**
 * Статусы сделки на русском
 */
export const dealStatusLabels: Record<string, string> = {
  DRAFT: 'Черновик',
  ACTIVE: 'Активна',
  CLOSED: 'Закрыта',
  CANCELED: 'Отменена',
}

/**
 * Цвета статусов сделки
 */
export const dealStatusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  ACTIVE: 'bg-green-100 text-green-800',
  CLOSED: 'bg-blue-100 text-blue-800',
  CANCELED: 'bg-red-100 text-red-800',
}

/**
 * Статусы платежей на русском
 */
export const installmentStatusLabels: Record<string, string> = {
  DUE: 'Ожидает',
  PAID: 'Оплачен',
  OVERDUE: 'Просрочен',
}

/**
 * Цвета статусов платежей
 */
export const installmentStatusColors: Record<string, string> = {
  DUE: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
}

/**
 * Способы оплаты на русском
 */
export const paymentMethodLabels: Record<string, string> = {
  CASH: 'Наличные',
  CARD: 'Карта',
  TRANSFER: 'Перевод',
}

/**
 * Роли на русском
 */
export const roleLabels: Record<string, string> = {
  ADMIN: 'Администратор',
  MANAGER: 'Менеджер',
  CLIENT: 'Клиент',
}
