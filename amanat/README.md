# 🏦 Аманат — Система рассрочки товаров

Production-ready система управления рассрочкой товаров с публичным сайтом, личным кабинетом клиента и CRM для администраторов.

## 📋 Требования

- **Node.js** 18+ (рекомендуется 20 LTS)
- **PostgreSQL** 14+ (или Neon/Supabase)
- **npm** или **yarn**

## 🚀 Быстрый старт (локально)

### 1. Клонирование и установка

```bash
git clone <repo-url>
cd amanat
npm install
```

### 2. Настройка переменных окружения

```bash
cp .env.example .env
```

Отредактируйте `.env`:

```env
# База данных PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/amanat?schema=public"

# NextAuth (ОБЯЗАТЕЛЬНО сгенерировать для production!)
AUTH_SECRET="openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Приложение
APP_URL="http://localhost:3000"

# Администратор (для seed)
SEED_ADMIN_PHONE="+77001234567"
SEED_ADMIN_PASSWORD="admin123"
SEED_ADMIN_NAME="Администратор"
```

### 3. Запуск PostgreSQL (Docker)

```bash
docker run -d \
  --name amanat-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=amanat \
  -p 5432:5432 \
  postgres:16-alpine
```

### 4. Миграции и начальные данные

```bash
# Генерация Prisma клиента
npx prisma generate

# Миграция БД
npx prisma migrate dev --name init

# Заполнение начальными данными
npx prisma db seed
```

### 5. Запуск

```bash
npm run dev
```

Откройте http://localhost:3000

---

## 👤 Демо-аккаунты

