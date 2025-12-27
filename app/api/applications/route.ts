import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const applicationSchema = z.object({
  fullName: z.string().min(1, "ФИО обязательно"),
  phone: z.string().min(1, "Телефон обязателен"),
  passportNumber: z.string().optional(),
  productName: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = applicationSchema.parse(body)

    // Создаём клиента или находим существующего
    const client = await prisma.client.upsert({
      where: { phone: data.phone },
      update: {
        fullName: data.fullName,
        passportNumber: data.passportNumber || undefined,
      },
      create: {
        fullName: data.fullName,
        phone: data.phone,
        passportNumber: data.passportNumber || undefined,
        note: data.productName ? `Заявка на товар: ${data.productName}` : undefined,
      },
    })

    return NextResponse.json({ success: true, clientId: client.id })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error("Application error:", error)
    return NextResponse.json(
      { error: "Ошибка обработки заявки" },
      { status: 500 }
    )
  }
}
