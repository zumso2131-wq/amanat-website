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
import { useToast } from "@/components/ui/use-toast"

export default function OverduePage() {
  const { toast } = useToast()
  const [overdue, setOverdue] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOverdue()
  }, [])

  const fetchOverdue = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/overdue")
      const data = await response.json()
      setOverdue(data.overdue || [])
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить просрочки",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Просроченные платежи</h1>

      <Card>
        <CardHeader>
          <CardTitle>Список просрочек</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Загрузка...</p>
          ) : overdue.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Просроченных платежей нет</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Товар</TableHead>
                  <TableHead>Платёж №</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Дата платежа</TableHead>
                  <TableHead>Менеджер</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdue.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.deal?.client?.fullName}</TableCell>
                    <TableCell>{item.deal?.productName}</TableCell>
                    <TableCell>{item.index}</TableCell>
                    <TableCell className="text-red-600 font-semibold">
                      {formatCurrency(Number(item.amount))}
                    </TableCell>
                    <TableCell>{formatDate(item.dueDate)}</TableCell>
                    <TableCell>{item.deal?.createdByUser?.fullName || "-"}</TableCell>
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
