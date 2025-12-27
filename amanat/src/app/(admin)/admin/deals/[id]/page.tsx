"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select"
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { 
  ArrowLeft, FileText, Download, CreditCard, CheckCircle, 
  AlertTriangle, Clock, Loader2, Phone, User, Calendar
} from "lucide-react"
import { formatMoney, formatDate, isOverdue, getDaysOverdue } from "@/lib/calculations"
import { dealStatusLabels, dealStatusColors, installmentStatusLabels, installmentStatusColors, paymentMethodLabels } from "@/lib/utils"

interface DealDetail {
  id: string
  dealNumber: string
  productName: string
  productSku: string | null
  purchasePrice: number
  markupPercentFinal: number
  salePrice: number
  downPayment: number
  amountToFinance: number
  months: number
  startDate: string
  monthlyBasePayment: number
  lastPaymentAdjustment: number
  status: string
  createdAt: string
  totalPaid: number
  remaining: number
  paidInstallments: number
  overdueInstallments: number
  progress: number
  client: {
    id: string
    fullName: string
    phone: string
    iin: string | null
    address: string | null
  }
  installments: Array<{
    id: string
    index: number
    dueDate: string
    amount: number
    status: string
    paidAt: string | null
  }>
  payments: Array<{
    id: string
    amount: number
    method: string
    paidAt: string
    comment: string | null
  }>
  createdByUser: { fullName: string }
}

