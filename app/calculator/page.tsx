"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { calculateDeal, isMarkupEditable } from "@/lib/calculations"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

export default function CalculatorPage() {
  const { toast } = useToast()
  const [purchasePrice, setPurchasePrice] = useState("")
  const [months, setMonths] = useState("6")
  const [markupPercent, setMarkupPercent] = useState("")
  const [downPayment, setDownPayment] = useState("0")
  const [result, setResult] = useState<ReturnType<typeof calculateDeal> | null>(null)

  const handleCalculate = () => {
    try {
      const purchase = parseFloat(purchasePrice)
      const monthsNum = parseInt(months)
      const down = parseFloat(downPayment || "0")
      const markup = markupPercent ? parseFloat(markupPercent) : undefined

      if (!purchase || purchase <= 0) {
        toast({
          title: "Ошибка",
          description: "Введите корректную цену закупки",
          variant: "destructive",
        })
        return
      }

      const calcResult = calculateDeal({
        purchasePrice: purchase,
        months: monthsNum,
        markupPercentFinal: markup,
        downPayment: down,
      })

      setResult(calcResult)
    } catch (error: any) {
      toast({
        title: "Ошибка расчёта",
        description: error.message || "Проверьте введённые данные",
        variant: "destructive",
      })
    }
  }

  const markupEditable = months ? isMarkupEditable(parseInt(months)) : false

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8">Калькулятор рассрочки</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Параметры рассрочки</CardTitle>
            <CardDescription>Введите данные для расчёта</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Цена закупки (₽)</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="100000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="months">Срок (месяцев)</Label>
                <Input
                  id="months"
                  type="number"
                  min="3"
                  max="12"
                  value={months}
                  onChange={(e) => {
                    setMonths(e.target.value)
                    setMarkupPercent("")
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="markupPercent">
                  Наценка (%) {!markupEditable && "(автоматически)"}
                </Label>
                <Input
                  id="markupPercent"
                  type="number"
                  value={markupPercent}
                  onChange={(e) => setMarkupPercent(e.target.value)}
                  disabled={!markupEditable}
                  placeholder={markupEditable ? "15" : "Автоматически"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="downPayment">Первоначальный взнос (₽)</Label>
                <Input
                  id="downPayment"
                  type="number"
                  value={downPayment}
                  onChange={(e) => setDownPayment(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            <Button onClick={handleCalculate} className="w-full">
              Рассчитать
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Результат расчёта</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Цена закупки</p>
                  <p className="text-xl font-bold">{formatCurrency(Number(result.purchasePrice))}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Наценка</p>
                  <p className="text-xl font-bold">{result.markupPercentFinal}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Цена продажи</p>
                  <p className="text-xl font-bold text-green-700">{formatCurrency(result.salePrice)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Первоначальный взнос</p>
                  <p className="text-xl font-bold">{formatCurrency(result.downPayment)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Сумма к выплате</p>
                  <p className="text-xl font-bold">{formatCurrency(result.amountToFinance)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Платёж в месяц</p>
                  <p className="text-xl font-bold">{formatCurrency(result.monthlyBasePayment)}</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">График платежей</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">№</th>
                        <th className="p-2 text-right">Сумма</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.installments.map((inst) => (
                        <tr key={inst.index} className="border-t">
                          <td className="p-2">{inst.index}</td>
                          <td className="p-2 text-right font-medium">
                            {formatCurrency(inst.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
