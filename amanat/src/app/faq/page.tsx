// ============================================
// FAQ — /faq
// ============================================

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, HelpCircle } from "lucide-react"

const faqs = [
  {
    q: "Как оформить рассрочку?",
    a: "Выберите товар в каталоге или магазине партнёра, оставьте заявку онлайн или по телефону. После одобрения внесите первый взнос (если требуется) и получите товар."
  },
  {
    q: "Какие документы нужны?",
    a: "Для оформления рассрочки нужно только удостоверение личности гражданина РК. Дополнительные документы не требуются."
  },
  {
    q: "Какая наценка?",
    a: "Наценка зависит от срока рассрочки: от 15% за 3 месяца до 65% за 12 месяцев. Точные условия указаны в разделе «Условия»."
  },
  {
    q: "Нужен ли первоначальный взнос?",
    a: "Первоначальный взнос не обязателен. Вы можете оформить рассрочку без взноса или внести любую сумму для уменьшения ежемесячных платежей."
  },
  {
    q: "Как производить платежи?",
    a: "Платежи можно вносить наличными в офисе, картой, банковским переводом. Напоминания о платежах приходят за 3 дня до даты."
  },
  {
    q: "Что будет при просрочке?",
    a: "При просрочке более 30 дней мы свяжемся для обсуждения ситуации. Возможно досрочное истребование товара или реструктуризация долга."
  },
  {
    q: "Можно ли погасить досрочно?",
    a: "Да, досрочное погашение возможно без штрафов и комиссий. Обратитесь в офис или личный кабинет."
  },
  {
    q: "Когда товар станет моим?",
    a: "Право собственности на товар переходит к вам после полной оплаты всей суммы рассрочки."
  },
  {
    q: "Есть ли личный кабинет?",
    a: "Да, в личном кабинете вы можете отслеживать свои сделки, график платежей, скачивать документы и видеть историю платежей."
  },
  {
    q: "Как связаться с поддержкой?",
    a: "Позвоните по номеру +7 (700) 123-45-67 или напишите на info@amanat.kz. Мы работаем с 9:00 до 20:00 без выходных."
  },
]

export default function FaqPage() {
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

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          На главную
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <HelpCircle className="h-8 w-8 text-red-600" />
          <h1 className="text-4xl font-bold">Вопросы и ответы</h1>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-start gap-3">
                  <span className="text-red-600 font-bold">{i + 1}.</span>
                  {faq.q}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <Card className="mt-12 bg-red-50 border-red-100">
          <CardContent className="pt-6 text-center">
            <h3 className="font-bold text-lg mb-2">Не нашли ответ?</h3>
            <p className="text-muted-foreground mb-4">
              Свяжитесь с нами, и мы ответим на все ваши вопросы
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/contacts">
                <Button variant="outline">Контакты</Button>
              </Link>
              <Link href="/apply">
                <Button className="bg-red-600 hover:bg-red-700">Оформить заявку</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
