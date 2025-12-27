"use client"

// ============================================
// СТРАНИЦА СОЗДАНИЯ СДЕЛКИ — /admin/deals/new
// ============================================

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import {
  calculateDeal,
  formatMoney,
  formatDate,
  getMarkupPercent,
  isMarkupEditable,
  MIN_MONTHS,
  MAX_MONTHS,
  MIN_MARKUP_3_MONTHS,
} from "@/lib/calculations"
import { ArrowLeft, Loader2, Calculator, Calendar } from "lucide-react"

// Типы
interface Client {
  id: string
  fullName: string
  phone: string
}

interface FormData {
  clientId: string
  productName: string
  productSku: string
  purchasePrice: number
  months: number
  downPayment: number
  markupPercentFinal: number
  startDate: string
}

export default function NewDealPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // Состояния
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [loadingClients, setLoadingClients] = useState(true)
  
  // Форма
  const [formData, setFormData] = useState<FormData>({
    clientId: "",
    productName: "",
    productSku: "",
    purchasePrice: 100000,
    months: 6,
    downPayment: 0,
    markupPercentFinal: 35,
    startDate: new Date().toISOString().split("T")[0],
  })

  // Предварительный расчёт
  const [calculation, setCalculation] = useState<ReturnType<typeof calculateDeal> | null>(null)
  const [calcError, setCalcError] = useState<string | null>(null)

  // Загрузка клиентов
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("/api/clients?limit=1000")
        const data = await response.json()
        if (data.success) {
          setClients(data.data)
        }
      } catch {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить список клиентов",
        })
      } finally {
        setLoadingClients(false)
      }
    }
    fetchClients()
  }, [toast])

  // Пересчёт наценки при смене срока
  useEffect(() => {
    const newMarkup = getMarkupPercent(formData.months)
    setFormData((prev) => ({
      ...prev,
      markupPercentFinal: newMarkup,
    }))
  }, [formData.months])

  // Пересчёт сделки при изменении параметров
  useEffect(() => {
    try {
      setCalcError(null)
      
      if (formData.purchasePrice <= 0) {
        setCalculation(null)
        return
      }

      const calc = calculateDeal({
        purchasePrice: formData.purchasePrice,
        months: formData.months,
        downPayment: formData.downPayment,
        startDate: new Date(formData.startDate),
        customMarkup: formData.months === 3 ? formData.markupPercentFinal : undefined,
      })
      
      setCalculation(calc)
    } catch (error) {
      setCalcError(error instanceof Error ? error.message : "Ошибка расчёта")
      setCalculation(null)
    }
  }, [formData.purchasePrice, formData.months, formData.downPayment, formData.startDate, formData.markupPercentFinal])

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.clientId) {
      toast({ variant: "destructive", title: "Ошибка", description: "Выберите клиента" })
      return
    }
    if (!formData.productName) {
      toast({ variant: "destructive", title: "Ошибка", description: "Введите название товара" })
      return
    }
    if (!calculation) {
      toast({ variant: "destructive", title: "Ошибка", description: "Ошибка расчёта сделки" })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          startDate: new Date(formData.startDate),
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Сделка создана",
          description: `Номер сделки: ${data.data.dealNumber}`,
        })
        router.push(`/admin/deals/${data.data.id}`)
      } else {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: data.error || "Не удалось создать сделку",
        })
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Ошибка при создании сделки",
      })
    } finally {
      setLoading(false)
    }
  }

  // Проверка редактируемости наценки
  const markupEditable = isMarkupEditable(formData.months)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Заголовок */}
      <div className="flex items-center gap-4">
        <Link href="/admin/deals">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Новая сделка</h1>
          <p className="text-muted-foreground">
            Заполните данные для создания сделки
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        {/* Левая колонка — Форма */}
        <div className="space-y-6">
          {/* Клиент */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Клиент</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                disabled={loadingClients}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите клиента" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.fullName} ({client.phone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Товар */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Товар</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Название товара *</Label>
                <Input
                  id="productName"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="iPhone 15 Pro Max 256GB"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productSku">Артикул</Label>
                <Input
                  id="productSku"
                  value={formData.productSku}
                  onChange={(e) => setFormData({ ...formData, productSku: e.target.value })}
                  placeholder="SKU-001"
                />
              </div>
            </CardContent>
          </Card>

          {/* Финансы */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Финансы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Цена закупа (₸) *</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  min="1000"
                  step="1000"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="months">Срок (месяцев) *</Label>
                  <Select
                    value={String(formData.months)}
                    onValueChange={(value) => setFormData({ ...formData, months: Number(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: MAX_MONTHS - MIN_MONTHS + 1 }, (_, i) => MIN_MONTHS + i).map((m) => (
                        <SelectItem key={m} value={String(m)}>
                          {m} мес — {getMarkupPercent(m)}%
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="markupPercentFinal">
                    Наценка (%) {!markupEditable && "(фикс.)"}
                  </Label>
                  <Input
                    id="markupPercentFinal"
                    type="number"
                    min={markupEditable ? MIN_MARKUP_3_MONTHS : formData.markupPercentFinal}
                    value={formData.markupPercentFinal}
                    onChange={(e) => setFormData({ ...formData, markupPercentFinal: Number(e.target.value) })}
                    disabled={!markupEditable}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="downPayment">Первоначальный взнос (₸)</Label>
                <Input
                  id="downPayment"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.downPayment}
                  onChange={(e) => setFormData({ ...formData, downPayment: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Дата выдачи *
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Кнопка создания */}
          <Button type="submit" className="w-full" disabled={loading || !calculation}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Создание...
              </>
            ) : (
              "Создать сделку"
            )}
          </Button>
        </div>

        {/* Правая колонка — Предварительный расчёт */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Предварительный расчёт
              </CardTitle>
            </CardHeader>
            <CardContent>
              {calcError ? (
                <div className="text-destructive text-sm">{calcError}</div>
              ) : calculation ? (
                <div className="space-y-4">
                  {/* Основные суммы */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Цена закупа</div>
                      <div className="text-lg font-medium">{formatMoney(calculation.purchasePrice)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Наценка</div>
                      <div className="text-lg font-medium">{calculation.markupPercentFinal}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Цена продажи</div>
                      <div className="text-lg font-bold text-primary">{formatMoney(calculation.salePrice)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Первый взнос</div>
                      <div className="text-lg font-medium">{formatMoney(calculation.downPayment)}</div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="text-sm text-muted-foreground">К выплате в рассрочку</div>
                    <div className="text-2xl font-bold">{formatMoney(calculation.amountToFinance)}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {calculation.months} платежей по ~{formatMoney(calculation.monthlyBasePayment)}
                    </div>
                  </div>

                  {/* Прибыль */}
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-sm text-green-600">Прибыль</div>
                    <div className="text-xl font-bold text-green-700">
                      {formatMoney(calculation.salePrice - calculation.purchasePrice)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">
                  Введите данные для расчёта
                </div>
              )}
            </CardContent>
          </Card>

          {/* График платежей */}
          {calculation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">График платежей</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-80 overflow-auto">
                  {calculation.installments.map((inst) => (
                    <div
                      key={inst.index}
                      className="flex justify-between items-center py-2 border-b last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-6">
                          #{inst.index}
                        </span>
                        <span>{formatDate(inst.dueDate)}</span>
                      </div>
                      <span className="font-medium">
                        {formatMoney(inst.amount)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between items-center font-bold">
                  <span>Итого:</span>
                  <span>{formatMoney(calculation.amountToFinance)}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </form>
    </div>
  )
}
