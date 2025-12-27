# Аманат — Система рассрочки товаров

Полнофункциональная система управления рассрочкой товаров с публичным сайтом, личным кабинетом клиента и CRM для администраторов.

## 🚀 Быстрый старт

### 1. Клонирование и установка зависимостей

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

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="сгенерируйте: openssl rand -base64 32"
AUTH_SECRET="то же значение что и NEXTAUTH_SECRET"

# Приложение
APP_URL="http://localhost:3000"

# Seed администратора
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

### 4. Миграции и seed данных

```bash
# Генерация Prisma клиента
npx prisma generate

# Применение миграций (создание таблиц)
npx prisma migrate dev --name init

# Заполнение начальными данными
npx prisma db seed
```

### 5. Запуск в режиме разработки

```bash
npm run dev
```

Откройте http://localhost:3000

---

## 📋 Демо-аккаунты

После выполнения seed:

| Роль | Телефон | Пароль |
|------|---------|--------|
| Админ | +77001234567 | admin123 |
| Менеджер | +77009876543 | manager123 |
| Клиент | +77005551234 | client123 |

---

## 🏗 Технологии

- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS** + shadcn/ui
- **PostgreSQL** + Prisma ORM
- **NextAuth.js v5** (Credentials: phone + password)
- **Zod** — валидация
- **bcryptjs** — хеширование паролей

---

## 📁 Структура проекта

```
amanat/
├── prisma/
│   ├── schema.prisma    # Схема БД
│   └── seed.ts          # Начальные данные
├── src/
│   ├── app/
│   │   ├── (admin)/     # CRM (защищено ADMIN/MANAGER)
│   │   ├── (cabinet)/   # Личный кабинет клиента
│   │   ├── api/         # API Routes
│   │   ├── login/       # Страница входа
│   │   └── ...          # Публичные страницы
│   ├── components/      # UI компоненты
│   ├── lib/             # Утилиты
│   │   ├── auth.ts      # NextAuth конфигурация
│   │   ├── calculations.ts # Бизнес-логика расчётов
│   │   ├── prisma.ts    # Prisma клиент
│   │   └── validations.ts # Zod схемы
│   └── middleware.ts    # Защита роутов
└── ...
```

---

## 💰 Бизнес-логика расчётов Amanat

### Наценки по срокам

| Месяцев | Наценка | Редактируемая |
|---------|---------|---------------|
| 3 | ≥15% | ✅ (мин. 15%) |
| 4 | 20% | ❌ |
| 5 | 25% | ❌ |
| 6 | 35% | ❌ |
| 7 | 40% | ❌ |
| 8 | 45% | ❌ |
| 9 | 50% | ❌ |
| 10 | 55% | ❌ |
| 11 | 60% | ❌ |
| 12 | 65% | ❌ |

### Формулы

```
salePrice = round(purchasePrice × (1 + markup/100))
amountToFinance = salePrice - downPayment
basePayment = floor(amountToFinance / months)
lastPayment = basePayment + remainder
dueDate[i] = startDate + 30×i дней
```

---

## 🔐 Роли и доступ

| Маршрут | ADMIN | MANAGER | CLIENT | Гость |
|---------|-------|---------|--------|-------|
| `/` | ✅ | ✅ | ✅ | ✅ |
| `/login` | → | → | → | ✅ |
| `/cabinet/*` | ✅ | ✅ | ✅ | ❌ |
| `/admin/*` | ✅ | ✅ | → /cabinet | ❌ |

---

## 📊 API Endpoints

### Публичные
- `GET /api/products` — Каталог товаров
- `POST /api/applications` — Заявка с сайта

### Защищённые (ADMIN/MANAGER)
- `GET/POST /api/clients` — Клиенты
- `GET/PUT/DELETE /api/clients/[id]`
- `GET/POST /api/deals` — Сделки
- `GET/PUT/DELETE /api/deals/[id]`
- `GET/POST /api/payments` — Платежи
- `GET/POST /api/overdue` — Просрочки
- `GET /api/reports` — Отчёты
- `GET /api/export?type=clients|deals|payments` — CSV

### PDF
- `GET /api/pdf?dealId=xxx&type=contract|schedule`

---

## 🛠 Полезные команды

```bash
# Prisma
npx prisma generate      # Генерация клиента
npx prisma migrate dev   # Миграции (dev)
npx prisma db push       # Push схемы (без миграции)
npx prisma db seed       # Seed данных
npx prisma studio        # GUI для БД

# Разработка
npm run dev              # Dev сервер
npm run build            # Сборка
npm run start            # Production сервер
npm run lint             # Линтер
```

---

## 🚀 Деплой

### Docker Compose (рекомендуется)

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/amanat
      - NEXTAUTH_URL=https://your-domain.com
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - AUTH_SECRET=${AUTH_SECRET}
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=amanat
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["node", "server.js"]
```

### Vercel + Neon/Supabase

1. Подключите репозиторий к Vercel
2. Создайте PostgreSQL на Neon или Supabase
3. Добавьте переменные окружения в Vercel:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `AUTH_SECRET`
   - `NEXTAUTH_URL`
4. Deploy!

---

## 📝 Лицензия

MIT
