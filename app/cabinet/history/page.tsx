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
import { formatCurrency, formatDateTime } from "@/lib/utils"

export default function HistoryPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const dealsRes = await fetch("/api/deals")
      const deals = await dealsRes.json()

      const allPayments: any[] = []
      deals.deals?.forEach((deal: any) => {
        deal.payments?.forEach((payment: any) => {
          allPayments.push({
            ...payment,
            dealName: deal.productName,
          })
        })
      })

      allPayments.sort((a, b) => {
        return new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
      })

      setPayments(allPayments)
    } catch (error) {
      console.error("Error fetching payments:", error)
    } finally {
      setLoading(false)
    }
  }

  const methodLabels: Record<string, string> = {
    CASH: "Наличные",
    CARD: "Карта",
    TRANSFER: "Перевод",
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">История платежей</h1>

      <Card>
        <CardHeader>
          <CardTitle>Все платежи</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Загрузка...</p>
          ) : payments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Нет истории платежей</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Товар</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Способ оплаты</TableHead>
                  <TableHead>Дата оплаты</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.dealName}</TableCell>
                    <TableCell>{formatCurrency(Number(payment.amount))}</TableCell>
                    <TableCell>{methodLabels[payment.method] || payment.method}</TableCell>
                    <TableCell>{formatDateTime(payment.paidAt)}</TableCell>
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
