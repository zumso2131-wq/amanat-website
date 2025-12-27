// ============================================
// ЕДИНЫЙ МОДУЛЬ РАСЧЁТОВ СИСТЕМЫ "АМАНАТ"
// ============================================
// Этот модуль — единственный источник правды для всех расчётов:
// калькулятор, создание сделки, PDF документы

import { DealCalculation, InstallmentCalculation } from '@/types'

// ============================================
// КОНСТАНТЫ
// ============================================

export const MIN_MONTHS = 3
export const MAX_MONTHS = 12

// Фиксированные наценки для определённых сроков
export const FIXED_MARKUP: Record<number, number> = {
  5: 25,  // 5 месяцев = 25%
  6: 35,  // 6 месяцев = 35%
}

// Минимальная наценка для 3 месяцев
export const MIN_MARKUP_3_MONTHS = 15

// ============================================
// РАСЧЁТ НАЦЕНКИ
// ============================================

/**
 * Получить наценку по сроку рассрочки
 * @param months - срок в месяцах (3-12)
 * @param customMarkup - пользовательская наценка (только для 3 мес)
 * @returns процент наценки
 */
export function getMarkupPercent(months: number, customMarkup?: number): number {
  // Валидация срока
  if (months < MIN_MONTHS || months > MAX_MONTHS) {
    throw new Error(`Срок рассрочки должен быть от ${MIN_MONTHS} до ${MAX_MONTHS} месяцев`)
  }

  // 3 месяца - пользовательская наценка, минимум 15%
  if (months === 3) {
    const markup = customMarkup ?? MIN_MARKUP_3_MONTHS
    if (markup < MIN_MARKUP_3_MONTHS) {
      throw new Error(`Минимальная наценка для 3 месяцев: ${MIN_MARKUP_3_MONTHS}%`)
    }
    return markup
  }

  // 4 месяца - нет в правилах, используем линейную интерполяцию
  if (months === 4) {
    return 20 // между 15% (3 мес) и 25% (5 мес)
  }

  // 5-6 месяцев - фиксированная наценка
  if (FIXED_MARKUP[months] !== undefined) {
    return FIXED_MARKUP[months]
  }

  // 7-12 месяцев: 35 + (months - 6) * 5
  // 7=40, 8=45, 9=50, 10=55, 11=60, 12=65
  return 35 + (months - 6) * 5
}

/**
 * Проверить, редактируемо ли поле наценки
 * @param months - срок в месяцах
 * @returns true если поле редактируемо
 */
export function isMarkupEditable(months: number): boolean {
  return months === 3
}

/**
 * Получить информацию о наценке для UI
 */
export function getMarkupInfo(months: number): {
  value: number
  editable: boolean
  min?: number
  label: string
} {
  const editable = isMarkupEditable(months)
  const value = getMarkupPercent(months)
  
  return {
    value,
    editable,
    min: editable ? MIN_MARKUP_3_MONTHS : undefined,
    label: editable 
      ? `Наценка (мин. ${MIN_MARKUP_3_MONTHS}%)`
      : `Наценка (фикс. ${value}%)`
  }
}

// ============================================
// РАСЧЁТ ЦЕНЫ ПРОДАЖИ
// ============================================

/**
 * Рассчитать цену продажи
 * @param purchasePrice - закупочная цена
 * @param markupPercent - процент наценки
 * @returns цена продажи (округлённая)
 */
export function calculateSalePrice(purchasePrice: number, markupPercent: number): number {
  if (purchasePrice < 0) {
    throw new Error('Цена закупа не может быть отрицательной')
  }
  if (markupPercent < 0) {
    throw new Error('Наценка не может быть отрицательной')
  }
  return Math.round(purchasePrice * (1 + markupPercent / 100))
}

// ============================================
// РАСЧЁТ СУММЫ К ФИНАНСИРОВАНИЮ
// ============================================

/**
 * Рассчитать сумму к выплате
 * @param salePrice - цена продажи
 * @param downPayment - первоначальный взнос
 * @returns сумма к выплате
 */
export function calculateAmountToFinance(salePrice: number, downPayment: number): number {
  if (downPayment < 0) {
    throw new Error('Первоначальный взнос не может быть отрицательным')
  }
  if (downPayment >= salePrice) {
    throw new Error('Первоначальный взнос должен быть меньше цены продажи')
  }
  return salePrice - downPayment
}

