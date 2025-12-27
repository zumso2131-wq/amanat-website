"use client"

// ============================================
// ОТЧЁТЫ — /admin/reports
// ============================================

import { useEffect, useState } from "react"
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
import { useToast } from "@/components/ui/use-toast"
import { formatMoney } from "@/lib/calculations"
import { 
  Loader2, 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  AlertTriangle,
  Download,
  BarChart3,
  Users
} from "lucide-react"

interface Summary {
  totalDeals: number
  activeDeals: number
  closedDeals: number
  totalProfit: number
  totalRevenue: number
  totalReceivables: number
  overdueAmount: number
  overdueCount: number
}

interface MonthlyData {
  month: string
  deals: number
  revenue: number
}

interface ManagerStats {
  name: string
  deals: number
  revenue: number
}

interface ReportData {
  summary: Summary
  monthlyData: MonthlyData[]
  topManagers: ManagerStats[]
}

export default function ReportsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ReportData | null>(null)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch("/api/reports")
        const result = await response.json()

        if (result.success) {
          setData(result.data)
        } else {
          toast({ variant: "destructive", title: "Ошибка", description: result.error })
        }
      } catch {
        toast({ variant: "destructive", title: "Ошибка", description: "Не удалось загрузить" })
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [toast])

  const handleExport = (type: string) => {
    window.open(`/api/export?type=${type}`, "_blank")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Не удалось загрузить данные
      </div>
    )
  }

  const { summary, monthlyData, topManagers } = data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Отчёты</h1>
          <p className="text-muted-foreground">Аналитика и статистика</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport("clients")}>
            <Download className="mr-2 h-4 w-4" />
            Клиенты CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport("deals")}>
            <Download className="mr-2 h-4 w-4" />
            Сделки CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport("payments")}>
            <Download className="mr-2 h-4 w-4" />
            Платежи CSV
          </Button>
        </div>
      </div>

      {/* Основные показатели */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Прибыль
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatMoney(summary.totalProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              Из {summary.activeDeals + summary.closedDeals} сделок
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Выручка
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatMoney(summary.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Сумма всех платежей
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Дебиторка
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatMoney(summary.totalReceivables)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ожидается к оплате
            </p>
          </CardContent>
        </Card>

        <Card className={summary.overdueAmount > 0 ? "border-red-200" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Просрочено
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatMoney(summary.overdueAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.overdueCount} платежей
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Сделки по статусам */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Сделки по статусам
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold">{summary.totalDeals}</div>
              <div className="text-sm text-muted-foreground">Всего сделок</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{summary.activeDeals}</div>
              <div className="text-sm text-muted-foreground">Активных</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{summary.closedDeals}</div>
              <div className="text-sm text-muted-foreground">Закрытых</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Тренды */}
        <Card>
          <CardHeader>
            <CardTitle>Динамика по месяцам</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Месяц</TableHead>
                  <TableHead className="text-right">Сделок</TableHead>
                  <TableHead className="text-right">Выручка</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyData.map((m) => (
                  <TableRow key={m.month}>
                    <TableCell>{m.month}</TableCell>
                    <TableCell className="text-right">{m.deals}</TableCell>
                    <TableCell className="text-right">{formatMoney(m.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Топ менеджеров */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Топ менеджеров
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topManagers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Нет данных
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Менеджер</TableHead>
                    <TableHead className="text-right">Сделок</TableHead>
                    <TableHead className="text-right">Выручка</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topManagers.map((m, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell className="text-right">{m.deals}</TableCell>
                      <TableCell className="text-right">{formatMoney(m.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
