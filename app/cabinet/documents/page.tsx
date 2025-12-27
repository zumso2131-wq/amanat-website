"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default function DocumentsPage() {
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

  const handleDownload = (dealId: string, type: "contract" | "schedule") => {
    window.open(`/api/deals/${dealId}/pdf?type=${type}`, "_blank")
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Документы</h1>

      <Card>
        <CardHeader>
          <CardTitle>Документы по сделкам</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Загрузка...</p>
          ) : deals.length === 0 ? (
            <p className="text-center text-gray-500 py-8">У вас пока нет сделок</p>
          ) : (
            <div className="space-y-4">
              {deals.map((deal) => (
                <div
                  key={deal.id}
                  className="border rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold">{deal.productName}</h3>
                    <p className="text-sm text-gray-500">
                      Сделка от {new Date(deal.createdAt).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(deal.id, "contract")}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Договор
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(deal.id, "schedule")}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      График
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
