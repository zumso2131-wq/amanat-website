// ============================================
// NEXTAUTH КОНФИГУРАЦИЯ
// ============================================

import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { loginSchema } from './validations'
import type { Role } from '@prisma/client'

declare module 'next-auth' {
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

declare module '@auth/core/jwt' {
  interface JWT {
    id: string
    role: Role
    phone: string
    fullName: string
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        phone: { label: 'Телефон', type: 'text' },
        password: { label: 'Пароль', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const { phone, password } = loginSchema.parse(credentials)

          const user = await prisma.user.findUnique({
            where: { phone },
          })

          if (!user || !user.isActive) {
            throw new Error('Пользователь не найден или заблокирован')
          }

          const isValidPassword = await bcrypt.compare(password, user.passwordHash)

          if (!isValidPassword) {
            throw new Error('Неверный пароль')
          }

          return {
            id: user.id,
            role: user.role,
            phone: user.phone,
            fullName: user.fullName,
            email: user.email,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.phone = user.phone
        token.fullName = user.fullName
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.phone = token.phone
        session.user.fullName = token.fullName
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  },
  secret: process.env.AUTH_SECRET,
})

// ============================================
// ХЕЛПЕРЫ АВТОРИЗАЦИИ
// ============================================

export async function getCurrentUser() {
  const session = await auth()
  return session?.user || null
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Требуется авторизация')
  }
  return user
}

export async function requireRole(roles: Role[]) {
  const user = await requireAuth()
  if (!roles.includes(user.role)) {
    throw new Error('Недостаточно прав доступа')
  }
  return user
}

export async function requireAdmin() {
  return requireRole(['ADMIN'])
}

export async function requireManager() {
  return requireRole(['ADMIN', 'MANAGER'])
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
