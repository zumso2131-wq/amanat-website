/**
 * Единый модуль расчётов для системы "Аманат"
 * Содержит всю бизнес-логику расчёта наценок, платежей и графиков
 * Используется везде: калькулятор, создание сделки, PDF-генерация
 */

export interface CalculationInput {
  purchasePrice: number;
  months: number;
  downPayment: number;
  markupPercentInput?: number; // только для months=3
}

export interface CalculationResult {
  purchasePrice: number;
  months: number;
  markupPercentFinal: number;
  salePrice: number;
  downPayment: number;
  amountToFinance: number;
  monthlyBasePayment: number;
  lastPaymentAdjustment: number;
  lastPayment: number;
  totalToRepay: number;
  profit: number;
}

export interface InstallmentScheduleItem {
  index: number;
  dueDate: Date;
  amount: number;
}

/**
 * Расчёт наценки по правилам Аманат
 */
export function calculateMarkup(months: number, customMarkup?: number): number {
  if (months === 3) {
    // Для 3 месяцев - минимум 15%, можно больше
    if (customMarkup !== undefined) {
      if (customMarkup < 15) {
        throw new Error('Для 3 месяцев наценка должна быть минимум 15%');
      }
      return customMarkup;
    }
    return 15;
  } else if (months === 5) {
    return 25;
  } else if (months === 6) {
    return 35;
  } else if (months >= 7 && months <= 12) {
    // 7=40, 8=45, 9=50, 10=55, 11=60, 12=65
    return 35 + (months - 6) * 5;
  }
  
  throw new Error('Срок должен быть от 3 до 12 месяцев');
}

/**
 * Валидация входных данных
 */
export function validateCalculationInput(input: CalculationInput): string[] {
  const errors: string[] = [];

  if (input.purchasePrice <= 0) {
    errors.push('Цена закупа должна быть больше 0');
  }

  if (input.months < 3 || input.months > 12) {
    errors.push('Срок должен быть от 3 до 12 месяцев');
  }

  if (input.downPayment < 0) {
    errors.push('Первоначальный взнос не может быть отрицательным');
  }

  // Проверка наценки для months=3
  if (input.months === 3 && input.markupPercentInput !== undefined) {
    if (input.markupPercentInput < 15) {
      errors.push('Для срока 3 месяца минимальная наценка 15%');
    }
  }

  return errors;
}

/**
 * Основной расчёт сделки
 */
export function calculateDeal(input: CalculationInput): CalculationResult {
  // Валидация
  const errors = validateCalculationInput(input);
  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }

  const { purchasePrice, months, downPayment, markupPercentInput } = input;

  // Расчёт наценки
  const markupPercentFinal = calculateMarkup(months, markupPercentInput);

  // Цена продажи с наценкой (округление до целого)
  const salePrice = Math.round(purchasePrice * (1 + markupPercentFinal / 100));

  // Проверка: взнос не должен быть >= цены продажи
  if (downPayment >= salePrice) {
    throw new Error('Первоначальный взнос должен быть меньше цены продажи');
  }

  // Сумма к финансированию
  const amountToFinance = salePrice - downPayment;

  // Расчёт графика платежей
  // Базовый платёж (округление вниз)
  const monthlyBasePayment = Math.floor(amountToFinance / months);

  // Остаток добавляется к последнему платежу
  const remainder = amountToFinance - monthlyBasePayment * months;
  const lastPaymentAdjustment = remainder;
  const lastPayment = monthlyBasePayment + lastPaymentAdjustment;

  // Итоги
  const totalToRepay = amountToFinance;
  const profit = salePrice - purchasePrice;

  return {
    purchasePrice,
    months,
    markupPercentFinal,
    salePrice,
    downPayment,
    amountToFinance,
    monthlyBasePayment,
    lastPaymentAdjustment,
    lastPayment,
    totalToRepay,
    profit,
  };
}

/**
 * Генерация графика платежей с датами
 */
export function generateInstallmentSchedule(
  calc: CalculationResult,
  startDate: Date
): InstallmentScheduleItem[] {
  const schedule: InstallmentScheduleItem[] = [];

  for (let i = 1; i <= calc.months; i++) {
    // Дата платежа: startDate + 30 * i дней
    const dueDate = new Date(startDate);
    dueDate.setDate(dueDate.getDate() + 30 * i);

    const amount = i === calc.months 
      ? calc.lastPayment 
      : calc.monthlyBasePayment;

    schedule.push({
      index: i,
      dueDate,
      amount,
    });
  }

  return schedule;
}

/**
 * Проверка доступности редактирования наценки
 */
export function isMarkupEditable(months: number): boolean {
  return months === 3;
}

/**
 * Получение минимальной наценки для срока
 */
export function getMinMarkup(months: number): number {
  if (months === 3) return 15;
  return calculateMarkup(months);
}

/**
 * Форматирование суммы для отображения
 */
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('ru-KZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Форматирование процента
 */
export function formatPercent(percent: number): string {
  return `${percent.toFixed(2)}%`;
}
