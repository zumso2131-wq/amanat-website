# Система "Аманат" - Исламская рассрочка

Production-ready веб-система для управления рассрочкой на русском языке.

## Технологический стек

- **Frontend/Backend**: Next.js 14+ (App Router) + TypeScript
- **UI**: TailwindCSS + shadcn/ui + lucide-react
- **База данных**: PostgreSQL + Prisma ORM
- **Аутентификация**: NextAuth.js (Credentials: phone + password) + bcrypt
- **Роли**: RBAC (ADMIN, MANAGER, CLIENT)
- **Валидация**: Zod
- **PDF**: pdfkit для генерации договоров и графиков
- **Audit Log**: Логирование всех действий

## Структура проекта

```
/workspace
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── admin/             # Админ панель (ADMIN/MANAGER)
│   ├── cabinet/           # Личный кабинет клиента (CLIENT)
│   ├── login/             # Страница входа
│   ├── calculator/        # Калькулятор рассрочки
│   ├── apply/             # Форма заявки
│   └── ...                # Публичные страницы
├── components/            # React компоненты
│   └── ui/                # shadcn/ui компоненты
├── lib/                   # Утилиты и бизнес-логика
│   ├── calculations.ts    # Модуль расчётов (единый источник правды)
│   ├── auth.ts            # Конфигурация NextAuth
│   ├── audit.ts           # Audit logging
│   └── prisma.ts          # Prisma client
├── prisma/
│   ├── schema.prisma      # Prisma schema
│   └── seed.ts            # Seed скрипт
└── types/                 # TypeScript типы
```

## Установка и запуск

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка базы данных

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Отредактируйте `.env` и укажите вашу строку подключения к PostgreSQL:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/amanat?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-in-production-min-32-chars"
```

### 3. Инициализация базы данных

```bash
# Генерация Prisma Client
npm run db:generate

# Применение миграций
npm run db:migrate

# Заполнение тестовыми данными (создаёт админа, менеджера и клиента)
npm run db:seed
```

### 4. Запуск приложения

```bash
# Режим разработки
npm run dev

# Production сборка
npm run build
npm start
```

Приложение будет доступно по адресу: http://localhost:3000

## Учётные данные по умолчанию

После выполнения `npm run db:seed`:

- **Администратор**: `+79991234567` / `admin123`
- **Менеджер**: `+79991234568` / `manager123`
- **Клиент**: `+79991234569` / `client123`

## Роуты и разделы

### Публичные (без авторизации)

- `/` - Главная страница
- `/usloviya` - Условия рассрочки
- `/catalog` - Каталог товаров
- `/calculator` - Калькулятор рассрочки
- `/faq` - Часто задаваемые вопросы
- `/contacts` - Контакты
- `/apply` - Форма заявки на рассрочку

### Авторизация

- `/login` - Страница входа

### Личный кабинет клиента (CLIENT)

- `/cabinet` - Обзор (дашборд)
- `/cabinet/deals` - Мои сделки
- `/cabinet/schedule` - График платежей
- `/cabinet/documents` - Документы (скачивание договоров и графиков)
- `/cabinet/history` - История платежей
- `/cabinet/support` - Поддержка

### Админ панель (ADMIN/MANAGER)

- `/admin` - Обзор (дашборд)
- `/admin/clients` - Управление клиентами
- `/admin/deals` - Управление сделками
- `/admin/payments` - Управление платежами
- `/admin/overdue` - Просроченные платежи
- `/admin/products` - Товары
- `/admin/documents` - Документы
- `/admin/reports` - Отчёты (прибыль, выручка, дебиторка)
- `/admin/notifications` - Уведомления
- `/admin/broadcast` - Рассылка
- `/admin/roles` - Управление ролями
- `/admin/templates` - Шаблоны
- `/admin/audit` - История изменений (Audit Log)
- `/admin/settings` - Настройки

## Правила расчёта рассрочки (Аманат)

### Срок

- Минимум: 3 месяца
- Максимум: 12 месяцев

### Наценка

- **3 месяца**: от 15% (редактируемая)
- **5 месяцев**: 25% (фиксированная)
- **6 месяцев**: 35% (фиксированная)
- **7-12 месяцев**: 35 + (months - 6) * 5
  - 7 мес = 40%
  - 8 мес = 45%
  - 9 мес = 50%
  - 10 мес = 55%
  - 11 мес = 60%
  - 12 мес = 65%

### Первоначальный взнос

- Допускается 0
- Должен быть меньше цены продажи: `0 <= downPayment < salePrice`

### Расчёт

1. **Цена продажи**: `salePrice = round(purchasePrice * (1 + markupPercentFinal/100))`
2. **Сумма к финансированию**: `amountToFinance = salePrice - downPayment`
3. **График платежей**:
   - Базовый платёж: `base = floor(amountToFinance / months)`
   - Остаток: `remainder = amountToFinance - base * months`
   - Платежи 1..(months-1): `base`
   - Последний платёж: `base + remainder`

### Даты платежей

- `startDate` = дата выдачи товара клиенту
- `dueDate(i) = startDate + 30 * i days`, где i = 1..months
- График фиксируется при создании сделки и не пересчитывается задним числом

### Просрочка

Платёж считается просроченным, если:
- `dueDate < today` И `status != PAID`

## API Endpoints

### Клиенты

- `GET /api/clients` - Список клиентов (с поиском и пагинацией)
- `POST /api/clients` - Создание клиента
- `GET /api/clients/[id]` - Получение клиента
- `PATCH /api/clients/[id]` - Обновление клиента
- `DELETE /api/clients/[id]` - Удаление клиента (только ADMIN)

### Сделки

- `GET /api/deals` - Список сделок (с фильтрами)
- `POST /api/deals` - Создание сделки (автоматически генерирует график платежей)
- `GET /api/deals/[id]` - Получение сделки
- `PATCH /api/deals/[id]` - Обновление сделки
- `GET /api/deals/[id]/pdf?type=contract|schedule` - Скачивание PDF (договор или график)

### Платежи

- `GET /api/payments` - Список платежей
- `POST /api/payments` - Создание платежа (автоматически обновляет статус платежа)

### Просрочки

- `GET /api/overdue` - Список просроченных платежей (с фильтрами)

### Отчёты

- `GET /api/reports` - Статистика (прибыль, выручка, дебиторка)

### Экспорт

- `GET /api/export/clients` - Экспорт клиентов в CSV
- `GET /api/export/deals` - Экспорт сделок в CSV
- `GET /api/export/payments` - Экспорт платежей в CSV

## Модуль расчётов

Все расчёты централизованы в `lib/calculations.ts`:

- `calculateMarkupPercent()` - Вычисление наценки по правилам
- `calculateSalePrice()` - Вычисление цены продажи
- `generateInstallmentSchedule()` - Генерация графика платежей
- `calculateDeal()` - Основная функция расчёта (единый источник правды)

Этот модуль используется в:
- Калькуляторе на сайте
- Создании сделок
- Генерации PDF документов

## Audit Log

Все изменения ключевых сущностей логируются в таблицу `AuditLog`:
- Кто (actorUserId)
- Что (entity, entityId)
- Когда (createdAt)
- Что изменилось (diffJson)

## Развёртывание

1. Установите зависимости: `npm install`
2. Настройте переменные окружения в `.env`
3. Примените миграции: `npm run db:migrate`
4. Заполните начальные данные: `npm run db:seed`
5. Соберите проект: `npm run build`
6. Запустите: `npm start`

## Лицензия

Проприетарное ПО. Все права защищены.
