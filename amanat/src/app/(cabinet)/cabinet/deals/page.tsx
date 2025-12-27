// ============================================
// МОИ СДЕЛКИ — /cabinet/deals
// ============================================

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatMoney, formatDate } from "@/lib/calculations"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const statusLabels: Record<string, string> = {
  DRAFT: "Черновик",
  ACTIVE: "Активна",
  CLOSED: "Закрыта",
  CANCELED: "Отменена",
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  ACTIVE: "bg-green-100 text-green-800",
  CLOSED: "bg-blue-100 text-blue-800",
  CANCELED: "bg-red-100 text-red-800",
}

export default async function CabinetDealsPage() {
  const session = await auth()
  if (!session?.user) return null

  // Находим клиента по телефону
  const client = await prisma.client.findUnique({
    where: { phone: session.user.phone },
    include: {
      deals: {
        orderBy: { createdAt: "desc" },
        include: {
          payments: true,
          installments: { orderBy: { index: "asc" } },
        },
      },
    },
  })

  const deals = client?.deals || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Мои сделки</h1>
        <p className="text-muted-foreground">История ваших покупок в рассрочку</p>
      </div>

      {deals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">У вас пока нет сделок</p>
            <Link href="/apply">
              <Button>Оформить рассрочку</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {deals.map((deal) => {
            const paid = deal.payments.reduce((s, p) => s + p.amount, 0)
            const remaining = deal.amountToFinance - paid
            const progress = deal.amountToFinance > 0 
              ? Math.round((paid / deal.amountToFinance) * 100) 
              : 0

            return (
              <Card key={deal.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg">{deal.productName}</h3>
                        <Badge className={statusColors[deal.status]}>
                          {statusLabels[deal.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-mono">
                        № {deal.dealNumber} от {formatDate(deal.startDate)}
                      </p>
                    </div>
                    <Link href={`/cabinet/deals/${deal.id}`}>
                      <Button>Подробнее</Button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-4 gap-6 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Сумма</div>
                      <div className="font-medium">{formatMoney(deal.salePrice)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Оплачено</div>
                      <div className="font-medium text-green-600">{formatMoney(paid)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Остаток</div>
                      <div className="font-medium">{formatMoney(remaining)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Срок</div>
                      <div className="font-medium">{deal.months} мес</div>
                    </div>
                  </div>

                  {deal.status === "ACTIVE" && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Прогресс оплаты</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
