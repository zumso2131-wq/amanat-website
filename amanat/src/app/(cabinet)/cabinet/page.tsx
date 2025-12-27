import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatMoney, formatDate, isOverdue } from "@/lib/calculations"
import { dealStatusLabels, dealStatusColors } from "@/lib/utils"
import { 
  HandshakeIcon, Calendar, AlertTriangle, CreditCard, ArrowRight
} from "lucide-react"

export default async function CabinetPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  // For demo, we'll show a client view
  // In production, link user to client via phone
  const client = await prisma.client.findFirst({
    where: { phone: session.user.phone },
    include: {
      deals: {
        where: { status: { in: ["ACTIVE", "CLOSED"] } },
        include: {
          installments: {
            orderBy: { index: "asc" },
          },
          payments: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  })

  const activeDeals = client?.deals.filter(d => d.status === "ACTIVE") || []
  const totalRemaining = activeDeals.reduce((sum, d) => {
    const paid = d.payments.reduce((s, p) => s + p.amount, 0)
    return sum + (d.amountToFinance - paid)
  }, 0)

  const nextPayments = activeDeals.flatMap(d => {
    const unpaid = d.installments.find(i => i.status !== "PAID")
    if (unpaid) {
      return [{
        dealNumber: d.dealNumber,
        productName: d.productName,
        dueDate: unpaid.dueDate,
        amount: unpaid.amount,
        isOverdue: isOverdue(unpaid.dueDate, unpaid.status),
      }]
    }
    return []
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  const overdueCount = nextPayments.filter(p => p.isOverdue).length

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Добро пожаловать, {session.user.fullName}!</h1>
        <p className="text-muted-foreground">Ваш личный кабинет в системе Аманат</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <HandshakeIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Активных сделок</p>
                <p className="text-2xl font-bold">{activeDeals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">К оплате всего</p>
                <p className="text-2xl font-bold">{formatMoney(totalRemaining)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ближайший платёж</p>
                <p className="text-2xl font-bold">
                  {nextPayments[0] ? formatDate(nextPayments[0].dueDate) : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={overdueCount > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                overdueCount > 0 ? "bg-red-100" : "bg-green-100"
              }`}>
                <AlertTriangle className={`h-6 w-6 ${
                  overdueCount > 0 ? "text-red-600" : "text-green-600"
                }`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Просрочки</p>
                <p className={`text-2xl font-bold ${overdueCount > 0 ? "text-red-600" : "text-green-600"}`}>
                  {overdueCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ближайшие платежи</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/cabinet/schedule">
                Весь график <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {nextPayments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Нет запланированных платежей
              </p>
            ) : (
              <div className="space-y-4">
                {nextPayments.slice(0, 5).map((payment, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      payment.isOverdue ? "bg-red-50 border border-red-200" : "bg-muted/50"
                    }`}
                  >
                    <div>
                      <p className="font-medium">{payment.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        Сделка {payment.dealNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatMoney(payment.amount)}</p>
                      <p className={`text-sm ${payment.isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                        {payment.isOverdue ? "Просрочен!" : formatDate(payment.dueDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Deals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Мои сделки</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/cabinet/deals">
                Все сделки <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!client?.deals.length ? (
              <p className="text-center text-muted-foreground py-8">
                У вас пока нет сделок
              </p>
            ) : (
              <div className="space-y-4">
                {client.deals.slice(0, 5).map((deal) => {
                  const paid = deal.payments.reduce((s, p) => s + p.amount, 0)
                  const progress = Math.round((paid / deal.amountToFinance) * 100)
                  return (
                    <Link 
                      key={deal.id}
                      href={`/cabinet/deals/${deal.id}`}
                      className="block p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{deal.productName}</p>
                          <p className="text-xs text-muted-foreground">{deal.dealNumber}</p>
                        </div>
                        <Badge className={dealStatusColors[deal.status]}>
                          {dealStatusLabels[deal.status]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{progress}%</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Help Banner */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Нужна помощь?</h3>
              <p className="text-sm text-muted-foreground">
                Свяжитесь с нами по любым вопросам
              </p>
            </div>
            <Button asChild>
              <Link href="/cabinet/support">Написать в поддержку</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
