# 🏦 AMANAT — Система рассрочки товаров

**Production-ready веб-система** для управления рассрочкой на электронику и бытовую технику.

> Дизайн основан на оригинальных `index.html` и `styles.css`:
> - Цвет бренда: `#2c3e50` (тёмно-синий)
> - Акцентный цвет: `#27ae60` (зелёный)

---

## 🛠 Технологии

| Компонент | Технология |
|-----------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styles | TailwindCSS + shadcn/ui |
| Icons | lucide-react |
| Database | PostgreSQL + Prisma |
| Auth | NextAuth.js v5 |
| Validation | Zod |

---

## 📋 Требования

- Node.js 18+ (рекомендуется 20 LTS)
- PostgreSQL 14+
- npm 8+

---

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка окружения

```bash
cp .env.example .env
```

Отредактируйте `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/amanat?schema=public"
AUTH_SECRET="сгенерируйте: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Запуск PostgreSQL

```bash
docker run -d \
  --name amanat-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=amanat \
  -p 5432:5432 \
  postgres:16-alpine
```

### 4. Миграции и seed данные

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Запуск

```bash
npm run dev
```

🌐 Откройте: **http://localhost:3000**

---

## 👤 Демо-аккаунты

| Роль | Телефон | Пароль |
|------|---------|--------|
| **Админ** | +77001234567 | admin123 |
| **Менеджер** | +77009876543 | manager123 |
| **Клиент** | +77005551234 | client123 |

---

## 📁 Структура маршрутов

### Публичные (без авторизации)

| URL | Описание |
|-----|----------|
| `/` | Главная страница |
| `/login` | Вход в систему |
| `/calculator` | Калькулятор рассрочки |
| `/catalog` | Каталог товаров |
| `/usloviya` | Условия рассрочки |
| `/faq` | Вопросы и ответы |
| `/contacts` | Контакты |
| `/apply` | Заявка на рассрочку |

### Личный кабинет клиента (`/cabinet`)

| URL | Описание |
|-----|----------|
| `/cabinet` | Обзор (статистика) |
| `/cabinet/deals` | Мои сделки |
| `/cabinet/deals/[id]` | Детали сделки + документы |

### Админка (`/admin`) — ADMIN, MANAGER

| URL | Описание |
|-----|----------|
| `/admin` | Дашборд |
| `/admin/clients` | Клиенты (CRUD) |
| `/admin/clients/new` | Новый клиент |
| `/admin/clients/[id]` | Профиль клиента |
| `/admin/clients/[id]/edit` | Редактирование |
| `/admin/deals` | Сделки |
| `/admin/deals/new` | Новая сделка |
| `/admin/deals/[id]` | Детали сделки |
| `/admin/payments` | Платежи |
| `/admin/overdue` | Просрочки |
| `/admin/reports` | Отчёты + CSV |

---

## 💰 Бизнес-правила

### Наценки

| Срок | Наценка |
|------|---------|
| 3 мес | ≥15% (редактируемая) |
| 4 мес | 20% |
| 5 мес | 25% |
| 6 мес | 35% |
| 7-12 мес | 35 + (N-6)×5% |

### Формулы

```
salePrice = round(purchasePrice × (1 + markup/100))
amountToFinance = salePrice − downPayment
basePayment = floor(amountToFinance / months)
lastPayment = basePayment + remainder
dueDate[i] = startDate + 30×i дней
```

### Условия

- Первоначальный взнос: `0 ≤ downPayment < salePrice`
- Срок: **3–12 месяцев**
- Просрочка: `dueDate < today AND status ≠ PAID`

---

## 📊 Модели данных (Prisma)

```prisma
User        # Пользователи системы
Client      # Клиенты (покупатели)
Product     # Товары
Deal        # Сделки рассрочки
Installment # График платежей
Payment     # Фактические платежи
Document    # PDF документы
Application # Заявки с сайта
Setting     # Настройки системы
AuditLog    # Аудит действий
```

---

## 🔐 Безопасность

- ✅ Bcrypt (cost 12) для паролей
- ✅ JWT + secure cookies
- ✅ Rate limit на auth (5 попыток/мин)
- ✅ RBAC: ADMIN / MANAGER / CLIENT
- ✅ Middleware защита маршрутов
- ✅ Security headers (HSTS, X-Frame-Options)

---

## 📝 Сценарий работы

### 1. Создание клиента

```
Admin → /admin/clients → "Добавить клиента"
→ Заполнить: ФИО, телефон, ИИН
```

### 2. Создание сделки

```
Admin → /admin/deals/new
→ Выбрать клиента
→ Указать товар и цену закупа
→ Выбрать срок (наценка автоматическая)
→ Указать первоначальный взнос
→ "Создать сделку"
→ График платежей генерируется автоматически
```

### 3. Приём платежа

```
Admin → /admin/deals/[id] или /admin/overdue
→ Указать сумму и способ оплаты
→ Installment автоматически закрывается
→ При полной оплате сделка становится CLOSED
```

### 4. Документы

```
На странице сделки:
→ "Договор PDF" — скачать договор
→ "График PDF" — скачать график платежей
```

---

## 🚀 Деплой

### Вариант A: Docker Compose

```bash
# Генерация секретов
export AUTH_SECRET=$(openssl rand -base64 32)
export DB_PASSWORD=$(openssl rand -base64 16)
export NEXTAUTH_URL=https://your-domain.com

# Запуск
docker compose up -d

# Миграции
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma db seed
```

### Вариант B: Vercel + Neon/Supabase

1. Создайте БД на **Neon** или **Supabase**
2. Подключите репозиторий к **Vercel**
3. Добавьте переменные:
   ```
   DATABASE_URL=postgresql://...
   AUTH_SECRET=<openssl rand -base64 32>
   NEXTAUTH_URL=https://your-app.vercel.app
   ```
4. Deploy → выполните миграции

---

## 🛠 Команды

```bash
npm run dev          # Dev сервер
npm run build        # Production сборка
npm run start        # Production сервер
npm run lint         # Линтер

npx prisma generate      # Генерация клиента
npx prisma migrate dev   # Dev миграции
npx prisma migrate deploy # Prod миграции
npx prisma db seed       # Заполнение данными
npx prisma studio        # GUI для БД
```

---

## ✅ Статус

| Компонент | Статус |
|-----------|--------|
| Auth + роли | ✅ |
| Middleware | ✅ |
| CRUD Клиенты | ✅ |
| CRUD Сделки | ✅ |
| Генерация Installments | ✅ |
| Платежи | ✅ |
| Просрочки | ✅ |
| PDF документы | ✅ |
| Кабинет клиента | ✅ |
| Публичные страницы | ✅ |
| Калькулятор | ✅ |
| AuditLog | ✅ |
| Отчёты + CSV | ✅ |
| Lint: 0 errors | ✅ |
| Build: success | ✅ |

---

**Проект готов к production.** 🚀
