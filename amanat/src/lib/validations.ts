// ============================================
// ВАЛИДАЦИЯ ДАННЫХ — ZOD СХЕМЫ
// ============================================
// Единый источник правды для валидации всех форм

import { z } from "zod"
import { MIN_MONTHS, MAX_MONTHS, MIN_MARKUP_3_MONTHS } from "./calculations"

// ============================================
// ОБЩИЕ СХЕМЫ
// ============================================

// Телефон: минимум 10 цифр, допускаются спецсимволы
export const phoneSchema = z
  .string()
  .min(10, "Номер телефона должен содержать минимум 10 цифр")
  .max(20, "Номер телефона слишком длинный")
  .regex(/^[\d\s\-\+\(\)]+$/, "Неверный формат номера телефона")

// Пароль: минимум 6 символов
export const passwordSchema = z
  .string()
  .min(6, "Пароль должен содержать минимум 6 символов")
  .max(100, "Пароль слишком длинный")

// ============================================
// АУТЕНТИФИКАЦИЯ
// ============================================

// Форма входа
export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, "Введите пароль"),
})

// Форма регистрации
export const registerSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema,
  fullName: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  email: z.string().email("Неверный email").optional().or(z.literal("")),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>

// ============================================
// КЛИЕНТЫ
// ============================================

export const clientSchema = z.object({
  fullName: z.string().min(2, "ФИО должно содержать минимум 2 символа"),
  phone: phoneSchema,
  iin: z.string().max(20, "ИИН слишком длинный").optional().or(z.literal("")),
  passportNumber: z.string().max(50, "Номер паспорта слишком длинный").optional().or(z.literal("")),
  passportIssuedBy: z.string().max(200, "Слишком длинное значение").optional().or(z.literal("")),
  passportIssuedAt: z.coerce.date().optional().nullable(),
  address: z.string().max(500, "Адрес слишком длинный").optional().or(z.literal("")),
  note: z.string().max(1000, "Примечание слишком длинное").optional().or(z.literal("")),
})

export type ClientInput = z.infer<typeof clientSchema>

// ============================================
// ТОВАРЫ
// ============================================

export const productSchema = z.object({
  name: z.string().min(2, "Название должно содержать минимум 2 символа"),
  sku: z.string().min(1, "Артикул обязателен"),
  category: z.string().optional().or(z.literal("")),
  description: z.string().max(2000, "Описание слишком длинное").optional().or(z.literal("")),
  defaultPurchasePrice: z.coerce
    .number()
    .min(0, "Цена не может быть отрицательной")
    .int("Цена должна быть целым числом"),
  imageUrl: z.string().url("Неверный URL").optional().or(z.literal("")),
})

export type ProductInput = z.infer<typeof productSchema>

// ============================================
// СДЕЛКИ
// ============================================

export const dealSchema = z.object({
  clientId: z.string().min(1, "Выберите клиента"),
  productName: z.string().min(2, "Название товара обязательно"),
  productSku: z.string().optional().or(z.literal("")),
  purchasePrice: z.coerce
    .number()
    .min(1, "Цена закупа должна быть больше 0")
    .int("Цена должна быть целым числом"),
  markupPercentFinal: z.coerce
    .number()
    .min(0, "Наценка не может быть отрицательной"),
  downPayment: z.coerce
    .number()
    .min(0, "Взнос не может быть отрицательным")
    .int("Взнос должен быть целым числом"),
  months: z.coerce
    .number()
    .min(MIN_MONTHS, `Минимальный срок: ${MIN_MONTHS} месяца`)
    .max(MAX_MONTHS, `Максимальный срок: ${MAX_MONTHS} месяцев`)
    .int("Срок должен быть целым числом"),
  startDate: z.coerce.date({ message: "Выберите дату выдачи" }),
}).refine(
  (data) => {
    // Проверка минимальной наценки для 3 месяцев
    if (data.months === 3 && data.markupPercentFinal < MIN_MARKUP_3_MONTHS) {
      return false
    }
    return true
  },
  {
    message: `Минимальная наценка для 3 месяцев: ${MIN_MARKUP_3_MONTHS}%`,
    path: ["markupPercentFinal"],
  }
).refine(
  (data) => {
    // Проверка: взнос < цена продажи
    const salePrice = Math.round(data.purchasePrice * (1 + data.markupPercentFinal / 100))
    return data.downPayment < salePrice
  },
  {
    message: "Первоначальный взнос должен быть меньше цены продажи",
    path: ["downPayment"],
  }
)

export type DealInput = z.infer<typeof dealSchema>

// ============================================
// ПЛАТЕЖИ
// ============================================

export const paymentSchema = z.object({
  dealId: z.string().min(1, "Выберите сделку"),
  installmentId: z.string().optional().or(z.literal("")),
  amount: z.coerce
    .number()
    .min(1, "Сумма должна быть больше 0")
    .int("Сумма должна быть целым числом"),
  method: z.enum(["CASH", "CARD", "TRANSFER"], {
    message: "Выберите способ оплаты",
  }),
  comment: z.string().max(500, "Комментарий слишком длинный").optional().or(z.literal("")),
})

export type PaymentInput = z.infer<typeof paymentSchema>

// ============================================
// ЗАЯВКИ С САЙТА
// ============================================

export const applicationSchema = z.object({
  fullName: z.string().min(2, "Введите ваше имя"),
  phone: phoneSchema,
  product: z.string().optional().or(z.literal("")),
  message: z.string().max(1000, "Сообщение слишком длинное").optional().or(z.literal("")),
})

export type ApplicationInput = z.infer<typeof applicationSchema>

// ============================================
// ПОЛЬЗОВАТЕЛИ (ADMIN)
// ============================================

export const userSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema.optional(),
  fullName: z.string().min(2, "ФИО должно содержать минимум 2 символа"),
  email: z.string().email("Неверный email").optional().or(z.literal("")),
  role: z.enum(["ADMIN", "MANAGER", "CLIENT"], {
    message: "Выберите роль",
  }),
  isActive: z.boolean().default(true),
})

export type UserInput = z.infer<typeof userSchema>

// ============================================
// ФИЛЬТРЫ И ПАГИНАЦИЯ
// ============================================

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
})

export type PaginationInput = z.infer<typeof paginationSchema>

export const dealFilterSchema = paginationSchema.extend({
  status: z.enum(["DRAFT", "ACTIVE", "CLOSED", "CANCELED"]).optional(),
  clientId: z.string().optional(),
  managerId: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
})

export type DealFilterInput = z.infer<typeof dealFilterSchema>

export const overdueFilterSchema = paginationSchema.extend({
  managerId: z.string().optional(),
  clientId: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  minDaysOverdue: z.coerce.number().optional(),
})

export type OverdueFilterInput = z.infer<typeof overdueFilterSchema>

// ============================================
// КАЛЬКУЛЯТОР
// ============================================

export const calculatorSchema = z.object({
  purchasePrice: z.coerce
    .number()
    .min(1000, "Минимальная сумма: 1 000 ₸"),
  months: z.coerce
    .number()
    .min(MIN_MONTHS, `Минимальный срок: ${MIN_MONTHS} месяца`)
    .max(MAX_MONTHS, `Максимальный срок: ${MAX_MONTHS} месяцев`),
  downPayment: z.coerce
    .number()
    .min(0, "Взнос не может быть отрицательным"),
  customMarkup: z.coerce.number().optional(),
})

export type CalculatorInput = z.infer<typeof calculatorSchema>
