"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { 
  BarChart3, TrendingUp, TrendingDown, DollarSign, 
  Users, HandshakeIcon, AlertTriangle, Loader2, Download
} from "lucide-react"
import { formatMoney } from "@/lib/calculations"

interface ReportData {
  summary: {
    totalDeals: number
    activeDeals: number
    closedDeals: number
    draftDeals: number
    canceledDeals: number
    totalRevenue: number
    totalProfit: number
    totalReceivables: number
    overdueAmount: number
    overdueCount: number
    paymentsCount: number
  }
  monthly: Array<{
    month: string
    deals: number
    revenue: number
  }>
  topManagers: Array<{
    userId: string
    name: string
    dealsCount: number
    totalSales: number
  }>
}

export default function ReportsPage() {
  const { toast } = useToast()
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchReports = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/reports")
      const result = await res.json()
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Ошибка загрузки отчётов" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!data) return null

  const { summary, monthly, topManagers } = data

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Отчёты</h1>
          <p className="text-muted-foreground">Аналитика и статистика системы</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open("/api/export?type=deals", "_blank")}>
            <Download className="h-4 w-4 mr-2" />
            Экспорт сделок
          </Button>
          <Button variant="outline" onClick={() => window.open("/api/export?type=payments", "_blank")}>
            <Download className="h-4 w-4 mr-2" />
            Экспорт платежей
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Выручка</p>
                <p className="text-2xl font-bold text-green-600">{formatMoney(summary.totalRevenue)}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Прибыль (наценка)</p>
                <p className="text-2xl font-bold text-blue-600">{formatMoney(summary.totalProfit)}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Дебиторская задолженность</p>
                <p className="text-2xl font-bold text-orange-600">{formatMoney(summary.totalReceivables)}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={summary.overdueAmount > 0 ? "border-red-200" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Просроченная задолженность</p>
                <p className="text-2xl font-bold text-red-600">{formatMoney(summary.overdueAmount)}</p>
                <p className="text-xs text-muted-foreground">{summary.overdueCount} платежей</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deal Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{summary.totalDeals}</p>
            <p className="text-sm text-muted-foreground">Всего сделок</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-green-600">{summary.activeDeals}</p>
            <p className="text-sm text-muted-foreground">Активных</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{summary.closedDeals}</p>
            <p className="text-sm text-muted-foreground">Закрытых</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-gray-500">{summary.draftDeals}</p>
            <p className="text-sm text-muted-foreground">Черновиков</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-red-500">{summary.canceledDeals}</p>
            <p className="text-sm text-muted-foreground">Отменённых</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Динамика по месяцам
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthly.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="w-24 text-sm text-muted-foreground">{m.month}</div>
                  <div className="flex-1 mx-4">
                    <div className="h-4 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ 
                          width: `${Math.min(100, (m.revenue / Math.max(...monthly.map(x => x.revenue), 1)) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatMoney(m.revenue)}</p>
                    <p className="text-xs text-muted-foreground">{m.deals} сделок</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Managers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Топ менеджеров
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topManagers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Нет данных</p>
            ) : (
              <div className="space-y-4">
                {topManagers.map((manager, idx) => (
                  <div key={manager.userId} className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{manager.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {manager.dealsCount} сделок
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatMoney(manager.totalSales)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
