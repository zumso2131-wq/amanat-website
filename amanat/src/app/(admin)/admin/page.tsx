import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatMoney, formatDate } from "@/lib/calculations"
import { 
  Users, 
  HandshakeIcon, 
  CreditCard, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock
} from "lucide-react"
import Link from "next/link"

async function getStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    clientsCount,
    activeDeals,
    totalDeals,
    payments,
    overdueCount,
    recentDeals,
    recentPayments,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.deal.count({ where: { status: "ACTIVE" } }),
    prisma.deal.count(),
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.installment.count({
      where: {
        status: { not: "PAID" },
        dueDate: { lt: today },
        deal: { status: "ACTIVE" },
      },
    }),
    prisma.deal.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { fullName: true } },
      },
    }),
    prisma.payment.findMany({
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
    }),
  ])

  return {
    clientsCount,
    activeDeals,
    totalDeals,
    totalRevenue: payments._sum.amount || 0,
    overdueCount,
    recentDeals,
    recentPayments,
  }
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  href, 
  variant = "default" 
}: { 
  title: string
  value: string | number
  icon: React.ElementType
  href?: string
  variant?: "default" | "success" | "warning" | "danger"
}) {
  const colorClasses = {
    default: "bg-primary/10 text-primary",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700",
  }

  const content = (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`h-12 w-12 rounded-lg ${colorClasses[variant]} flex items-center justify-center`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return href ? <Link href={href}>{content}</Link> : content
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Панель управления</h1>
        <p className="text-muted-foreground">Обзор системы Аманат</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Клиентов"
          value={stats.clientsCount}
          icon={Users}
          href="/admin/clients"
        />
        <StatCard
          title="Активных сделок"
          value={stats.activeDeals}
          icon={HandshakeIcon}
          href="/admin/deals?status=ACTIVE"
          variant="success"
        />
        <StatCard
          title="Выручка"
          value={formatMoney(stats.totalRevenue)}
          icon={TrendingUp}
          href="/admin/reports"
        />
        <StatCard
          title="Просрочек"
          value={stats.overdueCount}
          icon={AlertTriangle}
          href="/admin/overdue"
          variant={stats.overdueCount > 0 ? "danger" : "default"}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Deals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Последние сделки</CardTitle>
            <Link href="/admin/deals" className="text-sm text-primary hover:underline">
              Все сделки →
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentDeals.map((deal) => (
                <Link 
                  key={deal.id} 
                  href={`/admin/deals/${deal.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium">{deal.dealNumber}</p>
                    <p className="text-sm text-muted-foreground">{deal.client.fullName}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      deal.status === "ACTIVE" ? "success" :
                      deal.status === "CLOSED" ? "info" :
                      deal.status === "CANCELED" ? "destructive" : "secondary"
                    }>
                      {deal.status === "ACTIVE" ? "Активна" :
                       deal.status === "CLOSED" ? "Закрыта" :
                       deal.status === "CANCELED" ? "Отменена" : "Черновик"}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(deal.createdAt)}
                    </p>
                  </div>
                </Link>
              ))}
              {stats.recentDeals.length === 0 && (
                <p className="text-center text-muted-foreground py-4">Нет сделок</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Последние платежи</CardTitle>
            <Link href="/admin/payments" className="text-sm text-primary hover:underline">
              Все платежи →
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentPayments.map((payment) => (
                <div 
                  key={payment.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{payment.deal.client.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      Сделка {payment.deal.dealNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+{formatMoney(payment.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(payment.paidAt)}
                    </p>
                  </div>
                </div>
              ))}
              {stats.recentPayments.length === 0 && (
                <p className="text-center text-muted-foreground py-4">Нет платежей</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