export default function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  
  const [deal, setDeal] = useState<DealDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentData, setPaymentData] = useState({
    amount: "",
    method: "CASH",
    installmentId: "",
    comment: "",
  })

  const fetchDeal = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/deals/${id}`)
      const data = await res.json()
      if (data.success) {
        setDeal(data.data)
      } else {
        toast({ variant: "destructive", title: "Ошибка", description: data.error })
        router.push("/admin/deals")
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Ошибка загрузки сделки" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeal()
  }, [id])

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/deals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Статус обновлён", variant: "success" })
        fetchDeal()
      } else {
        toast({ variant: "destructive", title: "Ошибка", description: data.error })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Ошибка обновления статуса" })
    }
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setPaymentLoading(true)
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealId: id,
          amount: parseInt(paymentData.amount),
          method: paymentData.method,
          installmentId: paymentData.installmentId || undefined,
          comment: paymentData.comment || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Платёж принят", variant: "success" })
        setIsPaymentOpen(false)
        setPaymentData({ amount: "", method: "CASH", installmentId: "", comment: "" })
        fetchDeal()
      } else {
        toast({ variant: "destructive", title: "Ошибка", description: data.error })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Ошибка создания платежа" })
    } finally {
      setPaymentLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!deal) return null

  const nextInstallment = deal.installments.find(i => i.status !== "PAID")

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Сделка {deal.dealNumber}</h1>
              <Badge className={dealStatusColors[deal.status]}>
                {dealStatusLabels[deal.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground">{deal.productName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open(`/api/pdf?dealId=${id}&type=contract`, "_blank")}>
            <FileText className="h-4 w-4 mr-2" />
            Договор
          </Button>
          <Button variant="outline" onClick={() => window.open(`/api/pdf?dealId=${id}&type=schedule`, "_blank")}>
            <Download className="h-4 w-4 mr-2" />
            График
          </Button>
          {deal.status === "ACTIVE" && (
            <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
              <DialogTrigger asChild>
                <Button>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Принять платёж
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Принять платёж</DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePayment} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Сумма (₸) *</Label>
                    <Input
                      type="number"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                      placeholder={nextInstallment ? nextInstallment.amount.toString() : ""}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Остаток к оплате: {formatMoney(deal.remaining)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Способ оплаты</Label>
                    <Select
                      value={paymentData.method}
                      onValueChange={(v) => setPaymentData({ ...paymentData, method: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">Наличные</SelectItem>
                        <SelectItem value="CARD">Карта</SelectItem>
                        <SelectItem value="TRANSFER">Перевод</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Комментарий</Label>
                    <Input
                      value={paymentData.comment}
                      onChange={(e) => setPaymentData({ ...paymentData, comment: e.target.value })}
                      placeholder="Необязательно"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsPaymentOpen(false)}>
                      Отмена
                    </Button>
                    <Button type="submit" disabled={paymentLoading}>
                      {paymentLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Принять
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">К выплате</p>
            <p className="text-2xl font-bold">{formatMoney(deal.amountToFinance)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Оплачено</p>
            <p className="text-2xl font-bold text-green-600">{formatMoney(deal.totalPaid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Остаток</p>
            <p className="text-2xl font-bold text-orange-600">{formatMoney(deal.remaining)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Прогресс</p>
            <p className="text-2xl font-bold">{deal.progress}%</p>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all" 
                style={{ width: `${deal.progress}%` }} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Deal Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Информация о сделке</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Товар</p>
                  <p className="font-medium">{deal.productName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Цена закупа</p>
                  <p className="font-medium">{formatMoney(deal.purchasePrice)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Наценка</p>
                  <p className="font-medium">{deal.markupPercentFinal}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Цена продажи</p>
                  <p className="font-medium">{formatMoney(deal.salePrice)}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Первоначальный взнос</p>
                  <p className="font-medium">{formatMoney(deal.downPayment)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Срок рассрочки</p>
                  <p className="font-medium">{deal.months} месяцев</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ежемесячный платёж</p>
                  <p className="font-medium">{formatMoney(deal.monthlyBasePayment)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Дата выдачи</p>
                  <p className="font-medium">{formatDate(new Date(deal.startDate))}</p>
                </div>
              </div>
            </div>
            
            {/* Status Actions */}
            {deal.status === "DRAFT" && (
              <div className="mt-6 pt-6 border-t">
                <Button onClick={() => handleStatusChange("ACTIVE")}>
                  Активировать сделку
                </Button>
              </div>
            )}
            {deal.status === "ACTIVE" && deal.remaining === 0 && (
              <div className="mt-6 pt-6 border-t">
                <Button onClick={() => handleStatusChange("CLOSED")} variant="outline">
                  Закрыть сделку
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Клиент
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">{deal.client.fullName}</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${deal.client.phone}`} className="hover:text-primary">
                {deal.client.phone}
              </a>
            </div>
            {deal.client.iin && (
              <div>
                <p className="text-sm text-muted-foreground">ИИН</p>
                <p>{deal.client.iin}</p>
              </div>
            )}
            {deal.client.address && (
              <div>
                <p className="text-sm text-muted-foreground">Адрес</p>
                <p className="text-sm">{deal.client.address}</p>
              </div>
            )}
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Менеджер</p>
              <p>{deal.createdByUser.fullName}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Schedule & Payments */}
      <Tabs defaultValue="schedule">
        <TabsList>
          <TabsTrigger value="schedule">
            <Calendar className="h-4 w-4 mr-2" />
            График платежей
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="h-4 w-4 mr-2" />
            История платежей ({deal.payments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">№</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата оплаты</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deal.installments.map((inst) => {
                    const overdue = isOverdue(inst.dueDate, inst.status)
                    const days = overdue ? getDaysOverdue(inst.dueDate) : 0
                    return (
                      <TableRow key={inst.id} className={overdue ? "bg-red-50" : ""}>
                        <TableCell className="font-medium">{inst.index}</TableCell>
                        <TableCell>{formatDate(new Date(inst.dueDate))}</TableCell>
                        <TableCell className="font-medium">{formatMoney(inst.amount)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className={installmentStatusColors[inst.status]}>
                              {installmentStatusLabels[inst.status]}
                            </Badge>
                            {overdue && (
                              <span className="text-xs text-red-600">
                                ({days} дн.)
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {inst.paidAt ? formatDate(new Date(inst.paidAt)) : "—"}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Способ</TableHead>
                    <TableHead>Комментарий</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deal.payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Нет платежей
                      </TableCell>
                    </TableRow>
                  ) : (
                    deal.payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDate(new Date(payment.paidAt))}</TableCell>
                        <TableCell className="font-medium text-green-600">
                          +{formatMoney(payment.amount)}
                        </TableCell>
                        <TableCell>{paymentMethodLabels[payment.method]}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {payment.comment || "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
