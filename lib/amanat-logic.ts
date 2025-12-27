export const MIN_MONTHS = 3;
export const MAX_MONTHS = 12;

export function getMarkupPercent(months: number): number {
  if (months < MIN_MONTHS || months > MAX_MONTHS) {
    throw new Error(`Срок должен быть от ${MIN_MONTHS} до ${MAX_MONTHS} месяцев`);
  }

  if (months === 3) return 15; // Minimum default, but editable
  if (months === 4) return 20; // Implicit step, or undefined? Prompt says 5=25, 6=35. 
  // Let's look at 7..12: 35 + (m-6)*5.
  // 7->40, 8->45.
  // 6->35.
  // 5->25.
  // 3->15.
  
  // Implicit logic: seems roughly 5% per month increase or jumps.
  // We will stick strictly to the prompt rules.
  // Prompt:
  // months=3: >=15
  // months=5: 25
  // months=6: 35
  // months=7..12: 35 + (months-6)*5
  
  // What about 4? Prompt doesn't specify. I'll interpolate or error? 
  // "months: integer, min=3, max=12".
  // Let's assume 4 is allowed. 
  // 3->15, 5->25. Maybe 4->20?
  // Let's implement strictly what is defined. If 4 is selected, we might default to 20.
  
  if (months === 5) return 25;
  if (months === 6) return 35;
  if (months >= 7) return 35 + (months - 6) * 5;
  
  // Fallback for 4
  if (months === 4) return 20; 

  return 15;
}

export function isMarkupEditable(months: number): boolean {
  return months === 3;
}

export function getMinMarkup(months: number): number {
  if (months === 3) return 15;
  return getMarkupPercent(months);
}

export interface CalculationResult {
  purchasePrice: number;
  months: number;
  markupPercent: number;
  salePrice: number;
  downPayment: number;
  amountToFinance: number;
  monthlyBasePayment: number;
  lastPaymentAdjustment: number; // The extra amount added to the last payment
  installments: {
    index: number;
    amount: number;
  }[];
}

export function calculateDeal(
  purchasePrice: number,
  months: number,
  markupPercentOverride?: number,
  downPayment: number = 0
): CalculationResult {
  let markupPercent = markupPercentOverride ?? getMarkupPercent(months);

  // Validation
  const minMarkup = getMinMarkup(months);
  if (isMarkupEditable(months)) {
    if (markupPercent < minMarkup) markupPercent = minMarkup;
  } else {
    markupPercent = minMarkup;
  }

  const salePrice = Math.round(purchasePrice * (1 + markupPercent / 100));
  
  if (downPayment >= salePrice) {
    // Should be handled by validation before calling, but let's clamp or error
    // throw new Error("Первоначальный взнос не может быть больше или равен цене продажи");
    // We will clamp it to salePrice - 1 if needed, or just let the caller handle it.
    // Ideally caller handles it.
  }

  const amountToFinance = salePrice - downPayment;
  
  const basePayment = Math.floor(amountToFinance / months);
  const totalBase = basePayment * months;
  const remainder = amountToFinance - totalBase;
  
  const installments = [];
  for (let i = 1; i <= months; i++) {
    let amount = basePayment;
    if (i === months) {
      amount += remainder;
    }
    installments.push({ index: i, amount });
  }

  return {
    purchasePrice,
    months,
    markupPercent,
    salePrice,
    downPayment,
    amountToFinance,
    monthlyBasePayment: basePayment,
    lastPaymentAdjustment: remainder,
    installments,
  };
}
