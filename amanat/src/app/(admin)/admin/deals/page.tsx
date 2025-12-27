"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select"
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { 
  Plus, Search, Eye, Loader2, Download, FileText, Calendar
} from "lucide-react"
import { formatMoney, formatDate } from "@/lib/calculations"
import { dealStatusLabels, dealStatusColors } from "@/lib/utils"

interface Deal {
  id: string
  dealNumber: string
  productName: string
  salePrice: number
  amountToFinance: number
  months: number
  status: string
  createdAt: string
  client: { id: string; fullName: string; phone: string }
  createdByUser: { fullName: string }
  _count: { payments: number }
}

interface Client {
  id: string
  fullName: string
  phone: string
}

export default function DealsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [deals, setDeals] = useState<Deal[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [status, setStatus] = useState(searchParams.get("status") || "")
  const [page, setPage] = useState(1)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  
  const [formData, setFormData] = useState({
    clientId: "",
    productName: "",
    productSku: "",
    purchasePrice: "",
    markupPercentFinal: "25",
    downPayment: "0",
    months: "5",
    startDate: new Date().toISOString().split("T")[0],
  })

  const fetchDeals = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
        ...(status && { status }),
      })
      const res = await fetch(`/api/deals?${params}`)
      const data = await res.json()
      if (data.success) {
        setDeals(data.data)
        setTotal(data.total)
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Ошибка загрузки сделок" })
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients?limit=100")
      const data = await res.json()
      if (data.success) {
        setClients(data.data)
      }
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }

  useEffect(() => {
    fetchDeals()
  }, [page, search, status])

  useEffect(() => {
    fetchClients()
  }, [])

  // Auto-calculate markup based on months
  useEffect(() => {
    const months = parseInt(formData.months)
    if (months === 5) setFormData(f => ({ ...f, markupPercentFinal: "25" }))
    else if (months === 6) setFormData(f => ({ ...f, markupPercentFinal: "35" }))
    else if (months >= 7) {
      const markup = 35 + (months - 6) * 5
      setFormData(f => ({ ...f, markupPercentFinal: markup.toString() }))
    }
  }, [formData.months])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          purchasePrice: parseInt(formData.purchasePrice),
          markupPercentFinal: parseInt(formData.markupPercentFinal),
          downPayment: parseInt(formData.downPayment),
          months: parseInt(formData.months),
          startDate: new Date(formData.startDate),
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Сделка создана", variant: "success" })
        setIsCreateOpen(false)
        router.push(`/admin/deals/${data.data.id}`)
      } else {
        toast({ variant: "destructive", title: "Ошибка", description: data.error })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Ошибка создания сделки" })
    } finally {
      setCreating(false)
    }
  }

  const handleExport = () => {
    window.open("/api/export?type=deals", "_blank")
  }

  const isMarkupEditable = parseInt(formData.months) === 3

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Сделки</h1>
          <p className="text-muted-foreground">Управление сделками рассрочки</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Экспорт CSV
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Новая сделка
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Создать сделку</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Клиент *</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(v) => setFormData({ ...formData, clientId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите клиента" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.fullName} ({c.phone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Название товара *</Label>
                  <Input
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    placeholder="iPhone 15 Pro Max"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Цена закупа (₸) *</Label>
                    <Input
                      type="number"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                      placeholder="500000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Срок (мес) *</Label>
                    <Select
                      value={formData.months}
                      onValueChange={(v) => setFormData({ ...formData, months: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                          <SelectItem key={m} value={m.toString()}>
                            {m} мес
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Наценка (%){!isMarkupEditable && " — фикс."}</Label>
                    <Input
                      type="number"
                      value={formData.markupPercentFinal}
                      onChange={(e) => setFormData({ ...formData, markupPercentFinal: e.target.value })}
                      disabled={!isMarkupEditable}
                      min={isMarkupEditable ? 15 : undefined}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Первонач. взнос (₸)</Label>
                    <Input
                      type="number"
                      value={formData.downPayment}
                      onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Дата выдачи товара *</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Отмена
                  </Button>
                  <Button type="submit" disabled={creating}>
                    {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Создать
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по номеру, товару или клиенту..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
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
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>№ Сделки</TableHead>
                <TableHead>Клиент</TableHead>
                <TableHead>Товар</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Срок</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead className="w-[80px]">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : deals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Сделки не найдены
                  </TableCell>
                </TableRow>
              ) : (
                deals.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell className="font-mono">{deal.dealNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{deal.client.fullName}</p>
                        <p className="text-xs text-muted-foreground">{deal.client.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{deal.productName}</TableCell>
                    <TableCell className="font-medium">{formatMoney(deal.amountToFinance)}</TableCell>
                    <TableCell>{deal.months} мес</TableCell>
                    <TableCell>
                      <Badge className={dealStatusColors[deal.status]}>
                        {dealStatusLabels[deal.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(new Date(deal.createdAt))}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => router.push(`/admin/deals/${deal.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Назад
          </Button>
          <span className="py-2 px-4">Страница {page} из {Math.ceil(total / 20)}</span>
          <Button variant="outline" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(page + 1)}>
            Далее
          </Button>
        </div>
      )}
    </div>
  )
}
