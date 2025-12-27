/**
 * Единый модуль расчётов для системы Аманат
 * Используется в калькуляторе, создании сделок и PDF генерации
 */

export interface CalculationInput {
  purchasePrice: number
  months: number
  markupPercentFinal?: number
  downPayment?: number
}

export interface CalculationResult {
  purchasePrice: number
  markupPercentFinal: number
  salePrice: number
  downPayment: number
  amountToFinance: number
  months: number
  monthlyBasePayment: number
  lastPaymentAdjustment: number
  installments: Array<{
    index: number
    amount: number
  }>
}

/**
 * Вычисляет финальную наценку по правилам Аманат
 */
export function calculateMarkupPercent(months: number, customMarkup?: number): number {
  if (months === 3) {
    return customMarkup !== undefined && customMarkup >= 15 ? customMarkup : 15
  }
  if (months === 5) {
    return 25
  }
  if (months === 6) {
    return 35
  }
  if (months >= 7 && months <= 12) {
    return 35 + (months - 6) * 5
  }
  throw new Error(`Недопустимый срок: ${months} месяцев. Допустимо от 3 до 12.`)
}

/**
 * Проверяет, можно ли редактировать наценку для данного срока
 */
export function isMarkupEditable(months: number): boolean {
  return months === 3
}

/**
 * Вычисляет цену продажи с округлением
 */
export function calculateSalePrice(purchasePrice: number, markupPercent: number): number {
  return Math.round(purchasePrice * (1 + markupPercent / 100))
}

/**
 * Вычисляет сумму к финансированию
 */
export function calculateAmountToFinance(salePrice: number, downPayment: number): number {
  return salePrice - downPayment
}

/**
 * Генерирует график платежей
 */
export function generateInstallmentSchedule(
  amountToFinance: number,
  months: number
): Array<{ index: number; amount: number }> {
  const base = Math.floor(amountToFinance / months)
  const remainder = amountToFinance - base * months
  
  const installments: Array<{ index: number; amount: number }> = []
  
  for (let i = 1; i < months; i++) {
    installments.push({ index: i, amount: base })
  }
  
  installments.push({ index: months, amount: base + remainder })
  
  return installments
}

/**
 * Основная функция расчёта - единый источник правды
 */
export function calculateDeal(input: CalculationInput): CalculationResult {
  const { purchasePrice, months, markupPercentFinal, downPayment = 0 } = input

  // Валидация срока
  if (months < 3 || months > 12) {
    throw new Error('Срок должен быть от 3 до 12 месяцев')
  }

  // Вычисление наценки
  const finalMarkup = markupPercentFinal !== undefined 
    ? markupPercentFinal 
    : calculateMarkupPercent(months)

  // Проверка минимальной наценки для 3 месяцев
  if (months === 3 && finalMarkup < 15) {
    throw new Error('Наценка для 3 месяцев должна быть не менее 15%')
  }

  // Вычисление цены продажи
  const salePrice = calculateSalePrice(purchasePrice, finalMarkup)

  // Валидация первоначального взноса
  if (downPayment < 0 || downPayment >= salePrice) {
    throw new Error('Первоначальный взнос должен быть от 0 до цены продажи (не включая)')
  }

  // Вычисление суммы к финансированию
  const amountToFinance = calculateAmountToFinance(salePrice, downPayment)

  // Генерация графика
  const installments = generateInstallmentSchedule(amountToFinance, months)
  const monthlyBasePayment = installments[0].amount
  const lastPaymentAdjustment = installments[installments.length - 1].amount - monthlyBasePayment

  return {
    purchasePrice,
    markupPercentFinal: finalMarkup,
    salePrice,
    downPayment,
    amountToFinance,
    months,
    monthlyBasePayment,
    lastPaymentAdjustment,
    installments,
  }
}

/**
 * Вычисляет дату платежа по индексу
 */
export function calculateDueDate(startDate: Date, index: number): Date {
  const date = new Date(startDate)
  date.setDate(date.getDate() + 30 * index)
  return date
}
