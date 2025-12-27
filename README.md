# AMANAT - Исламская рассрочка

## Установка и запуск

```bash
# Установка зависимостей
npm install

# Генерация Prisma Client
npx prisma generate

# Создание базы данных
npx prisma migrate dev --name init

# Создание администратора
npm run seed

# Запуск dev сервера
npm run dev
```

## Доступы администратора

- Телефон: `89291639595`
- Пароль: `Lamaro095`
- Роль: ADMIN

## Страницы

- `/` - Главная страница
- `/login` - Вход в систему
- `/register` - Регистрация
- `/admin` - Панель администратора

## Технологии

- Next.js 14 (App Router)
- NextAuth.js 4
- Prisma ORM
- SQLite
- TypeScript
- bcryptjs
