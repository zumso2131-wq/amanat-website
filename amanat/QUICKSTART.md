# Быстрый старт

## За 5 минут до запуска

### 1. Установка PostgreSQL (если нет)

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
createdb amanat
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb amanat
```

**Windows:**
- Скачайте с https://www.postgresql.org/download/windows/
- Установите и создайте БД `amanat`

### 2. Установка зависимостей

```bash
cd amanat
npm install
```

### 3. Настройка окружения

```bash
cp .env.example .env
```

Измените в `.env` строку подключения к БД:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/amanat?schema=public"
```

### 4. Инициализация БД

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 5. Запуск

```bash
npm run dev
```

Откройте http://localhost:3000

## Вход в систему

| Роль     | Телефон      | Пароль     |
|----------|--------------|------------|
| Admin    | +77771234567 | admin123   |
| Manager  | +77771234568 | manager123 |
| Client   | +77771234569 | client123  |

## Основные команды

```bash
npm run dev          # Запуск в dev режиме
npm run build        # Сборка для production
npm start            # Запуск production сервера
npm run db:studio    # Открыть Prisma Studio
```

## Возможные проблемы

**Ошибка подключения к БД:**
- Проверьте, что PostgreSQL запущен
- Проверьте DATABASE_URL в .env
- Убедитесь, что БД `amanat` создана

**Ошибка при миграции:**
```bash
npm run db:push -- --force-reset
npm run db:seed
```

**Порт 3000 занят:**
```bash
PORT=3001 npm run dev
```