// ============================================
// РАСЧЁТ ГРАФИКА ПЛАТЕЖЕЙ
// ============================================

/**
 * Рассчитать график платежей
 * @param amountToFinance - сумма к выплате
 * @param months - количество месяцев
 * @param startDate - дата выдачи товара
 * @returns массив платежей
 */
export function calculateInstallments(
  amountToFinance: number,
  months: number,
  startDate: Date
): InstallmentCalculation[] {
  if (months < MIN_MONTHS || months > MAX_MONTHS) {
    throw new Error(`Срок рассрочки должен быть от ${MIN_MONTHS} до ${MAX_MONTHS} месяцев`)
  }

  // Базовый платёж (округление вниз)
  const basePayment = Math.floor(amountToFinance / months)
  
  // Остаток для последнего платежа
  const remainder = amountToFinance - basePayment * months
  
  const installments: InstallmentCalculation[] = []

  for (let i = 1; i <= months; i++) {
    // Дата платежа = startDate + 30 * i дней
    const dueDate = new Date(startDate)
    dueDate.setDate(dueDate.getDate() + 30 * i)

    // Последний платёж включает остаток
    const amount = i === months ? basePayment + remainder : basePayment

    installments.push({
      index: i,
      dueDate,
      amount
    })
  }

  return installments
}

// ============================================
// ПОЛНЫЙ РАСЧЁТ СДЕЛКИ
// ============================================

/**
 * Выполнить полный расчёт сделки
 * @param params - параметры сделки
 * @returns полный расчёт
 */
export function calculateDeal(params: {
  purchasePrice: number
  months: number
  downPayment: number
  startDate: Date
  customMarkup?: number
}): DealCalculation {
  const { purchasePrice, months, downPayment, startDate, customMarkup } = params

  // Валидация
  if (purchasePrice <= 0) {
    throw new Error('Цена закупа должна быть больше 0')
  }
  if (months < MIN_MONTHS || months > MAX_MONTHS) {
    throw new Error(`Срок рассрочки: от ${MIN_MONTHS} до ${MAX_MONTHS} месяцев`)
  }
  if (downPayment < 0) {
    throw new Error('Первоначальный взнос не может быть отрицательным')
  }

  // Расчёт наценки
  const markupPercentFinal = getMarkupPercent(months, customMarkup)

  // Расчёт цены продажи
  const salePrice = calculateSalePrice(purchasePrice, markupPercentFinal)

  // Проверка взноса
  if (downPayment >= salePrice) {
    throw new Error('Первоначальный взнос должен быть меньше цены продажи')
  }

  // Сумма к выплате
  const amountToFinance = calculateAmountToFinance(salePrice, downPayment)

  // Базовый платёж
  const monthlyBasePayment = Math.floor(amountToFinance / months)
  
  // Корректировка последнего платежа
  const lastPaymentAdjustment = amountToFinance - monthlyBasePayment * months

  // График платежей
  const installments = calculateInstallments(amountToFinance, months, startDate)

  return {
    purchasePrice,
    markupPercentFinal,
    salePrice,
    downPayment,
    amountToFinance,
    months,
    monthlyBasePayment,
    lastPaymentAdjustment,
    installments
  }
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

/**
 * Форматирование суммы в тенге
 */
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount) + ' ₸'
}

/**
 * Форматирование даты
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/**
 * Проверка просрочки
 */
export function isOverdue(dueDate: Date | string, status: string): boolean {
  if (status === 'PAID') return false
  const d = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return d < today
}

/**
 * Расчёт дней просрочки
 */
export function getDaysOverdue(dueDate: Date | string): number {
  const d = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  const diff = today.getTime() - d.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

/**
 * Генерация номера сделки
 */
export function generateDealNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `AM-${year}${month}-${random}`
}

/**
 * Получить все варианты сроков с наценками
 */
export function getMonthOptions(): Array<{
  months: number
  markup: number
  editable: boolean
}> {
  const options = []
  for (let m = MIN_MONTHS; m <= MAX_MONTHS; m++) {
    options.push({
      months: m,
      markup: getMarkupPercent(m),
      editable: isMarkupEditable(m)
    })
  }
  return options
}
