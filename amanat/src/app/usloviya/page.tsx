import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, CheckCircle, Info } from "lucide-react"
import { getMonthOptions, formatMoney } from "@/lib/calculations"

export default function UsloviyaPage() {
  const monthOptions = getMonthOptions()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-primary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-4">Условия рассрочки</h1>
              <p className="text-xl text-muted-foreground">
                Прозрачные условия без скрытых платежей. Выбирайте удобный срок и платите частями.
              </p>
            </div>
          </div>
        </section>

        {/* Markup Table */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Таблица наценок по срокам
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Срок рассрочки</TableHead>
                      <TableHead>Наценка</TableHead>
                      <TableHead>Пример (товар 100 000 ₸)</TableHead>
                      <TableHead>Ежемесячный платёж</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthOptions.map((opt) => {
                      const examplePrice = 100000
                      const salePrice = Math.round(examplePrice * (1 + opt.markup / 100))
                      const monthlyPayment = Math.floor(salePrice / opt.months)
                      return (
                        <TableRow key={opt.months}>
                          <TableCell className="font-medium">
                            {opt.months} {opt.months === 3 ? 'месяца' : opt.months < 5 ? 'месяца' : 'месяцев'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={opt.months <= 5 ? "success" : opt.months <= 8 ? "warning" : "secondary"}>
                              {opt.markup}%
                            </Badge>
                            {opt.editable && (
                              <span className="text-xs text-muted-foreground ml-2">(мин.)</span>
                            )}
                          </TableCell>
                          <TableCell>{formatMoney(salePrice)}</TableCell>
                          <TableCell>{formatMoney(monthlyPayment)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Requirements */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Требования к клиенту</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Необходимые документы</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "Удостоверение личности (паспорт)",
                    "ИИН (индивидуальный идентификационный номер)",
                    "Контактный номер телефона"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Условия одобрения</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "Возраст от 18 лет",
                    "Гражданство Казахстана",
                    "Постоянный источник дохода",
                    "Отсутствие просрочек в кредитной истории"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Payment Rules */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Правила оплаты</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Первоначальный взнос</h3>
                  <p className="text-sm text-muted-foreground">
                    Первоначальный взнос от 0% до 50% от стоимости товара. 
                    Чем больше взнос, тем меньше ежемесячный платёж.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">График платежей</h3>
                  <p className="text-sm text-muted-foreground">
                    Платежи вносятся ежемесячно, каждые 30 дней с даты получения товара. 
                    График фиксируется при оформлении сделки.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Способы оплаты</h3>
                  <p className="text-sm text-muted-foreground">
                    Оплата наличными в офисе, переводом на карту или банковским переводом. 
                    Квитанция выдаётся после каждой оплаты.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Готовы оформить?</h2>
            <p className="text-lg mb-8 opacity-90">
              Рассчитайте платёж на калькуляторе или оставьте заявку
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/calculator">
                  Рассчитать платёж
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white hover:bg-white/10" asChild>
                <Link href="/apply">
                  Оставить заявку
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
