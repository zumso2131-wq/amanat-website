// ============================================
// API РЕГИСТРАЦИИ — POST /api/auth/register
// ============================================

import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Схема валидации регистрации
const registerSchema = z.object({
  phone: z
    .string()
    .min(10, "Номер телефона должен содержать минимум 10 символов")
    .max(20, "Номер телефона слишком длинный"),
  password: z
    .string()
    .min(8, "Пароль должен содержать минимум 8 символов")
    .max(100, "Пароль слишком длинный"),
  confirmPassword: z.string(),
  fullName: z
    .string()
    .max(200, "ФИО слишком длинное")
    .optional()
    .or(z.literal("")),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
})

export async function POST(request: NextRequest) {
  try {
    // 1. Парсинг тела запроса
    const body = await request.json()
    
    // 2. Валидация данных
    const validationResult = registerSchema.safeParse(body)
    
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((issue) => issue.message)
      return NextResponse.json(
        { error: errors[0] || "Ошибка валидации" },
        { status: 400 }
      )
    }

    const { phone, password, fullName } = validationResult.data

    // 3. Проверка уникальности телефона
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Пользователь с таким номером телефона уже зарегистрирован" },
        { status: 409 }
      )
    }

    // 4. Хеширование пароля
    const passwordHash = await bcrypt.hash(password, 12)

    // 5. Создание пользователя (роль CLIENT по умолчанию)
    const user = await prisma.user.create({
      data: {
        phone,
        passwordHash,
        fullName: fullName || "Пользователь",
        role: "CLIENT", // Новые пользователи всегда CLIENT
        isActive: true,
      },
      select: {
        id: true,
        phone: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    })

    console.log(`✅ Зарегистрирован новый пользователь: ${user.phone}`)

    return NextResponse.json(
      { 
        success: true, 
        message: "Регистрация успешна",
        user: {
          id: user.id,
          phone: user.phone,
          fullName: user.fullName,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Ошибка сервера при регистрации" },
      { status: 500 }
    )
  }
}
