// ============================================
// ЛИЧНЫЙ КАБИНЕТ — /cabinet
// ============================================

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMoney, formatDate } from "@/lib/calculations"
import { CreditCard, Calendar, AlertTriangle, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function CabinetPage() {
  const session = await auth()
  if (!session?.user) return null

  // Находим клиента по телефону пользователя
  const client = await prisma.client.findUnique({
    where: { phone: session.user.phone },
    include: {
      deals: {
        where: { status: "ACTIVE" },
        include: {
          installments: { orderBy: { index: "asc" } },
          payments: true,
        },
      },
    },
  })

  // Расчёты
  let totalRemaining = 0
  let overdueCount = 0
  let nextPayment: { amount: number; dueDate: Date } | null = null
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (client) {
    for (const deal of client.deals) {
      const paid = deal.payments.reduce((s, p) => s + p.amount, 0)
      totalRemaining += deal.amountToFinance - paid

      for (const inst of deal.installments) {
        if (inst.status !== "PAID") {
          // Просрочка
          if (new Date(inst.dueDate) < today) {
            overdueCount++
          }
          // Следующий платёж
          if (!nextPayment && new Date(inst.dueDate) >= today) {
            nextPayment = { amount: inst.amount, dueDate: inst.dueDate }
          }
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Добро пожаловать, {session.user.fullName}!</h1>
        <p className="text-muted-foreground">Ваш личный кабинет</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Активных сделок
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{client?.deals.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Остаток к оплате
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatMoney(totalRemaining)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Следующий платёж
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextPayment ? (
              <>
                <div className="text-2xl font-bold">{formatMoney(nextPayment.amount)}</div>
                <p className="text-sm text-muted-foreground">{formatDate(nextPayment.dueDate)}</p>
              </>
            ) : (
              <div className="text-lg text-muted-foreground">Нет платежей</div>
            )}
          </CardContent>
        </Card>

        <Card className={overdueCount > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium flex items-center gap-2 ${overdueCount > 0 ? "text-red-600" : "text-muted-foreground"}`}>
              <AlertTriangle className="h-4 w-4" />
              Просрочено
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${overdueCount > 0 ? "text-red-600" : ""}`}>
              {overdueCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Активные сделки */}
      {client && client.deals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ваши сделки</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {client.deals.map((deal) => {
                const paid = deal.payments.reduce((s, p) => s + p.amount, 0)
                const remaining = deal.amountToFinance - paid
                const progress = Math.round((paid / deal.amountToFinance) * 100)
                const overdueInsts = deal.installments.filter(
                  (i) => i.status !== "PAID" && new Date(i.dueDate) < today
                )

                return (
                  <div key={deal.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium">{deal.productName}</h3>
                        <p className="text-sm text-muted-foreground">№ {deal.dealNumber}</p>
                      </div>
                      <Link href={`/cabinet/deals/${deal.id}`}>
                        <Button size="sm" variant="outline">Подробнее</Button>
                      </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Оплачено:</span>
                        <span className="ml-2 font-medium text-green-600">{formatMoney(paid)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Остаток:</span>
                        <span className="ml-2 font-medium">{formatMoney(remaining)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Прогресс:</span>
                        <span className="ml-2 font-medium">{progress}%</span>
                      </div>
                    </div>

                    {/* Прогресс-бар */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {overdueInsts.length > 0 && (
                      <div className="mt-3 text-sm text-red-600 flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" />
                        Просрочено платежей: {overdueInsts.length}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {(!client || client.deals.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">У вас пока нет активных сделок</p>
            <Link href="/apply">
              <Button>Оформить рассрочку</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
