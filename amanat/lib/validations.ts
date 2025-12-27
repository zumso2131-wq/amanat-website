import { z } from 'zod';

// ============================================
// AUTH
// ============================================

export const loginSchema = z.object({
  phone: z.string().min(10, 'Введите корректный номер телефона'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
});

// ============================================
// CLIENT
// ============================================

export const clientSchema = z.object({
  fullName: z.string().min(2, 'Введите полное имя'),
  phone: z.string().min(10, 'Введите корректный номер телефона'),
  passportNumber: z.string().optional(),
  passportIssuedBy: z.string().optional(),
  passportIssuedAt: z.string().optional(),
  address: z.string().optional(),
  note: z.string().optional(),
});

export const createClientUserSchema = z.object({
  fullName: z.string().min(2, 'Введите полное имя'),
  phone: z.string().min(10, 'Введите корректный номер телефона'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  passportNumber: z.string().optional(),
  passportIssuedBy: z.string().optional(),
  passportIssuedAt: z.string().optional(),
  address: z.string().optional(),
  note: z.string().optional(),
});

// ============================================
// PRODUCT
// ============================================

export const productSchema = z.object({
  name: z.string().min(2, 'Введите название товара'),
  sku: z.string().optional(),
  category: z.string().optional(),
  defaultPurchasePrice: z.number().min(1, 'Цена должна быть больше 0'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

// ============================================
// DEAL
// ============================================

export const dealSchema = z.object({
  clientId: z.string().min(1, 'Выберите клиента'),
  productName: z.string().min(2, 'Введите название товара'),
  purchasePrice: z.number().min(1, 'Цена закупа должна быть больше 0'),
  months: z.number().min(3, 'Минимум 3 месяца').max(12, 'Максимум 12 месяцев'),
  downPayment: z.number().min(0, 'Взнос не может быть отрицательным'),
  markupPercentInput: z.number().optional(),
  startDate: z.string().min(1, 'Выберите дату'),
  note: z.string().optional(),
});

// ============================================
// PAYMENT
// ============================================

export const paymentSchema = z.object({
  dealId: z.string().min(1, 'Выберите сделку'),
  installmentId: z.string().optional(),
  amount: z.number().min(1, 'Сумма должна быть больше 0'),
  paidAt: z.string().optional(),
  method: z.enum(['CASH', 'CARD', 'TRANSFER']),
  comment: z.string().optional(),
});

// ============================================
// APPLICATION (заявка с публичного сайта)
// ============================================

export const applicationSchema = z.object({
  fullName: z.string().min(2, 'Введите ваше имя'),
  phone: z.string().min(10, 'Введите корректный номер телефона'),
  productName: z.string().min(2, 'Укажите интересующий товар'),
  purchasePrice: z.number().optional(),
  months: z.number().min(3).max(12).optional(),
  comment: z.string().optional(),
});

// ============================================
// CALCULATOR
// ============================================

export const calculatorSchema = z.object({
  purchasePrice: z.number().min(1, 'Введите цену товара'),
  months: z.number().min(3, 'Минимум 3 месяца').max(12, 'Максимум 12 месяцев'),
  downPayment: z.number().min(0, 'Взнос не может быть отрицательным'),
  markupPercentInput: z.number().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type CreateClientUserInput = z.infer<typeof createClientUserSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type DealInput = z.infer<typeof dealSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type CalculatorInput = z.infer<typeof calculatorSchema>;
