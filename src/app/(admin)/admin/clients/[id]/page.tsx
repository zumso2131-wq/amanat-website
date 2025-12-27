"use client"

// ============================================
// ПРОСМОТР КЛИЕНТА — /admin/clients/[id]
// ============================================

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { formatDate, formatMoney } from "@/lib/calculations"
import { ArrowLeft, Loader2, Edit, User, FileText } from "lucide-react"

interface Deal {
  id: string
  dealNumber: string
  productName: string
  salePrice: number
  amountToFinance: number
  status: string
  createdAt: string
}

interface Client {
  id: string
  fullName: string
  phone: string
  iin: string | null
  passportNumber: string | null
  passportIssuedBy: string | null
  passportIssuedAt: string | null
  address: string | null
  note: string | null
  createdAt: string
  deals: Deal[]
}

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

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { toast } = useToast()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await fetch(`/api/clients/${resolvedParams.id}`)
        const data = await response.json()

        if (data.success) {
          setClient(data.data)
        } else {
          toast({
            variant: "destructive",
            title: "Ошибка",
            description: data.error,
          })
        }
      } catch {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить клиента",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchClient()
  }, [resolvedParams.id, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Клиент не найден</p>
        <Link href="/admin/clients">
          <Button variant="link">Вернуться к списку</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/clients">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{client.fullName}</h1>
            <p className="text-muted-foreground">{client.phone}</p>
          </div>
        </div>
        <Link href={`/admin/clients/${client.id}/edit`}>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Редактировать
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Основные данные */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Данные клиента
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">ИИН</div>
                <div>{client.iin || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Телефон</div>
                <div>{client.phone}</div>
              </div>
            </div>
            {client.passportNumber && (
              <div>
                <div className="text-sm text-muted-foreground">Паспорт</div>
                <div>
                  {client.passportNumber}
                  {client.passportIssuedBy && `, ${client.passportIssuedBy}`}
                  {client.passportIssuedAt && `, ${formatDate(client.passportIssuedAt)}`}
                </div>
              </div>
            )}
            {client.address && (
              <div>
                <div className="text-sm text-muted-foreground">Адрес</div>
                <div>{client.address}</div>
              </div>
            )}
            {client.note && (
              <div>
                <div className="text-sm text-muted-foreground">Примечание</div>
                <div className="text-sm">{client.note}</div>
              </div>
            )}
            <div className="pt-2 border-t">
              <div className="text-sm text-muted-foreground">Создан</div>
              <div>{formatDate(client.createdAt)}</div>
            </div>
          </CardContent>
        </Card>

        {/* Статистика */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Статистика
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold">{client.deals.length}</div>
                <div className="text-sm text-muted-foreground">Всего сделок</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold">
                  {client.deals.filter((d) => d.status === "ACTIVE").length}
                </div>
                <div className="text-sm text-muted-foreground">Активных</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Сделки клиента */}
      {client.deals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Сделки клиента</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>№ Сделки</TableHead>
                  <TableHead>Товар</TableHead>
                  <TableHead className="text-right">Сумма</TableHead>
                  <TableHead className="text-right">К выплате</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.deals.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell className="font-mono">{deal.dealNumber}</TableCell>
                    <TableCell>{deal.productName}</TableCell>
                    <TableCell className="text-right">{formatMoney(deal.salePrice)}</TableCell>
                    <TableCell className="text-right">{formatMoney(deal.amountToFinance)}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[deal.status]}>
                        {statusLabels[deal.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(deal.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/deals/${deal.id}`}>
                        <Button variant="ghost" size="sm">Открыть</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
