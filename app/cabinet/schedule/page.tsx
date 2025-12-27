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

export default function SchedulePage() {
  const [installments, setInstallments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSchedule()
  }, [])

  const fetchSchedule = async () => {
    setLoading(true)
    try {
      const dealsRes = await fetch("/api/deals")
      const deals = await dealsRes.json()

      const allInstallments: any[] = []
      deals.deals?.forEach((deal: any) => {
        deal.installments?.forEach((inst: any) => {
          allInstallments.push({
            ...inst,
            dealName: deal.productName,
            dealId: deal.id,
          })
        })
      })

      allInstallments.sort((a, b) => {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      })

      setInstallments(allInstallments)
    } catch (error) {
      console.error("Error fetching schedule:", error)
    } finally {
      setLoading(false)
    }
  }

  const statusLabels: Record<string, string> = {
    DUE: "Ожидается",
    PAID: "Оплачено",
    OVERDUE: "Просрочено",
  }

  const statusColors: Record<string, string> = {
    DUE: "text-blue-600",
    PAID: "text-green-600",
    OVERDUE: "text-red-600",
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">График платежей</h1>

      <Card>
        <CardHeader>
          <CardTitle>Все платежи</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Загрузка...</p>
          ) : installments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Нет запланированных платежей</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Товар</TableHead>
                  <TableHead>Платёж №</TableHead>
                  <TableHead>Дата платежа</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {installments.map((inst) => (
                  <TableRow key={inst.id}>
                    <TableCell>{inst.dealName}</TableCell>
                    <TableCell>{inst.index}</TableCell>
                    <TableCell>{formatDate(inst.dueDate)}</TableCell>
                    <TableCell>{formatCurrency(Number(inst.amount))}</TableCell>
                    <TableCell className={statusColors[inst.status]}>
                      {statusLabels[inst.status] || inst.status}
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
