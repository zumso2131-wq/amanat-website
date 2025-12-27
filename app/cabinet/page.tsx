"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CabinetPage() {
  const [stats, setStats] = useState({
    activeDeals: 0,
    totalDebt: 0,
    nextPayment: null as any,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const dealsRes = await fetch("/api/deals?status=ACTIVE")
      const deals = await dealsRes.json()

      let totalDebt = 0
      let nextPayment: any = null
      let minDate = Infinity

      deals.deals?.forEach((deal: any) => {
        deal.installments?.forEach((inst: any) => {
          if (inst.status !== "PAID") {
            const debt = Number(inst.amount)
            totalDebt += debt

            const dueDate = new Date(inst.dueDate).getTime()
            if (dueDate < minDate) {
              minDate = dueDate
              nextPayment = {
                ...inst,
                dealName: deal.productName,
              }
            }
          }
        })
      })

      setStats({
        activeDeals: deals.pagination?.total || 0,
        totalDebt,
        nextPayment,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Обзор</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Активных сделок</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.activeDeals}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Общая задолженность</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(stats.totalDebt)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Ближайший платёж</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.nextPayment ? (
              <div>
                <p className="text-xl font-bold">
                  {formatCurrency(Number(stats.nextPayment.amount))}
                </p>
                <p className="text-sm text-gray-500">{stats.nextPayment.dealName}</p>
              </div>
            ) : (
              <p className="text-gray-500">Нет предстоящих платежей</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Link href="/cabinet/deals">
            <Button>Мои сделки</Button>
          </Link>
          <Link href="/cabinet/schedule">
            <Button variant="outline">График платежей</Button>
          </Link>
          <Link href="/cabinet/documents">
            <Button variant="outline">Документы</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
