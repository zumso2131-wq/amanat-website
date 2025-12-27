import { format as dateFnsFormat } from 'date-fns';
import { ru } from 'date-fns/locale';

export function formatDate(date: Date | string, formatStr: string = 'dd.MM.yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateFnsFormat(dateObj, formatStr, { locale: ru });
}

export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'dd.MM.yyyy HH:mm');
}

export function formatMoney(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('ru-KZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num) + ' ₸';
}

export function formatPhone(phone: string): string {
  // +77771234567 -> +7 (777) 123-45-67
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('7')) {
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
  }
  return phone;
}

export function normalizePhone(phone: string): string {
  // Убираем все символы кроме цифр
  let cleaned = phone.replace(/\D/g, '');
  // Если начинается с 8, заменяем на 7
  if (cleaned.startsWith('8')) {
    cleaned = '7' + cleaned.slice(1);
  }
  // Добавляем + в начало
  if (!cleaned.startsWith('7')) {
    cleaned = '7' + cleaned;
  }
  return '+' + cleaned;
}

export function isOverdue(dueDate: Date): boolean {
  return new Date(dueDate) < new Date();
}

export function getDaysDifference(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
