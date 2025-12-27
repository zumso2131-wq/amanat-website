"use client"

// ============================================
// КАЛЬКУЛЯТОР — /calculator
// ============================================

import { useState, useMemo } from "react"
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
import { ArrowLeft, Calculator, ArrowRight } from "lucide-react"
import { 
  calculateDeal, 
  formatMoney, 
  formatDate,
  getMarkupPercent, 
  isMarkupEditable,
  MIN_MONTHS,
  MAX_MONTHS,
  MIN_MARKUP_3_MONTHS 
} from "@/lib/calculations"

export default function CalculatorPage() {
  const [purchasePrice, setPurchasePrice] = useState(500000)
  const [months, setMonths] = useState(6)
  const [downPayment, setDownPayment] = useState(0)
  const [customMarkup, setCustomMarkup] = useState(15)
  // Расчёт (useMemo вместо useEffect для derived state)
  const { calculation, error } = useMemo(() => {
    try {
      if (purchasePrice <= 0) {
        return { calculation: null, error: null }
      }

      const calc = calculateDeal({
        purchasePrice,
        months,
        downPayment,
        startDate: new Date(),
        customMarkup: months === 3 ? customMarkup : undefined,
      })
      return { calculation: calc, error: null }
    } catch (e) {
      return { 
        calculation: null, 
        error: e instanceof Error ? e.message : "Ошибка расчёта" 
      }
    }
  }, [purchasePrice, months, downPayment, customMarkup])

  const markupEditable = isMarkupEditable(months)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-red-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">А</span>
            </div>
            <span className="font-bold text-xl">Аманат</span>
          </Link>
          <Link href="/apply">
            <Button className="bg-red-600 hover:bg-red-700">Оформить заявку</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          На главную
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <Calculator className="h-8 w-8 text-red-600" />
          <h1 className="text-4xl font-bold">Калькулятор рассрочки</h1>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Форма */}
          <Card>
            <CardHeader>
              <CardTitle>Параметры рассрочки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Цена товара */}
              <div className="space-y-2">
                <Label>Стоимость товара (₸)</Label>
                <Input
                  type="number"
                  min="10000"
                  step="10000"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                />
                <div className="flex gap-2">
                  {[100000, 300000, 500000, 1000000].map((v) => (
                    <Button 
                      key={v} 
                      variant="outline" 
                      size="sm"
                      onClick={() => setPurchasePrice(v)}
                    >
                      {formatMoney(v)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Срок */}
              <div className="space-y-2">
                <Label>Срок рассрочки</Label>
                <Select value={String(months)} onValueChange={(v) => setMonths(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: MAX_MONTHS - MIN_MONTHS + 1 }, (_, i) => MIN_MONTHS + i).map((m) => (
                      <SelectItem key={m} value={String(m)}>
                        {m} мес — наценка {getMarkupPercent(m)}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Наценка (для 3 мес) */}
              {markupEditable && (
                <div className="space-y-2">
                  <Label>Наценка (мин. {MIN_MARKUP_3_MONTHS}%)</Label>
                  <Input
                    type="number"
                    min={MIN_MARKUP_3_MONTHS}
                    value={customMarkup}
                    onChange={(e) => setCustomMarkup(Number(e.target.value))}
                  />
                </div>
              )}

              {/* Первый взнос */}
              <div className="space-y-2">
                <Label>Первоначальный взнос (₸)</Label>
                <Input
                  type="number"
                  min="0"
                  step="10000"
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                />
                <div className="flex gap-2">
                  {[0, 50000, 100000, 200000].map((v) => (
                    <Button 
                      key={v} 
                      variant="outline" 
                      size="sm"
                      onClick={() => setDownPayment(v)}
                    >
                      {v === 0 ? "Без взноса" : formatMoney(v)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Результат */}
          <div className="space-y-6">
            {error ? (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6 text-red-600">
                  {error}
                </CardContent>
              </Card>
            ) : calculation ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Результат расчёта</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Цена товара</div>
                        <div className="text-xl font-medium">{formatMoney(calculation.purchasePrice)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Наценка</div>
                        <div className="text-xl font-medium">{calculation.markupPercentFinal}%</div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="text-sm text-muted-foreground">Цена с наценкой</div>
                      <div className="text-3xl font-bold text-red-600">{formatMoney(calculation.salePrice)}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Первый взнос</div>
                        <div className="text-xl font-medium">{formatMoney(calculation.downPayment)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">К выплате</div>
                        <div className="text-xl font-bold">{formatMoney(calculation.amountToFinance)}</div>
                      </div>
                    </div>

                    <div className="bg-red-50 rounded-lg p-4 text-center">
                      <div className="text-sm text-muted-foreground mb-1">Ежемесячный платёж</div>
                      <div className="text-4xl font-bold text-red-600">
                        ~{formatMoney(calculation.monthlyBasePayment)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {calculation.months} платежей
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* График */}
                <Card>
                  <CardHeader>
                    <CardTitle>Примерный график платежей</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-64 overflow-auto">
                      {calculation.installments.map((inst) => (
                        <div 
                          key={inst.index}
                          className="flex justify-between items-center py-2 border-b last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground w-8">
                              #{inst.index}
                            </span>
                            <span>{formatDate(inst.dueDate)}</span>
                          </div>
                          <span className="font-medium">{formatMoney(inst.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* CTA */}
                <Link href="/apply">
                  <Button size="lg" className="w-full bg-red-600 hover:bg-red-700">
                    Оформить заявку
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Введите параметры для расчёта
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
