# Аманат — Система рассрочки

Production-ready веб-система для управления рассрочкой на товары. Включает публичный сайт, личный кабинет клиента и административную CRM-панель.

## 🚀 Возможности

### Публичный сайт
- Главная страница с информацией о компании
- Условия рассрочки с таблицей наценок
- Каталог товаров
- Интерактивный калькулятор рассрочки
- FAQ (Часто задаваемые вопросы)
- Контактная информация
- Форма заявки на рассрочку

### Личный кабинет клиента
- Обзор активных сделок
- График предстоящих платежей
- История платежей
- Документы (договор, график)
- Обратная связь с поддержкой

### Административная CRM
- Дашборд с ключевыми показателями
- Управление клиентами (CRUD)
- Управление сделками с автогенерацией графика
- Приём платежей
- Контроль просрочек
- Каталог товаров
- Отчёты и аналитика
- Экспорт данных в CSV
- Генерация PDF (договор, график платежей)
- Управление пользователями и ролями
- Журнал аудита (AuditLog)

## 🛠 Технологии

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **UI:** TailwindCSS + shadcn/ui + Lucide React
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js v5 (Credentials: phone + password)
- **Validation:** Zod
- **RBAC:** Роли ADMIN, MANAGER, CLIENT

## 📊 Правила расчёта рассрочки

### Сроки и наценки

| Срок | Наценка |
|------|---------|
| 3 мес | от 15% (редактируемая) |
| 4 мес | 20% |
| 5 мес | 25% |
| 6 мес | 35% |
| 7 мес | 40% |
| 8 мес | 45% |
| 9 мес | 50% |
| 10 мес | 55% |
| 11 мес | 60% |
| 12 мес | 65% |

**Формула:** `наценка = 35 + (месяцы - 6) × 5` для сроков 7-12 месяцев.

### Расчёт платежей

```
Цена продажи = Цена закупа × (1 + Наценка / 100)
Сумма к выплате = Цена продажи - Первоначальный взнос
Базовый платёж = floor(Сумма к выплате / Месяцы)
Последний платёж = Базовый платёж + Остаток
```

### Даты платежей

- Первый платёж: дата выдачи + 30 дней
- Последующие: +30 дней от предыдущего
- График фиксируется при создании сделки

## 🚦 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка окружения

Скопируйте `.env.example` в `.env` и настройте переменные:

```bash
cp .env.example .env
```

Основные переменные:

```env
# PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/amanat?schema=public"

# NextAuth
AUTH_SECRET="your-secret-key-32-chars-minimum"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Запуск PostgreSQL

Через Docker:

```bash
docker run --name amanat-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=amanat -p 5432:5432 -d postgres:15
```

Или используйте существующую установку PostgreSQL.

### 4. Миграция базы данных

```bash
npm run db:push
```

Или с миграциями:

```bash
npm run db:migrate
```

### 5. Заполнение тестовыми данными

```bash
npm run db:seed
```

Будут созданы демо-аккаунты:

| Роль | Телефон | Пароль |
|------|---------|--------|
| Администратор | +77001234567 | admin123 |
| Менеджер | +77009876543 | manager123 |
| Клиент | +77005551234 | client123 |

### 6. Запуск приложения

```bash
npm run dev
```

Откройте http://localhost:3000

## 📁 Структура проекта

```
src/
├── app/
│   ├── (admin)/           # Админ-панель
│   │   ├── admin/
│   │   │   ├── clients/
│   │   │   ├── deals/
│   │   │   ├── payments/
│   │   │   ├── overdue/
│   │   │   ├── reports/
│   │   │   └── ...
│   │   └── layout.tsx
│   ├── (cabinet)/         # Личный кабинет клиента
│   │   ├── cabinet/
│   │   └── layout.tsx
│   ├── api/               # API маршруты
│   │   ├── auth/
│   │   ├── clients/
│   │   ├── deals/
│   │   ├── payments/
│   │   ├── overdue/
│   │   ├── reports/
│   │   ├── export/
│   │   └── pdf/
│   ├── login/
│   ├── usloviya/
│   ├── catalog/
│   ├── calculator/
│   ├── faq/
│   ├── contacts/
│   ├── apply/
│   └── page.tsx           # Главная страница
├── components/
│   ├── layout/            # Layout компоненты
│   └── ui/                # UI компоненты (shadcn)
├── lib/
│   ├── auth.ts            # NextAuth конфигурация
│   ├── calculations.ts    # Единый модуль расчётов
│   ├── prisma.ts          # Prisma клиент
│   ├── validations.ts     # Zod схемы
│   ├── audit.ts           # AuditLog
│   └── utils.ts           # Утилиты
├── types/
│   └── index.ts           # TypeScript типы
└── middleware.ts          # Route protection
```

## 🔐 Роли и доступ

| Маршрут | PUBLIC | CLIENT | MANAGER | ADMIN |
|---------|--------|--------|---------|-------|
| / | ✅ | ✅ | ✅ | ✅ |
| /login | ✅ | — | — | — |
| /cabinet/* | — | ✅ | — | — |
| /admin/* | — | — | ✅ | ✅ |

## 📄 API Endpoints

### Публичные
- `POST /api/applications` — Создание заявки

### Защищённые (MANAGER/ADMIN)
- `GET/POST /api/clients` — Список/создание клиентов
- `GET/PUT/DELETE /api/clients/[id]` — Операции с клиентом
- `GET/POST /api/deals` — Список/создание сделок
- `GET/PUT/DELETE /api/deals/[id]` — Операции со сделкой
- `GET/POST /api/payments` — Список/создание платежей
- `GET/POST /api/overdue` — Просрочки
- `GET /api/reports` — Отчёты
- `GET /api/export?type=clients|deals|payments` — Экспорт CSV
- `GET /api/pdf?dealId=...&type=contract|schedule` — PDF документы

## 🏗 Деплой

### Vercel (рекомендуется)

1. Подключите репозиторий к Vercel
2. Настройте переменные окружения
3. Подключите PostgreSQL (Vercel Postgres, Neon, Supabase)
4. Deploy!

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Лицензия

MIT

## 👨‍💻 Разработка

```bash
# Запуск в dev режиме
npm run dev

# Prisma Studio (GUI для БД)
npm run db:studio

# Линтинг
npm run lint

# Сборка
npm run build
```

---

Сделано с ❤️ для честной рассрочки
