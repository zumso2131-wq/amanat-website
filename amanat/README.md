# Аманат - Система Управления Рассрочкой

Production-ready веб-система для управления продажами в рассрочку. Включает публичный сайт, личный кабинет клиента и полноценную CRM-систему для администрирования.

## 🚀 Возможности

### Публичная часть
- 🏠 Главная страница с информацией о компании
- 📊 Калькулятор рассрочки с динамическим расчётом
- 📦 Каталог товаров
- 📝 Форма подачи заявки
- ❓ FAQ и контакты

### Личный кабинет клиента
- 📈 Обзор активных сделок
- 💳 График платежей
- 📄 Документы (договоры, графики)
- 📜 История платежей
- 💬 Поддержка

### Админ CRM
- 📊 Дашборд с аналитикой
- 👥 Управление клиентами (CRUD)
- 🤝 Управление сделками с автогенерацией графика
- 💰 Учёт платежей
- ⚠️ Мониторинг просрочек
- 📦 Управление товарами
- 📄 Генерация PDF (договоры + графики)
- 📈 Отчёты и статистика
- 📤 Экспорт в CSV
- 🔍 Audit Log (история действий)
- ⚙️ Настройки системы

## 🛠 Технологический стек

- **Frontend/Backend**: Next.js 14 (App Router) + TypeScript
- **UI**: TailwindCSS + Custom Components + Lucide Icons
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (Credentials Provider)
- **Validation**: Zod
- **PDF Generation**: PDFKit
- **Export**: CSV

## 📐 Архитектура

```
amanat/
├── app/                      # Next.js App Router
│   ├── (public routes)       # Публичные страницы
│   │   ├── page.tsx          # Главная
│   │   ├── calculator/       # Калькулятор
│   │   ├── catalog/          # Каталог
│   │   ├── contacts/         # Контакты
│   │   ├── faq/              # FAQ
│   │   └── apply/            # Заявка
│   ├── login/                # Страница входа
│   ├── cabinet/              # Личный кабинет клиента
│   └── admin/                # CRM админка
│       ├── clients/          # Клиенты
│       ├── deals/            # Сделки
│       ├── payments/         # Платежи
│       ├── overdue/          # Просрочки
│       ├── products/         # Товары
│       ├── reports/          # Отчёты
│       └── audit/            # История действий
├── components/               # Переиспользуемые компоненты
├── lib/                      # Бизнес-логика и утилиты
│   ├── calculations.ts       # Единый модуль расчётов
│   ├── prisma.ts             # Prisma Client
│   ├── auth.ts               # NextAuth конфигурация
│   ├── audit.ts              # Audit Log
│   ├── pdf.ts                # PDF генерация
│   ├── utils.ts              # Утилиты
│   └── validations.ts        # Zod схемы
├── prisma/
│   ├── schema.prisma         # Схема БД
│   └── seed.ts               # Seed данные
└── middleware.ts             # RBAC middleware
```

## 🎯 Бизнес-правила расчёта рассрочки

### Правила наценки (единый источник истины)

```typescript
// Срок: 3-12 месяцев
months = 3:  markupPercent >= 15% (редактируемая)
months = 5:  markupPercent = 25% (фиксированная)
months = 6:  markupPercent = 35% (фиксированная)
months = 7:  markupPercent = 40%
months = 8:  markupPercent = 45%
months = 9:  markupPercent = 50%
months = 10: markupPercent = 55%
months = 11: markupPercent = 60%
months = 12: markupPercent = 65%

// Формула для 7-12 месяцев:
markupPercent = 35 + (months - 6) * 5
```

### Расчёт платежей

```typescript
salePrice = round(purchasePrice * (1 + markupPercent/100))
amountToFinance = salePrice - downPayment
monthlyBasePayment = floor(amountToFinance / months)
remainder = amountToFinance - monthlyBasePayment * months
lastPayment = monthlyBasePayment + remainder
```

### График платежей

- Дата платежа: `startDate + 30 * i дней`, где i = 1..months
- График фиксируется при создании и не пересчитывается
- Первые (n-1) платежей: `monthlyBasePayment`
- Последний платёж: `monthlyBasePayment + remainder`

## 🗄 База данных

### Основные сущности

- **User** - пользователи системы (ADMIN, MANAGER, CLIENT)
- **Client** - клиенты (расширенная информация)
- **Product** - товары
- **Deal** - сделки с автоматическим расчётом
- **Installment** - график платежей (генерируется автоматически)
- **Payment** - платежи
- **Document** - документы (PDF)
- **Notification** - уведомления
- **AuditLog** - журнал действий
- **SystemSetting** - настройки системы

## 🚦 Установка и запуск

### Требования

- Node.js 18+
- PostgreSQL 14+
- npm или yarn

### 1. Клонирование и установка зависимостей

```bash
cd amanat
npm install
```

### 2. Настройка окружения

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Отредактируйте `.env`:

