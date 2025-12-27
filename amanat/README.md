# 🏦 АМАНАТ — Система рассрочки товаров

**Production-ready MVP** для управления рассрочкой товаров.

---

## 📋 Требования

| Компонент | Версия |
|-----------|--------|
| Node.js | 18+ (рекомендуется 20 LTS) |
| PostgreSQL | 14+ |
| npm | 8+ |

---

## 🚀 Быстрый старт

### 1. Установка

```bash
git clone <repo-url>
cd amanat
npm install
```

### 2. Переменные окружения

```bash
cp .env.example .env
```

Отредактируйте `.env`:

```env
# База данных
DATABASE_URL="postgresql://postgres:password@localhost:5432/amanat?schema=public"

# NextAuth (ОБЯЗАТЕЛЬНО для production!)
AUTH_SECRET="сгенерируйте: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Seed администратора
SEED_ADMIN_PHONE="+77001234567"
SEED_ADMIN_PASSWORD="admin123"
SEED_ADMIN_NAME="Администратор"
```

### 3. PostgreSQL

```bash
# Docker
docker run -d \
  --name amanat-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=amanat \
  -p 5432:5432 \
  postgres:16-alpine
```

### 4. Миграции и данные

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Запуск

```bash
npm run dev
```

Откройте: **http://localhost:3000**

---

## 👤 Демо-аккаунты

| Роль | Телефон | Пароль |
|------|---------|--------|
| **Админ** | +77001234567 | admin123 |
| **Менеджер** | +77009876543 | manager123 |
| **Клиент** | +77005551234 | client123 |

---

## 💰 Бизнес-правила (зафиксированы)

### Наценки

| Срок | Наценка | Редактируемая |
|------|---------|---------------|
| 3 мес | ≥15% | ✅ |
| 4 мес | 20% | ❌ |
| 5 мес | 25% | ❌ |
| 6 мес | 35% | ❌ |
| 7-12 мес | 35 + (N-6)×5% | ❌ |

### Формулы

```
salePrice = round(purchasePrice × (1 + markup/100))
amountToFinance = salePrice − downPayment
basePayment = floor(amountToFinance / months)
lastPayment = basePayment + remainder
dueDate[i] = startDate + 30×i дней
```

### Условия
- Первоначальный взнос: **0 ≤ downPayment < salePrice**
- Срок: **3–12 месяцев**
- Просрочка: **dueDate < today AND status ≠ PAID**

---

## 📁 Маршруты

### Публичные

| URL | Описание |
|-----|----------|
| `/` | Главная |
| `/login` | Вход |
| `/usloviya` | Условия рассрочки |
| `/catalog` | Каталог товаров |
| `/calculator` | Калькулятор |
| `/faq` | FAQ |
| `/contacts` | Контакты |
| `/apply` | Заявка |

### Админка (/admin) — ADMIN, MANAGER

| URL | Описание |
|-----|----------|
| `/admin` | Дашборд |
| `/admin/clients` | Клиенты (список) |
| `/admin/clients/new` | Создание клиента |
| `/admin/clients/[id]` | Просмотр клиента |
| `/admin/clients/[id]/edit` | Редактирование |
| `/admin/deals` | Сделки (список) |
| `/admin/deals/new` | Создание сделки |
| `/admin/deals/[id]` | Детали сделки |
| `/admin/payments` | Платежи |
| `/admin/overdue` | Просрочки |
| `/admin/reports` | Отчёты + CSV |

### Кабинет (/cabinet) — CLIENT

| URL | Описание |
|-----|----------|
| `/cabinet` | Обзор |
| `/cabinet/deals` | Мои сделки |
| `/cabinet/deals/[id]` | Детали + документы |

### API

| Endpoint | Доступ |
|----------|--------|
| `/api/auth/*` | Публичный |
| `/api/applications` | Публичный POST |
| `/api/products` | Публичный |
| `/api/clients/*` | ADMIN, MANAGER |
| `/api/deals/*` | ADMIN, MANAGER |
| `/api/payments` | ADMIN, MANAGER |
| `/api/overdue` | ADMIN, MANAGER |
| `/api/reports` | ADMIN, MANAGER |
| `/api/export` | ADMIN, MANAGER |
| `/api/pdf` | ADMIN, MANAGER |

---

## 📝 Сценарий работы

### 1. Создание клиента

1. Войдите как Админ/Менеджер
2. `/admin/clients` → "Добавить клиента"
3. Заполните: ФИО, телефон, ИИН (опционально)

### 2. Создание сделки

1. `/admin/deals/new`
2. Выберите клиента
3. Введите товар и цену закупа
4. Выберите срок (наценка автоматическая)
5. Укажите первоначальный взнос (можно 0)
6. Нажмите "Создать сделку"
7. **График платежей создаётся автоматически**

### 3. Приём платежа

1. `/admin/deals/[id]` или `/admin/overdue`
2. Укажите сумму и способ оплаты
3. Installment автоматически становится PAID
4. При полной оплате сделка закрывается

### 4. Скачивание PDF

На странице сделки:
- **Договор PDF** — договор рассрочки
- **График PDF** — график платежей

---

## 🔐 Безопасность

- ✅ Bcrypt (cost 12) для паролей
- ✅ JWT + secure cookies
- ✅ Rate limit на auth (5 попыток/мин)
- ✅ CSRF защита (NextAuth)
- ✅ Security headers (HSTS, X-Frame-Options)
- ✅ Middleware проверяет роли

---

## 🚀 Деплой

### Вариант A: VPS + Docker

**docker-compose.yml:**

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/amanat
      - AUTH_SECRET=${AUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=amanat
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  pgdata:
```

**Запуск:**

```bash
export AUTH_SECRET=$(openssl rand -base64 32)
export DB_PASSWORD=$(openssl rand -base64 16)
export NEXTAUTH_URL=https://your-domain.com

docker compose up -d
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma db seed
```

**Nginx:**

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Вариант B: Vercel + Neon

1. Создайте БД на **Neon** или **Supabase**
2. Подключите репозиторий к **Vercel**
3. Добавьте переменные:
   ```
   DATABASE_URL=postgresql://...
   AUTH_SECRET=<openssl rand -base64 32>
   NEXTAUTH_URL=https://your-app.vercel.app
   ```
4. Deploy
5. После деплоя:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

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

## 📊 Технологии

- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS** + shadcn/ui
- **PostgreSQL** + Prisma 5.x
- **NextAuth.js v5**
- **Zod** + **bcryptjs**

---

## ✅ Статус проекта

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

**Проект завершён и готов к production.** 🚀
