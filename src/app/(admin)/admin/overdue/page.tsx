"use client"

// ============================================
// СТРАНИЦА ПРОСРОЧЕК — /admin/overdue
// ============================================

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { formatMoney, formatDate } from "@/lib/calculations"
import { Loader2, AlertTriangle, RefreshCw, Phone } from "lucide-react"

interface OverdueItem {
  id: string
  dealId: string
  dealNumber: string
  clientId: string
  clientName: string
  clientPhone: string
  managerName: string
  index: number
  dueDate: string
  amount: number
  status: string
  daysOverdue: number
}

interface Summary {
  totalCount: number
  totalAmount: number
  avgDaysOverdue: number
}

export default function OverduePage() {
  const { toast } = useToast()
  const [items, setItems] = useState<OverdueItem[]>([])
  const [summary, setSummary] = useState<Summary>({ totalCount: 0, totalAmount: 0, avgDaysOverdue: 0 })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const fetchOverdue = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/overdue")
      const data = await response.json()

      if (data.success) {
        setItems(data.data)
        setSummary(data.summary)
      } else {
        toast({ variant: "destructive", title: "Ошибка", description: data.error })
      }
    } catch {
      toast({ variant: "destructive", title: "Ошибка", description: "Не удалось загрузить" })
    } finally {
      setLoading(false)
    }
  }

  const updateStatuses = async () => {
    try {
      setUpdating(true)
      const response = await fetch("/api/overdue", { method: "POST" })
      const data = await response.json()

      if (data.success) {
        toast({ title: "Статусы обновлены", description: data.message })
        fetchOverdue()
      } else {
        toast({ variant: "destructive", title: "Ошибка", description: data.error })
      }
    } catch {
      toast({ variant: "destructive", title: "Ошибка", description: "Не удалось обновить" })
    } finally {
      setUpdating(false)
    }
  }

  useEffect(() => {
    fetchOverdue()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            Просрочки
          </h1>
          <p className="text-muted-foreground">
            Платежи с истёкшим сроком
          </p>
        </div>
        <Button onClick={updateStatuses} disabled={updating} variant="outline">
          {updating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Обновить статусы
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Всего просрочено
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.totalCount}</div>
            <p className="text-xs text-muted-foreground">платежей</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Сумма просрочки
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatMoney(summary.totalAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Средняя просрочка
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.avgDaysOverdue} дн.</div>
          </CardContent>
        </Card>
      </div>

      {/* Таблица */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              🎉 Просрочек нет!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Сделка</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Платёж #</TableHead>
                  <TableHead>Дата платежа</TableHead>
                  <TableHead className="text-right">Сумма</TableHead>
                  <TableHead className="text-center">Дней</TableHead>
                  <TableHead>Менеджер</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} className={item.daysOverdue > 30 ? "bg-red-50" : ""}>
                    <TableCell>
                      <Link 
                        href={`/admin/deals/${item.dealId}`}
                        className="font-mono hover:underline"
                      >
                        {item.dealNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.clientName}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {item.clientPhone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>#{item.index}</TableCell>
                    <TableCell>{formatDate(item.dueDate)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatMoney(item.amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant={item.daysOverdue > 30 ? "destructive" : "secondary"}
                        className={item.daysOverdue > 30 ? "" : "bg-orange-100 text-orange-800"}
                      >
                        {item.daysOverdue} дн.
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.managerName}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/deals/${item.dealId}`}>
                        <Button size="sm" variant="outline">
                          Принять платёж
                        </Button>
                      </Link>
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