| Роль | Телефон | Пароль | Доступ |
|------|---------|--------|--------|
| **Админ** | +77001234567 | admin123 | /admin/* |
| **Менеджер** | +77009876543 | manager123 | /admin/* |
| **Клиент** | +77005551234 | client123 | /cabinet/* |

---

## 💰 Бизнес-правила Amanat (зафиксированы)

### Наценки по срокам

| Срок | Наценка | Редактируемая |
|------|---------|---------------|
| 3 мес | ≥15% | ✅ Да (мин. 15%) |
| 4 мес | 20% | ❌ |
| 5 мес | 25% | ❌ |
| 6 мес | 35% | ❌ |
| 7-12 мес | 35 + (N-6)×5% | ❌ |

### Формулы расчёта

```
salePrice = round(purchasePrice × (1 + markup/100))
amountToFinance = salePrice - downPayment
basePayment = floor(amountToFinance / months)
lastPayment = basePayment + (amountToFinance - basePayment × months)
dueDate[i] = startDate + 30×i дней
```

### Условия

- **Первоначальный взнос**: 0 ≤ downPayment < salePrice
- **Срок**: 3–12 месяцев
- **Просрочка**: dueDate < today AND status ≠ PAID

---

## 🗂 Структура маршрутов

### Публичные страницы

| Маршрут | Описание |
|---------|----------|
| `/` | Главная страница |
| `/usloviya` | Условия рассрочки |
| `/catalog` | Каталог товаров |
| `/calculator` | Калькулятор рассрочки |
| `/faq` | Вопросы и ответы |
| `/contacts` | Контакты |
| `/apply` | Заявка на рассрочку |
| `/login` | Страница входа |

### CRM Админка (/admin) — ADMIN, MANAGER

| Маршрут | Описание |
|---------|----------|
| `/admin` | Дашборд (статистика) |
| `/admin/clients` | Список клиентов |
| `/admin/clients/new` | Создание клиента |
| `/admin/clients/[id]` | Просмотр клиента |
| `/admin/clients/[id]/edit` | Редактирование |
| `/admin/deals` | Список сделок |
| `/admin/deals/new` | Создание сделки |
| `/admin/deals/[id]` | Детали сделки |
| `/admin/payments` | Платежи |
| `/admin/overdue` | Просрочки |
| `/admin/reports` | Отчёты + CSV |

### Личный кабинет (/cabinet) — CLIENT

| Маршрут | Описание |
|---------|----------|
| `/cabinet` | Обзор (остаток, платежи) |
| `/cabinet/deals` | Мои сделки |
| `/cabinet/deals/[id]` | Детали + документы |

### API

| Endpoint | Методы | Доступ |
|----------|--------|--------|
| `/api/auth/*` | GET, POST | Публичный |
| `/api/applications` | GET, POST | Публичный POST, GET для менеджеров |
| `/api/products` | GET | Публичный |
| `/api/clients` | GET, POST | ADMIN, MANAGER |
| `/api/clients/[id]` | GET, PUT, DELETE | ADMIN, MANAGER |
| `/api/deals` | GET, POST | ADMIN, MANAGER |
| `/api/deals/[id]` | GET, PUT, DELETE | ADMIN, MANAGER |
| `/api/payments` | GET, POST | ADMIN, MANAGER |
| `/api/overdue` | GET, POST | ADMIN, MANAGER |
| `/api/reports` | GET | ADMIN, MANAGER |
| `/api/export` | GET | ADMIN, MANAGER |
| `/api/pdf` | GET | ADMIN, MANAGER |

---

## 📝 Как работать с системой

### Создание клиента

1. Войдите как Админ или Менеджер
2. Перейдите в `/admin/clients`
3. Нажмите "Добавить клиента"
4. Заполните ФИО, телефон (обязательно), ИИН, адрес

### Создание сделки

1. Перейдите в `/admin/deals/new`
2. Выберите клиента из списка
3. Введите название товара и цену закупа
4. Выберите срок рассрочки (наценка рассчитается автоматически)
5. Укажите первоначальный взнос (может быть 0)
6. Нажмите "Создать сделку"
7. График платежей сгенерируется автоматически

### Приём платежа

1. Перейдите на страницу сделки `/admin/deals/[id]`
2. Или на странице просрочек `/admin/overdue`
3. Укажите сумму и способ оплаты
4. Статус installment обновится автоматически

### Скачивание PDF

На странице сделки:
- "Договор PDF" — генерирует договор
- "График PDF" — генерирует график платежей

---

## 🔐 Безопасность

- ✅ Пароли хешируются bcrypt (cost 12)
- ✅ JWT токены с подписью AUTH_SECRET
- ✅ Secure cookies в production
- ✅ CSRF защита (NextAuth)
- ✅ Rate limiting на auth (5 попыток/мин)
- ✅ Security headers (HSTS, X-Frame-Options, etc.)
- ✅ Middleware проверяет роли

---

## 🚀 Деплой

### Вариант 1: VPS + Docker Compose

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      args:
        - DOCKER_BUILD=true
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/amanat
      - AUTH_SECRET=${AUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=amanat
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

**Dockerfile:**

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV DOCKER_BUILD=true
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

**Запуск:**

```bash
# Генерация секрета
export AUTH_SECRET=$(openssl rand -base64 32)
export DB_PASSWORD=$(openssl rand -base64 16)
export NEXTAUTH_URL=https://your-domain.com

# Запуск
docker compose up -d

# Миграции
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma db seed
```

### Вариант 2: Vercel + Neon/Supabase

1. **Создайте БД на Neon или Supabase**
   - Скопируйте DATABASE_URL

2. **Подключите репозиторий к Vercel**

3. **Добавьте переменные окружения в Vercel:**
   ```
   DATABASE_URL=postgresql://...
   AUTH_SECRET=<сгенерировать>
   NEXTAUTH_URL=https://your-app.vercel.app
   ```

4. **Deploy!**

5. **После деплоя выполните миграцию:**
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

### Nginx (опционально для VPS)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🛠 Команды

```bash
# Разработка
npm run dev          # Dev сервер
npm run build        # Production сборка
npm run start        # Production сервер
npm run lint         # Линтер

# База данных
npx prisma generate  # Генерация клиента
npx prisma migrate dev   # Dev миграции
npx prisma migrate deploy  # Prod миграции
npx prisma db seed   # Заполнение данными
npx prisma studio    # GUI для БД
```

---

## 📊 Технологии

- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS** + shadcn/ui
- **PostgreSQL** + Prisma ORM 5.x
- **NextAuth.js v5** (Credentials)
- **Zod** — валидация
- **bcryptjs** — хеширование

---

## 📝 Лицензия

MIT

---

## 🆘 Поддержка

При возникновении вопросов:
- Создайте Issue в репозитории
- Email: support@amanat.kz
