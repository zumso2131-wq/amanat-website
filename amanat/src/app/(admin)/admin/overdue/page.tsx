"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { 
  AlertTriangle, Phone, Eye, Loader2, RefreshCw
} from "lucide-react"
import { formatMoney, formatDate } from "@/lib/calculations"

interface OverdueInstallment {
  id: string
  index: number
  dueDate: string
  amount: number
  daysOverdue: number
  deal: {
    id: string
    dealNumber: string
    productName: string
    client: {
      id: string
      fullName: string
      phone: string
    }
    createdByUser: {
      fullName: string
    }
  }
}

interface Summary {
  totalCount: number
  totalAmount: number
  avgDaysOverdue: number
}

export default function OverduePage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [installments, setInstallments] = useState<OverdueInstallment[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchOverdue = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/overdue?limit=100")
      const data = await res.json()
      if (data.success) {
        setInstallments(data.data)
        setSummary(data.summary)
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Ошибка загрузки просрочек" })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const res = await fetch("/api/overdue", { method: "POST" })
      const data = await res.json()
      if (data.success) {
        toast({ title: data.message, variant: "success" })
        fetchOverdue()
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Ошибка обновления статусов" })
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchOverdue()
  }, [])

  const getDaysColor = (days: number) => {
    if (days > 30) return "bg-red-600"
    if (days > 14) return "bg-red-500"
    if (days > 7) return "bg-orange-500"
    return "bg-yellow-500"
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Просрочки</h1>
          <p className="text-muted-foreground">Платежи с истекшим сроком</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Обновить статусы
        </Button>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-red-600">Просроченных платежей</p>
                  <p className="text-2xl font-bold text-red-700">{summary.totalCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Общая сумма просрочки</p>
              <p className="text-2xl font-bold">{formatMoney(summary.totalAmount)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Средний срок просрочки</p>
              <p className="text-2xl font-bold">{summary.avgDaysOverdue} дней</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Клиент</TableHead>
                <TableHead>Сделка</TableHead>
                <TableHead>Дата платежа</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Просрочка</TableHead>
                <TableHead>Менеджер</TableHead>
                <TableHead className="w-[100px]">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : installments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-muted-foreground">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      Просрочек нет. Отлично!
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                installments.map((inst) => (
                  <TableRow key={inst.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{inst.deal.client.fullName}</p>
                        <a 
                          href={`tel:${inst.deal.client.phone}`} 
                          className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary"
                        >
                          <Phone className="h-3 w-3" />
                          {inst.deal.client.phone}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-mono text-sm">{inst.deal.dealNumber}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {inst.deal.productName}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(new Date(inst.dueDate))}</TableCell>
                    <TableCell className="font-medium">{formatMoney(inst.amount)}</TableCell>
                    <TableCell>
                      <Badge className={`${getDaysColor(inst.daysOverdue)} text-white`}>
                        {inst.daysOverdue} дн.
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {inst.deal.createdByUser.fullName}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => router.push(`/admin/deals/${inst.deal.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