```env
# DATABASE
DATABASE_URL="postgresql://postgres:password@localhost:5432/amanat?schema=public"

# NEXTAUTH
NEXTAUTH_SECRET="your-super-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# APP
NODE_ENV="development"
```

### 3. Настройка базы данных

```bash
# Генерация Prisma Client
npm run db:generate

# Применение миграций
npm run db:push

# Заполнение тестовыми данными
npm run db:seed
```

### 4. Запуск приложения

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

Приложение будет доступно по адресу: http://localhost:3000

## 👤 Тестовые учетные данные

После выполнения `npm run db:seed` будут созданы:

| Роль          | Телефон         | Пароль     | Описание         |
|---------------|-----------------|------------|------------------|
| Администратор | +77771234567    | admin123   | Полный доступ    |
| Менеджер      | +77771234568    | manager123 | CRM доступ       |
| Клиент        | +77771234569    | client123  | Личный кабинет   |

## 🔐 Система ролей (RBAC)

### ADMIN
- Полный доступ ко всем разделам
- Управление пользователями и ролями
- Удаление критичных данных
- Доступ к истории действий

### MANAGER
- Управление клиентами и сделками
- Учёт платежей
- Просмотр отчётов
- Генерация документов

### CLIENT
- Личный кабинет
- Просмотр своих сделок
- График платежей
- Скачивание документов

## 📄 PDF-документы

Система автоматически генерирует:

1. **Договор рассрочки** - полный договор с реквизитами сторон
2. **График платежей** - таблица с датами и суммами платежей

Скачивание доступно:
- Клиентам - в личном кабинете
- Менеджерам - в разделе сделок

API endpoints:
- `/api/pdf/[dealId]/contract` - договор
- `/api/pdf/[dealId]/schedule` - график

## 📊 Экспорт данных

Экспорт в CSV доступен для:
- Сделок (`/api/export/deals`)
- Платежей (`/api/export/payments`)

Формат CSV совместим с Excel и Google Sheets.

## 🔍 Audit Log

Система логирует все изменения:
- Создание/изменение/удаление клиентов
- Создание сделок
- Добавление платежей
- С указанием актора, даты и изменений

## 🧪 Тестирование расчётов

Модуль `lib/calculations.ts` содержит всю логику расчётов. Пример использования:

```typescript
import { calculateDeal, generateInstallmentSchedule } from '@/lib/calculations';

const result = calculateDeal({
  purchasePrice: 450000,
  months: 6,
  downPayment: 50000,
});

console.log(result);
// {
//   purchasePrice: 450000,
//   months: 6,
//   markupPercentFinal: 35,
//   salePrice: 607500,
//   downPayment: 50000,
//   amountToFinance: 557500,
//   monthlyBasePayment: 92916,
//   lastPaymentAdjustment: 4,
//   lastPayment: 92920,
//   ...
// }
```

## 🏗 Структура кода

### Принципы

1. **DRY** - Единый модуль расчётов используется везде
2. **Type Safety** - Строгая типизация TypeScript
3. **Validation** - Zod схемы для всех входных данных
4. **Security** - RBAC, защита роутов, audit log
5. **Modularity** - Разделение ответственности

### Ключевые модули

- `lib/calculations.ts` - Бизнес-логика расчётов (единый источник)
- `lib/auth.ts` - Аутентификация и авторизация
- `lib/audit.ts` - Логирование действий
- `lib/pdf.ts` - Генерация PDF
- `lib/validations.ts` - Валидация входных данных
- `middleware.ts` - Защита роутов

## 📦 Зависимости

### Production
- next@^14.2.0
- react@^18.3.0
- @prisma/client@^5.22.0
- next-auth@^4.24.7
- bcrypt@^5.1.1
- zod@^3.23.8
- pdfkit@^0.15.0
- date-fns@^4.1.0

### Development
- typescript@^5.6.0
- tailwindcss@^3.4.0
- prisma@^5.22.0

## 🚀 Деплой

### Vercel (рекомендуется)

```bash
# Установка Vercel CLI
npm i -g vercel

# Деплой
vercel

# Production
vercel --prod
```

### Docker (опционально)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Переменные окружения для продакшена

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="long-random-string-min-32-chars"
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV="production"
```

## 🛡 Безопасность

- ✅ Bcrypt для хеширования паролей
- ✅ NextAuth session management
- ✅ RBAC middleware
- ✅ Zod валидация всех входов
- ✅ SQL injection protection (Prisma)
- ✅ XSS protection (React)
- ✅ CSRF protection (NextAuth)

## 📝 TODO (будущие улучшения)

- [ ] Email уведомления
- [ ] SMS рассылка
- [ ] Push уведомления
- [ ] Интеграция с платёжными системами
- [ ] Мобильное приложение
- [ ] Telegram бот
- [ ] Расширенная аналитика

## 🤝 Поддержка

При возникновении вопросов:
- Email: info@amanat.kz
- Телефон: +7 (777) 123-45-67

## 📄 Лицензия

Proprietary - Все права защищены.

---

**Разработано с ❤️ для "Аманат"**
