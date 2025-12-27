import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: { entity: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const entity = params.entity

    let csv = ""
    let filename = ""

    if (entity === "clients") {
      const clients = await prisma.client.findMany({
        orderBy: { createdAt: "desc" },
      })

      csv = "ID,ФИО,Телефон,Паспорт,Адрес,Дата создания\n"
      clients.forEach((client) => {
        csv += `${client.id},"${client.fullName}","${client.phone}","${client.passportNumber || ""}","${client.address || ""}","${client.createdAt.toISOString()}"\n`
      })
      filename = "clients.csv"
    } else if (entity === "deals") {
      const deals = await prisma.deal.findMany({
        include: {
          client: true,
        },
        orderBy: { createdAt: "desc" },
      })

      csv = "ID,Клиент,Товар,Цена закупки,Цена продажи,Срок,Статус,Дата создания\n"
      deals.forEach((deal) => {
        csv += `${deal.id},"${deal.client.fullName}","${deal.productName}",${deal.purchasePrice},${deal.salePrice},${deal.months},"${deal.status}","${deal.createdAt.toISOString()}"\n`
      })
      filename = "deals.csv"
    } else if (entity === "payments") {
      const payments = await prisma.payment.findMany({
        include: {
          deal: {
            include: {
              client: true,
            },
          },
        },
        orderBy: { paidAt: "desc" },
      })

      csv = "ID,Сделка,Клиент,Сумма,Метод,Дата оплаты\n"
      payments.forEach((payment) => {
        csv += `${payment.id},"${payment.deal.productName}","${payment.deal.client.fullName}",${payment.amount},"${payment.method}","${payment.paidAt.toISOString()}"\n`
      })
      filename = "payments.csv"
    } else {
      return NextResponse.json({ error: "Неизвестная сущность" }, { status: 400 })
    }

    const headers = new Headers()
    headers.set("Content-Type", "text/csv; charset=utf-8")
    headers.set("Content-Disposition", `attachment; filename="${filename}"`)

    return new NextResponse(csv, { headers })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json(
      { error: "Ошибка экспорта" },
      { status: 500 }
    )
  }
}
