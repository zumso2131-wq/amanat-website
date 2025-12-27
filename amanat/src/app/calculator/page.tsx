"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ArrowRight, Calculator, Info } from "lucide-react"
import { 
  calculateDeal, 
  formatMoney, 
  formatDate,
  getMarkupInfo,
  MIN_MONTHS,
  MAX_MONTHS,
  MIN_MARKUP_3_MONTHS
} from "@/lib/calculations"
import type { DealCalculation } from "@/types"

export default function CalculatorPage() {
  const [purchasePrice, setPurchasePrice] = useState<number>(100000)
  const [months, setMonths] = useState<number>(6)
  const [downPayment, setDownPayment] = useState<number>(0)
  const [customMarkup, setCustomMarkup] = useState<number>(MIN_MARKUP_3_MONTHS)
  const [calculation, setCalculation] = useState<DealCalculation | null>(null)
  const [error, setError] = useState<string | null>(null)

  const markupInfo = getMarkupInfo(months)

  useEffect(() => {
    try {
      setError(null)
      const result = calculateDeal({
        purchasePrice,
        months,
        downPayment,
        startDate: new Date(),
        customMarkup: months === 3 ? customMarkup : undefined,
      })
      setCalculation(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка расчёта")
      setCalculation(null)
    }
  }, [purchasePrice, months, downPayment, customMarkup])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Калькулятор рассрочки</h1>
              <p className="text-xl text-muted-foreground">
                Рассчитайте ежемесячный платёж и полную стоимость товара в рассрочку
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Параметры рассрочки
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Стоимость товара (₸)</Label>
                    <Input
                      id="price"
                      type="number"
                      min={1000}
                      step={1000}
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="months">Срок рассрочки</Label>
                    <Select 
                      value={months.toString()} 
                      onValueChange={(v) => setMonths(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: MAX_MONTHS - MIN_MONTHS + 1 }, (_, i) => i + MIN_MONTHS).map((m) => (
                          <SelectItem key={m} value={m.toString()}>
                            {m} {m === 3 || m === 4 ? 'месяца' : 'месяцев'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="markup">
                      {markupInfo.label}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="markup"
                        type="number"
                        min={markupInfo.min}
                        value={markupInfo.editable ? customMarkup : markupInfo.value}
                        onChange={(e) => setCustomMarkup(Number(e.target.value))}
                        disabled={!markupInfo.editable}
                        className="flex-1"
                      />
                      <span className="text-muted-foreground">%</span>
                    </div>
                    {!markupInfo.editable && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        Фиксированная наценка для выбранного срока
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="downPayment">Первоначальный взнос (₸)</Label>
                    <Input
                      id="downPayment"
                      type="number"
                      min={0}
                      step={1000}
                      value={downPayment}
                      onChange={(e) => setDownPayment(Number(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Можно 0 — без первоначального взноса
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                      {error}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Результат расчёта</CardTitle>
                </CardHeader>
                <CardContent>
                  {calculation ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Цена закупа</p>
                          <p className="text-xl font-bold">{formatMoney(calculation.purchasePrice)}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Наценка</p>
                          <p className="text-xl font-bold">{calculation.markupPercentFinal}%</p>
                        </div>
                        <div className="p-4 bg-primary/10 rounded-lg">
                          <p className="text-sm text-muted-foreground">Цена продажи</p>
                          <p className="text-xl font-bold text-primary">{formatMoney(calculation.salePrice)}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Первоначальный взнос</p>
                          <p className="text-xl font-bold">{formatMoney(calculation.downPayment)}</p>
                        </div>
                      </div>

                      <Separator />

                      <div className="p-6 bg-primary text-primary-foreground rounded-lg text-center">
                        <p className="text-sm opacity-80">Ежемесячный платёж</p>
                        <p className="text-4xl font-bold">{formatMoney(calculation.monthlyBasePayment)}</p>
                        <p className="text-sm opacity-80 mt-1">
                          в течение {calculation.months} месяцев
                        </p>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Сумма к выплате:</span>
                          <span className="font-medium">{formatMoney(calculation.amountToFinance)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Переплата:</span>
                          <span className="font-medium">
                            {formatMoney(calculation.salePrice - calculation.purchasePrice)}
                          </span>
                        </div>
                        {calculation.lastPaymentAdjustment > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Последний платёж:</span>
                            <span className="font-medium">
                              {formatMoney(calculation.monthlyBasePayment + calculation.lastPaymentAdjustment)}
                            </span>
                          </div>
                        )}
                      </div>

                      <Button className="w-full" size="lg" asChild>
                        <Link href="/apply">
                          Оформить рассрочку
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-12">
                      Введите параметры для расчёта
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Payment Schedule */}
            {calculation && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Примерный график платежей</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">№</TableHead>
                        <TableHead>Дата платежа</TableHead>
                        <TableHead className="text-right">Сумма</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {calculation.installments.map((inst) => (
                        <TableRow key={inst.index}>
                          <TableCell className="font-medium">{inst.index}</TableCell>
                          <TableCell>{formatDate(inst.dueDate)}</TableCell>
                          <TableCell className="text-right font-medium">{formatMoney(inst.amount)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={2} className="font-bold">Итого к выплате</TableCell>
                        <TableCell className="text-right font-bold">
                          {formatMoney(calculation.amountToFinance)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
