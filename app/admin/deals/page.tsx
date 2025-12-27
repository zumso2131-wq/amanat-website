"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function DealsPage() {
  const { toast } = useToast()
  const [deals, setDeals] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeals()
  }, [search, status])

  const fetchDeals = async () => {
    setLoading(true)
    try {
      const url = new URL("/api/deals", window.location.origin)
      if (search) url.searchParams.set("search", search)
      if (status) url.searchParams.set("status", status)

      const response = await fetch(url.toString())
      const data = await response.json()
      setDeals(data.deals || [])
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить сделки",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const statusLabels: Record<string, string> = {
    DRAFT: "Черновик",
    ACTIVE: "Активна",
    CLOSED: "Закрыта",
    CANCELED: "Отменена",
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Сделки</h1>
        <Link href="/admin/deals/new">
          <Button>Создать сделку</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Input
            placeholder="Поиск по товару..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Все статусы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Все статусы</SelectItem>
              <SelectItem value="DRAFT">Черновик</SelectItem>
              <SelectItem value="ACTIVE">Активна</SelectItem>
              <SelectItem value="CLOSED">Закрыта</SelectItem>
              <SelectItem value="CANCELED">Отменена</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Список сделок</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Загрузка...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Товар</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Цена продажи</TableHead>
                  <TableHead>Срок</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Дата создания</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deals.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell>{deal.productName}</TableCell>
                    <TableCell>{deal.client?.fullName}</TableCell>
                    <TableCell>{formatCurrency(Number(deal.salePrice))}</TableCell>
                    <TableCell>{deal.months} мес.</TableCell>
                    <TableCell>{statusLabels[deal.status] || deal.status}</TableCell>
                    <TableCell>{formatDate(deal.createdAt)}</TableCell>
                    <TableCell>
                      <Link href={`/admin/deals/${deal.id}`}>
                        <Button variant="outline" size="sm">
                          Открыть
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
