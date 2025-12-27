// ============================================
// ТИПЫ СИСТЕМЫ "АМАНАТ"
// ============================================

import { 
  Role, 
  DealStatus, 
  InstallmentStatus, 
  PaymentMethod, 
  DocumentType,
  NotificationStatus,
  NotificationType
} from '@prisma/client'

export type { 
  Role, 
  DealStatus, 
  InstallmentStatus, 
  PaymentMethod, 
  DocumentType,
  NotificationStatus,
  NotificationType
}

// Сессия пользователя
export interface SessionUser {
  id: string
  role: Role
  phone: string
  fullName: string
  email?: string | null
}

// Расчёт сделки
export interface DealCalculation {
  purchasePrice: number
  markupPercentFinal: number
  salePrice: number
  downPayment: number
  amountToFinance: number
  months: number
  monthlyBasePayment: number
  lastPaymentAdjustment: number
  installments: InstallmentCalculation[]
}

export interface InstallmentCalculation {
  index: number
  dueDate: Date
  amount: number
}

// Форма создания сделки
export interface DealFormData {
  clientId: string
  productName: string
  productSku?: string
  purchasePrice: number
  markupPercentFinal: number
  downPayment: number
  months: number
  startDate: Date
}

// Форма создания клиента
export interface ClientFormData {
  fullName: string
  phone: string
  iin?: string
  passportNumber?: string
  passportIssuedBy?: string
  passportIssuedAt?: Date
  address?: string
  note?: string
}

// Форма создания товара
export interface ProductFormData {
  name: string
  sku: string
  category?: string
  description?: string
  defaultPurchasePrice: number
  imageUrl?: string
}

// Форма платежа
export interface PaymentFormData {
  dealId: string
  installmentId?: string
  amount: number
  method: PaymentMethod
  comment?: string
}

// Отчёты
export interface ReportSummary {
  totalDeals: number
  activeDeals: number
  closedDeals: number
  totalRevenue: number      // выручка (сумма платежей)
  totalProfit: number       // прибыль (salePrice - purchasePrice)
  totalReceivables: number  // дебиторка (оставшиеся платежи)
  overdueAmount: number     // сумма просрочек
  overdueCount: number      // количество просроченных платежей
}

// Просрочка
export interface OverdueInstallment {
  id: string
  dealId: string
  dealNumber: string
  clientName: string
  clientPhone: string
  dueDate: Date
  amount: number
  daysOverdue: number
  managerName: string
}

// Пагинация
export interface PaginationParams {
  page: number
  limit: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// API Response
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
