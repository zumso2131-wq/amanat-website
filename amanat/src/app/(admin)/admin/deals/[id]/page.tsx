"use client"

// ============================================
// СТРАНИЦА ДЕТАЛИ СДЕЛКИ — /admin/deals/[id]
// ============================================

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { formatMoney, formatDate, getDaysOverdue } from "@/lib/calculations"
import { ArrowLeft, Loader2, User, Package, Calendar, CreditCard, AlertCircle } from "lucide-react"

// Типы
interface Installment {
  id: string
  index: number
  dueDate: string
  amount: number
  status: string
}

interface Payment {
  id: string
  amount: number
  method: string
  paidAt: string
  comment: string | null
  user: {
    id: string
    fullName: string
  }
}

interface Deal {
  id: string
  dealNumber: string
  productName: string
  productSku: string | null
  purchasePrice: number
  markupPercentFinal: number
  salePrice: number
  downPayment: number
  amountToFinance: number
  months: number
  status: string
  startDate: string
  createdAt: string
  client: {
    id: string
    fullName: string
    phone: string
    iin: string | null
    address: string | null
  }
  manager: {
    id: string
    fullName: string
    phone: string
  }
  installments: Installment[]
  payments: Payment[]
  totalPaid: number
  remaining: number
  progress: number
  overdueCount: number
}

// Статусы
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

const installmentStatusLabels: Record<string, string> = {
  DUE: "Ожидает",
  PAID: "Оплачен",
  OVERDUE: "Просрочен",
  PARTIAL: "Частично",
}

const installmentStatusColors: Record<string, string> = {
  DUE: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  OVERDUE: "bg-red-100 text-red-800",
  PARTIAL: "bg-orange-100 text-orange-800",
}

const paymentMethodLabels: Record<string, string> = {
  CASH: "Наличные",
  CARD: "Карта",
  TRANSFER: "Перевод",
}

export default function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { toast } = useToast()
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)

  // Загрузка сделки
  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const response = await fetch(`/api/deals/${resolvedParams.id}`)
        const data = await response.json()

        if (data.success) {
          setDeal(data.data)
        } else {
          toast({
            variant: "destructive",
            title: "Ошибка",
            description: data.error || "Сделка не найдена",
          })
        }
      } catch {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить сделку",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchDeal()
  }, [resolvedParams.id, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!deal) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Сделка не найдена</p>
        <Link href="/admin/deals">
          <Button variant="link">Вернуться к списку</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/deals">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-mono">{deal.dealNumber}</h1>
              <Badge className={statusColors[deal.status]}>
                {statusLabels[deal.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Создана: {formatDate(deal.createdAt)}
            </p>
          </div>
        </div>
        {deal.overdueCount > 0 && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Просрочено: {deal.overdueCount} платежей</span>
          </div>
        )}
      </div>

      {/* Основная информация */}
      <div className="grid grid-cols-3 gap-6">
        {/* Клиент */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Клиент
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <div className="text-sm text-muted-foreground">ФИО</div>
              <div className="font-medium">{deal.client.fullName}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Телефон</div>
              <div>{deal.client.phone}</div>
            </div>
            {deal.client.iin && (
              <div>
                <div className="text-sm text-muted-foreground">ИИН</div>
                <div>{deal.client.iin}</div>
              </div>
            )}
            {deal.client.address && (
              <div>
                <div className="text-sm text-muted-foreground">Адрес</div>
                <div className="text-sm">{deal.client.address}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Товар */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Товар
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <div className="text-sm text-muted-foreground">Название</div>
              <div className="font-medium">{deal.productName}</div>
            </div>
            {deal.productSku && (
              <div>
                <div className="text-sm text-muted-foreground">Артикул</div>
                <div className="font-mono">{deal.productSku}</div>
              </div>
            )}
            <div>
              <div className="text-sm text-muted-foreground">Менеджер</div>
              <div>{deal.manager.fullName}</div>
            </div>
          </CardContent>
        </Card>

        {/* Финансы */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Финансы
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-sm text-muted-foreground">Закуп</div>
                <div>{formatMoney(deal.purchasePrice)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Наценка</div>
                <div>{deal.markupPercentFinal}%</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Продажа</div>
                <div className="font-medium">{formatMoney(deal.salePrice)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Взнос</div>
                <div>{formatMoney(deal.downPayment)}</div>
              </div>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="text-sm text-muted-foreground">Прибыль</div>
              <div className="text-lg font-bold text-green-600">
                {formatMoney(deal.salePrice - deal.purchasePrice)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Прогресс оплаты */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Прогресс оплаты</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-6 mb-4">
            <div>
              <div className="text-sm text-muted-foreground">К выплате</div>
              <div className="text-xl font-bold">{formatMoney(deal.amountToFinance)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Оплачено</div>
              <div className="text-xl font-bold text-green-600">{formatMoney(deal.totalPaid)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Остаток</div>
              <div className="text-xl font-bold text-orange-600">{formatMoney(deal.remaining)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Прогресс</div>
              <div className="text-xl font-bold">{deal.progress}%</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all"
              style={{ width: `${Math.min(deal.progress, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* График платежей */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
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
                <TableHead className="text-right">Дней просрочки</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deal.installments.map((inst) => {
                const daysOverdue = inst.status !== "PAID" ? getDaysOverdue(inst.dueDate) : 0
                return (
                  <TableRow key={inst.id}>
                    <TableCell className="font-mono">{inst.index}</TableCell>
                    <TableCell>{formatDate(inst.dueDate)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatMoney(inst.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge className={installmentStatusColors[inst.status]}>
                        {installmentStatusLabels[inst.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {daysOverdue > 0 && inst.status !== "PAID" && (
                        <span className="text-red-600 font-medium">{daysOverdue} дн.</span>
                      )}
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
            <CardTitle className="text-lg">История платежей</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead className="text-right">Сумма</TableHead>
                  <TableHead>Способ</TableHead>
                  <TableHead>Принял</TableHead>
                  <TableHead>Комментарий</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deal.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDate(payment.paidAt)}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      +{formatMoney(payment.amount)}
                    </TableCell>
                    <TableCell>{paymentMethodLabels[payment.method]}</TableCell>
                    <TableCell>{payment.user.fullName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {payment.comment || "—"}
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
