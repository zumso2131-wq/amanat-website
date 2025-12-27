// ============================================
// АДМИН ДАШБОРД — /admin
// ============================================

import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatMoney, formatDate } from "@/lib/calculations"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, FileText, CreditCard, AlertTriangle, ArrowRight } from "lucide-react"

export default async function AdminDashboardPage() {
  // Статистика
  const [clientsCount, dealsCount, activeDeals, payments, overdueInstallments] = await Promise.all([
    prisma.client.count(),
    prisma.deal.count(),
    prisma.deal.count({ where: { status: "ACTIVE" } }),
    prisma.payment.findMany({ take: 100, orderBy: { paidAt: "desc" } }),
    prisma.installment.count({
      where: {
        status: { not: "PAID" },
        dueDate: { lt: new Date() },
      },
    }),
  ])

  const totalRevenue = payments.reduce((s, p) => s + p.amount, 0)

  // Последние сделки
  const recentDeals = await prisma.deal.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { fullName: true } },
    },
  })

  // Последние платежи
  const recentPayments = await prisma.payment.findMany({
    take: 5,
    orderBy: { paidAt: "desc" },
    include: {
      deal: {
        select: {
          dealNumber: true,
          client: { select: { fullName: true } },
        },
      },
    },
  })

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    ACTIVE: "bg-green-100 text-green-800",
    CLOSED: "bg-blue-100 text-blue-800",
    CANCELED: "bg-red-100 text-red-800",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Панель управления</h1>
        <p className="text-muted-foreground">Обзор системы Аманат</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Клиентов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{clientsCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Активных сделок
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{activeDeals}</div>
            <p className="text-xs text-muted-foreground">из {dealsCount} всего</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Выручка
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatMoney(totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card className={overdueInstallments > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium flex items-center gap-2 ${overdueInstallments > 0 ? "text-red-600" : "text-muted-foreground"}`}>
              <AlertTriangle className="h-4 w-4" />
              Просрочено
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${overdueInstallments > 0 ? "text-red-600" : ""}`}>
              {overdueInstallments}
            </div>
            <p className="text-xs text-muted-foreground">платежей</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Последние сделки */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Последние сделки</CardTitle>
            <Link href="/admin/deals">
              <Button variant="ghost" size="sm">
                Все <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDeals.map((deal) => (
                <div key={deal.id} className="flex items-center justify-between">
                  <div>
                    <Link href={`/admin/deals/${deal.id}`} className="font-mono hover:underline">
                      {deal.dealNumber}
                    </Link>
                    <p className="text-sm text-muted-foreground">{deal.client.fullName}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={statusColors[deal.status]}>{deal.status}</Badge>
                    <p className="text-sm text-muted-foreground">{formatMoney(deal.salePrice)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Последние платежи */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Последние платежи</CardTitle>
            <Link href="/admin/payments">
              <Button variant="ghost" size="sm">
                Все <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{payment.deal.client.fullName}</p>
                    <p className="text-sm text-muted-foreground">{payment.deal.dealNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">+{formatMoney(payment.amount)}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(payment.paidAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
