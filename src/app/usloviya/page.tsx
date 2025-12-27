// ============================================
// УСЛОВИЯ РАССРОЧКИ — /usloviya
// ============================================

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"

const markupTable = [
  { months: 3, markup: "от 15%", note: "Наценка редактируемая (мин. 15%)" },
  { months: 4, markup: "20%", note: "Фиксированная" },
  { months: 5, markup: "25%", note: "Фиксированная" },
  { months: 6, markup: "35%", note: "Фиксированная" },
  { months: 7, markup: "40%", note: "Формула: 35 + (7-6)×5" },
  { months: 8, markup: "45%", note: "Формула: 35 + (8-6)×5" },
  { months: 9, markup: "50%", note: "Формула: 35 + (9-6)×5" },
  { months: 10, markup: "55%", note: "Формула: 35 + (10-6)×5" },
  { months: 11, markup: "60%", note: "Формула: 35 + (11-6)×5" },
  { months: 12, markup: "65%", note: "Формула: 35 + (12-6)×5" },
]

const requirements = [
  "Возраст от 18 лет",
  "Гражданство РК",
  "Удостоверение личности",
  "Постоянный источник дохода",
  "Номер телефона",
]

const included = [
  "Прозрачные условия без скрытых платежей",
  "Фиксированный график платежей",
  "Возможность досрочного погашения",
  "Личный кабинет для отслеживания",
  "Напоминания о платежах",
]

export default function UsloviyaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-[#27ae60] flex items-center justify-center">
              <span className="text-white font-bold text-xl">А</span>
            </div>
            <span className="font-bold text-xl">Аманат</span>
          </Link>
          <Link href="/apply">
            <Button className="bg-[#27ae60] hover:bg-[#2ecc71]">Оформить заявку</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          На главную
        </Link>

        <h1 className="text-4xl font-bold mb-8">Условия рассрочки</h1>

        {/* Таблица наценок */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Наценки по срокам</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Срок рассрочки</TableHead>
                  <TableHead>Наценка</TableHead>
                  <TableHead>Примечание</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {markupTable.map((row) => (
                  <TableRow key={row.months}>
                    <TableCell className="font-medium">{row.months} месяцев</TableCell>
                    <TableCell className="font-bold text-[#27ae60]">{row.markup}</TableCell>
                    <TableCell className="text-muted-foreground">{row.note}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-8">
          {/* Требования */}
          <Card>
            <CardHeader>
              <CardTitle>Требования к клиенту</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {requirements.map((req, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Что включено */}
          <Card>
            <CardHeader>
              <CardTitle>Что включено</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {included.map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Пример расчёта */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Пример расчёта</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="mb-4">
                <strong>Товар:</strong> iPhone 15 Pro Max 256GB<br />
                <strong>Цена:</strong> 650 000 ₸<br />
                <strong>Срок:</strong> 6 месяцев<br />
                <strong>Наценка:</strong> 35%
              </p>
              <div className="border-t pt-4">
                <p><strong>Цена продажи:</strong> 650 000 × 1.35 = <span className="text-[#27ae60] font-bold">877 500 ₸</span></p>
                <p><strong>Первый взнос:</strong> 100 000 ₸</p>
                <p><strong>К выплате:</strong> 877 500 - 100 000 = <span className="font-bold">777 500 ₸</span></p>
                <p><strong>Ежемесячный платёж:</strong> 777 500 ÷ 6 ≈ <span className="text-[#27ae60] font-bold">129 583 ₸</span></p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Важно знать */}
        <Card className="mt-8 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Важно знать
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Первоначальный взнос может быть от 0 до суммы товара</li>
              <li>• График платежей фиксируется при оформлении и не меняется</li>
              <li>• При просрочке более 30 дней возможно досрочное истребование</li>
              <li>• Право собственности переходит после полной оплаты</li>
            </ul>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-lg mb-4">Готовы оформить рассрочку?</p>
          <div className="flex justify-center gap-4">
            <Link href="/calculator">
              <Button variant="outline" size="lg">Рассчитать</Button>
            </Link>
            <Link href="/apply">
              <Button size="lg" className="bg-[#27ae60] hover:bg-[#2ecc71]">Оформить заявку</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
