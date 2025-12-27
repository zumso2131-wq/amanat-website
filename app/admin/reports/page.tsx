"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

export default function ReportsPage() {
  const { toast } = useToast()
  const [reports, setReports] = useState({
    profit: 0,
    revenue: 0,
    debt: 0,
    dealsCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/reports")
      const data = await response.json()
      setReports(data)
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить отчёты",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (entity: string) => {
    try {
      const response = await fetch(`/api/export/${entity}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${entity}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось экспортировать данные",
        variant: "destructive",
      })
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Отчёты</h1>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Прибыль</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {loading ? "..." : formatCurrency(reports.profit)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Выручка</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {loading ? "..." : formatCurrency(reports.revenue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Дебиторка</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {loading ? "..." : formatCurrency(reports.debt)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Сделок</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{loading ? "..." : reports.dealsCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Экспорт данных</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button onClick={() => handleExport("clients")}>Экспорт клиентов (CSV)</Button>
          <Button onClick={() => handleExport("deals")}>Экспорт сделок (CSV)</Button>
          <Button onClick={() => handleExport("payments")}>Экспорт платежей (CSV)</Button>
        </CardContent>
      </Card>
    </div>
  )
}
