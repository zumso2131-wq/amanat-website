// ============================================
// ДЕТАЛИ СДЕЛКИ (КАБИНЕТ) — /cabinet/deals/[id]
// ============================================

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatMoney, formatDate, getDaysOverdue } from "@/lib/calculations"
import Link from "next/link"
import { ArrowLeft, Download, FileText, Calendar, CheckCircle, AlertTriangle } from "lucide-react"

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

const instStatusLabels: Record<string, string> = {
  DUE: "Ожидает",
  PAID: "Оплачен",
  OVERDUE: "Просрочен",
}

const instStatusColors: Record<string, string> = {
  DUE: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  OVERDUE: "bg-red-100 text-red-800",
}

export default async function CabinetDealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) redirect("/login")

  // Находим клиента
  const client = await prisma.client.findUnique({
    where: { phone: session.user.phone },
  })

  if (!client) redirect("/cabinet")

  // Загружаем сделку
  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      installments: { orderBy: { index: "asc" } },
      payments: { orderBy: { paidAt: "desc" } },
      documents: true,
    },
  })

  // Проверяем что сделка принадлежит этому клиенту
  if (!deal || deal.clientId !== client.id) {
    notFound()
  }

  // Расчёты
  const totalPaid = deal.payments.reduce((s, p) => s + p.amount, 0)
  const remaining = deal.amountToFinance - totalPaid
  const progress = deal.amountToFinance > 0 
    ? Math.round((totalPaid / deal.amountToFinance) * 100) 
    : 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center gap-4">
        <Link href="/cabinet/deals">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{deal.productName}</h1>
            <Badge className={statusColors[deal.status]}>
              {statusLabels[deal.status]}
            </Badge>
          </div>
          <p className="text-muted-foreground font-mono">
            № {deal.dealNumber} от {formatDate(deal.startDate)}
          </p>
        </div>
      </div>

      {/* Финансы */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Сумма сделки</div>
            <div className="text-2xl font-bold">{formatMoney(deal.salePrice)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Первый взнос</div>
            <div className="text-2xl font-bold">{formatMoney(deal.downPayment)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Оплачено</div>
            <div className="text-2xl font-bold text-green-600">{formatMoney(totalPaid)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Остаток</div>
            <div className="text-2xl font-bold text-orange-600">{formatMoney(remaining)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Прогресс */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Прогресс оплаты</span>
            <span className="font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Документы */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Документы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <a 
              href={`/api/pdf?dealId=${deal.id}&type=contract`} 
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Договор (PDF)
              </Button>
            </a>
            <a 
              href={`/api/pdf?dealId=${deal.id}&type=schedule`} 
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                График платежей (PDF)
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* График платежей */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            График платежей ({deal.months} мес)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Дата платежа</TableHead>
                <TableHead className="text-right">Сумма</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deal.installments.map((inst) => {
                const isOverdue = inst.status !== "PAID" && new Date(inst.dueDate) < today
                const daysOverdue = isOverdue ? getDaysOverdue(inst.dueDate) : 0

                return (
                  <TableRow 
                    key={inst.id}
                    className={isOverdue ? "bg-red-50" : inst.status === "PAID" ? "bg-green-50" : ""}
                  >
                    <TableCell className="font-mono">{inst.index}</TableCell>
                    <TableCell>{formatDate(inst.dueDate)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatMoney(inst.amount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {inst.status === "PAID" ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : isOverdue ? (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        ) : null}
                        <Badge className={isOverdue ? instStatusColors.OVERDUE : instStatusColors[inst.status]}>
                          {isOverdue ? "Просрочен" : instStatusLabels[inst.status]}
                        </Badge>
                        {isOverdue && (
                          <span className="text-sm text-red-600">({daysOverdue} дн.)</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* История платежей */}
      {deal.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>История платежей</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead className="text-right">Сумма</TableHead>
                  <TableHead>Способ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deal.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDate(payment.paidAt)}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      +{formatMoney(payment.amount)}
                    </TableCell>
                    <TableCell>
                      {payment.method === "CASH" ? "Наличные" : 
                       payment.method === "CARD" ? "Карта" : "Перевод"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
