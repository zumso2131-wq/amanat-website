"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CabinetDealsPage() {
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeals()
  }, [])

  const fetchDeals = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/deals")
      const data = await response.json()
      setDeals(data.deals || [])
    } catch (error) {
      console.error("Error fetching deals:", error)
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
      <h1 className="text-3xl font-bold mb-6">Мои сделки</h1>

      <Card>
        <CardHeader>
          <CardTitle>Список сделок</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Загрузка...</p>
          ) : deals.length === 0 ? (
            <p className="text-center text-gray-500 py-8">У вас пока нет сделок</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Товар</TableHead>
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
                    <TableCell>{formatCurrency(Number(deal.salePrice))}</TableCell>
                    <TableCell>{deal.months} мес.</TableCell>
                    <TableCell>{statusLabels[deal.status] || deal.status}</TableCell>
                    <TableCell>{formatDate(deal.createdAt)}</TableCell>
                    <TableCell>
                      <Link href={`/cabinet/deals/${deal.id}`}>
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
