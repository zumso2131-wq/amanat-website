"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalClients: 0,
    activeDeals: 0,
    totalRevenue: 0,
    overdueCount: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [clientsRes, dealsRes, paymentsRes, overdueRes] = await Promise.all([
        fetch("/api/clients?limit=1"),
        fetch("/api/deals?status=ACTIVE&limit=1"),
        fetch("/api/payments?limit=1"),
        fetch("/api/overdue"),
      ])

      const clients = await clientsRes.json()
      const deals = await dealsRes.json()
      const payments = await paymentsRes.json()
      const overdue = await overdueRes.json()

      // Подсчитываем выручку
      let revenue = 0
      if (payments.payments) {
        revenue = payments.payments.reduce(
          (sum: number, p: any) => sum + Number(p.amount),
          0
        )
      }

      setStats({
        totalClients: clients.pagination?.total || 0,
        activeDeals: deals.pagination?.total || 0,
        totalRevenue: revenue,
        overdueCount: overdue.overdue?.length || 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Обзор</h1>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Всего клиентов</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalClients}</p>
          </CardContent>
        </Card>

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
            <CardTitle className="text-sm font-medium">Выручка</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Просрочек</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{stats.overdueCount}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
