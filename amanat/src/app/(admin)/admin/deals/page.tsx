"use client"

// ============================================
// СТРАНИЦА СПИСКА СДЕЛОК — /admin/deals
// ============================================

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Plus, Search, Eye, Loader2 } from "lucide-react"

// Типы
interface Deal {
  id: string
  dealNumber: string
  productName: string
  purchasePrice: number
  salePrice: number
  amountToFinance: number
  downPayment: number
  months: number
  status: string
  startDate: string
  createdAt: string
  client: {
    id: string
    fullName: string
    phone: string
  }
  manager: {
    id: string
    fullName: string
  }
  _count: {
    installments: number
    payments: number
  }
}

// Статусы сделок
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

export default function DealsPage() {
  const { toast } = useToast()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [total, setTotal] = useState(0)

  // Загрузка сделок
  const fetchDeals = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter)
      params.set("limit", "50")

      const response = await fetch(`/api/deals?${params}`)
      const data = await response.json()

      if (data.success) {
        setDeals(data.data)
        setTotal(data.total)
      } else {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: data.error || "Не удалось загрузить сделки",
        })
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Ошибка загрузки данных",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeals()
  }, [statusFilter])

  // Поиск с debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDeals()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Сделки</h1>
          <p className="text-muted-foreground">
            Всего: {total} сделок
          </p>
        </div>
        <Link href="/admin/deals/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Новая сделка
          </Button>
        </Link>
      </div>

      {/* Фильтры */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по номеру, клиенту, товару..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="DRAFT">Черновик</SelectItem>
                <SelectItem value="ACTIVE">Активна</SelectItem>
                <SelectItem value="CLOSED">Закрыта</SelectItem>
                <SelectItem value="CANCELED">Отменена</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Таблица сделок */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : deals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Сделки не найдены
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>№ Сделки</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Товар</TableHead>
                  <TableHead className="text-right">Цена продажи</TableHead>
                  <TableHead className="text-right">К выплате</TableHead>
                  <TableHead className="text-center">Срок</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deals.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell className="font-mono font-medium">
                      {deal.dealNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{deal.client.fullName}</div>
                        <div className="text-sm text-muted-foreground">
                          {deal.client.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-48 truncate">
                      {deal.productName}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatMoney(deal.salePrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatMoney(deal.amountToFinance)}
                    </TableCell>
                    <TableCell className="text-center">
                      {deal.months} мес
                    </TableCell>
                    <TableCell>
                      {formatDate(deal.startDate)}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[deal.status]}>
                        {statusLabels[deal.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/deals/${deal.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
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
