// ============================================
// NEXTAUTH КОНФИГУРАЦИЯ — СИСТЕМА "АМАНАТ"
// ============================================
// Аутентификация по телефону и паролю
// Роли: ADMIN, MANAGER, CLIENT

import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"
import { loginSchema } from "./validations"
import type { Role } from "@prisma/client"

// ============================================
// РАСШИРЕНИЕ ТИПОВ NEXTAUTH
// ============================================

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      phone: string
      fullName: string
      email?: string | null
    }
  }
  interface User {
    id: string
    role: Role
    phone: string
    fullName: string
    email?: string | null
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string
    role: Role
    phone: string
    fullName: string
  }
}

// ============================================
// КОНФИГУРАЦИЯ NEXTAUTH
// ============================================

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Провайдеры аутентификации
  providers: [
    Credentials({
      id: "credentials",
      name: "Телефон и пароль",
      credentials: {
        phone: { 
          label: "Телефон", 
          type: "tel",
          placeholder: "+7 (700) 000-00-00" 
        },
        password: { 
          label: "Пароль", 
          type: "password",
          placeholder: "Введите пароль"
        },
      },
      
      // Функция проверки учётных данных
      async authorize(credentials) {
        try {
          // 1. Валидация входных данных через Zod
          const validatedCredentials = loginSchema.safeParse(credentials)
          
          if (!validatedCredentials.success) {
            console.error("Auth validation error:", validatedCredentials.error)
            return null
          }

          const { phone, password } = validatedCredentials.data

          // 2. Поиск пользователя в БД
          const user = await prisma.user.findUnique({
            where: { phone },
            select: {
              id: true,
              phone: true,
              passwordHash: true,
              fullName: true,
              email: true,
              role: true,
              isActive: true,
            },
          })

          // 3. Проверка существования пользователя
          if (!user) {
            console.log("Auth: User not found:", phone)
            return null
          }

          // 4. Проверка активности аккаунта
          if (!user.isActive) {
            console.log("Auth: User is inactive:", phone)
            return null
          }

          // 5. Проверка пароля
          const isValidPassword = await bcrypt.compare(password, user.passwordHash)
          
          if (!isValidPassword) {
            console.log("Auth: Invalid password for:", phone)
            return null
          }

          // 6. Успешная аутентификация — возвращаем данные пользователя
          console.log("Auth: Success for:", phone, "role:", user.role)
          
          return {
            id: user.id,
            role: user.role,
            phone: user.phone,
            fullName: user.fullName,
            email: user.email,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],

  // Callbacks для обработки JWT и сессии
  callbacks: {
    // Добавляем данные пользователя в JWT токен
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.phone = user.phone
        token.fullName = user.fullName
      }
      return token
    },

    // Добавляем данные из JWT в сессию
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.phone = token.phone
        session.user.fullName = token.fullName
      }
      return session
    },

    // Проверка авторизации (вызывается middleware)
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = request.nextUrl

      // Публичные маршруты — доступны всем
      const publicPaths = [
        "/",
        "/login",
        "/usloviya",
        "/catalog", 
        "/calculator",
        "/faq",
        "/contacts",
        "/apply",
      ]
      
      const isPublicPath = publicPaths.some(path => 
        pathname === path || pathname.startsWith("/api/applications") || pathname.startsWith("/api/products")
      )

      if (isPublicPath) {
        return true
      }

      // Защищённые маршруты требуют авторизации
      return isLoggedIn
    },
  },

  // Кастомные страницы
  pages: {
    signIn: "/login",
    error: "/login",
  },

  // Настройки сессии
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  },

  // Секретный ключ
  secret: process.env.AUTH_SECRET,

  // Отладка (только в development)
  debug: process.env.NODE_ENV === "development",
})

// ============================================
// ХЕЛПЕРЫ АВТОРИЗАЦИИ
// ============================================

/**
 * Получить текущего пользователя из сессии
 */
export async function getCurrentUser() {
  const session = await auth()
  return session?.user || null
}

/**
 * Требовать авторизацию (выбрасывает ошибку если не авторизован)
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Требуется авторизация")
  }
  return user
}

/**
 * Требовать определённую роль
 */
export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Недостаточно прав доступа")
  }
  return user
}

/**
 * Требовать роль ADMIN
 */
export async function requireAdmin() {
  return requireRole(["ADMIN"])
}

/**
 * Требовать роль ADMIN или MANAGER
 */
export async function requireManager() {
  return requireRole(["ADMIN", "MANAGER"])
}

/**
 * Проверить, является ли пользователь админом
 */
export async function isAdmin() {
  const user = await getCurrentUser()
  return user?.role === "ADMIN"
}

/**
 * Проверить, является ли пользователь менеджером или админом
 */
export async function isManagerOrAdmin() {
  const user = await getCurrentUser()
  return user?.role === "ADMIN" || user?.role === "MANAGER"
}

// ============================================
// УТИЛИТЫ ДЛЯ ПАРОЛЕЙ
// ============================================

/**
 * Хеширование пароля
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

/**
 * Проверка пароля
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
