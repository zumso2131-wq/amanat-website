"use client"

// ============================================
// СТРАНИЦА ПЛАТЕЖЕЙ — /admin/payments
// ============================================

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { formatMoney, formatDate } from "@/lib/calculations"
import { Loader2, CreditCard } from "lucide-react"

interface Payment {
  id: string
  amount: number
  method: string
  paidAt: string
  comment: string | null
  deal: {
    id: string
    dealNumber: string
    productName: string
    client: {
      id: string
      fullName: string
      phone: string
    }
  }
  installment: {
    id: string
    index: number
    amount: number
  } | null
}

const methodLabels: Record<string, string> = {
  CASH: "Наличные",
  CARD: "Карта",
  TRANSFER: "Перевод",
}

const methodColors: Record<string, string> = {
  CASH: "bg-green-100 text-green-800",
  CARD: "bg-blue-100 text-blue-800",
  TRANSFER: "bg-purple-100 text-purple-800",
}

export default function PaymentsPage() {
  const { toast } = useToast()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [methodFilter, setMethodFilter] = useState<string>("all")
  const [total, setTotal] = useState(0)

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (methodFilter && methodFilter !== "all") params.set("method", methodFilter)
      params.set("limit", "100")

      const response = await fetch(`/api/payments?${params}`)
      const data = await response.json()

      if (data.success) {
        setPayments(data.data)
        setTotal(data.total)
      } else {
        toast({ variant: "destructive", title: "Ошибка", description: data.error })
      }
    } catch {
      toast({ variant: "destructive", title: "Ошибка", description: "Не удалось загрузить платежи" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [methodFilter])

  // Сумма всех платежей
  const totalSum = payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Платежи</h1>
          <p className="text-muted-foreground">
            Всего: {total} | Сумма: {formatMoney(totalSum)}
          </p>
        </div>
      </div>

      {/* Фильтр */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Способ оплаты" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все способы</SelectItem>
                <SelectItem value="CASH">Наличные</SelectItem>
                <SelectItem value="CARD">Карта</SelectItem>
                <SelectItem value="TRANSFER">Перевод</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Таблица */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Платежи не найдены
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Сделка</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead className="text-right">Сумма</TableHead>
                  <TableHead>Способ</TableHead>
                  <TableHead>Платёж #</TableHead>
                  <TableHead>Комментарий</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDate(payment.paidAt)}</TableCell>
                    <TableCell>
                      <Link 
                        href={`/admin/deals/${payment.deal.id}`}
                        className="font-mono hover:underline"
                      >
                        {payment.deal.dealNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment.deal.client.fullName}</div>
                        <div className="text-sm text-muted-foreground">
                          {payment.deal.client.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      +{formatMoney(payment.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge className={methodColors[payment.method]}>
                        {methodLabels[payment.method]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payment.installment ? `#${payment.installment.index}` : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-32 truncate">
                      {payment.comment || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
