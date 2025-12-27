import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MessageSquare } from "lucide-react"

const faqItems = [
  {
    question: "Что такое рассрочка от Аманат?",
    answer: "Аманат — это система рассрочки на товары без банковского кредита. Вы покупаете товар напрямую у нас с наценкой, которая зависит от срока рассрочки (от 15% до 65%), и платите частями каждый месяц. Никаких скрытых комиссий и процентов."
  },
  {
    question: "Какие документы нужны для оформления?",
    answer: "Для оформления рассрочки вам понадобится только удостоверение личности (паспорт) и ИИН. Также потребуется контактный номер телефона для связи."
  },
  {
    question: "На какой срок можно оформить рассрочку?",
    answer: "Срок рассрочки от 3 до 12 месяцев. Чем больше срок, тем выше наценка: 3 месяца — от 15%, 5 месяцев — 25%, 6 месяцев — 35%, и так далее до 65% за 12 месяцев."
  },
  {
    question: "Нужен ли первоначальный взнос?",
    answer: "Первоначальный взнос не обязателен — можно оформить рассрочку с взносом от 0%. Однако чем больше первоначальный взнос, тем меньше будет ежемесячный платёж."
  },
  {
    question: "Как рассчитывается ежемесячный платёж?",
    answer: "Ежемесячный платёж = (Цена продажи - Первоначальный взнос) / Количество месяцев. Цена продажи = Цена закупа × (1 + Наценка%). Все расчёты можно сделать на нашем калькуляторе."
  },
  {
    question: "Когда нужно вносить платежи?",
    answer: "Платежи вносятся каждые 30 дней с даты получения товара. Например, если вы получили товар 1 января, первый платёж — до 31 января, второй — до 2 марта и т.д."
  },
  {
    question: "Какие способы оплаты доступны?",
    answer: "Вы можете оплачивать рассрочку наличными в нашем офисе, переводом на карту или банковским переводом. После каждой оплаты выдаётся квитанция."
  },
  {
    question: "Что будет, если просрочить платёж?",
    answer: "При просрочке платежа мы свяжемся с вами для уточнения ситуации. Рекомендуем вносить платежи вовремя, чтобы избежать начисления штрафов и сохранить хорошую репутацию для будущих покупок."
  },
  {
    question: "Можно ли погасить рассрочку досрочно?",
    answer: "Да, вы можете погасить рассрочку досрочно без каких-либо штрафов. При досрочном погашении вы платите оставшуюся сумму по графику без пересчёта наценки."
  },
  {
    question: "Какие товары можно купить в рассрочку?",
    answer: "В рассрочку можно приобрести любую технику и товары: смартфоны, ноутбуки, телевизоры, бытовую технику и многое другое. Вы также можете принести свой товар из другого магазина."
  },
  {
    question: "Как быстро оформляется рассрочка?",
    answer: "Оформление занимает около 15 минут. Вы приходите с документами, мы проверяем данные, подписываем договор — и вы получаете товар."
  },
  {
    question: "Могу ли я отслеживать свои платежи онлайн?",
    answer: "Да, после оформления рассрочки вы получаете доступ в личный кабинет, где можете видеть график платежей, историю оплат и скачивать документы."
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-primary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-4">Частые вопросы</h1>
              <p className="text-xl text-muted-foreground">
                Ответы на самые популярные вопросы о рассрочке
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faqItems.map((item, idx) => (
                  <AccordionItem key={idx} value={`item-${idx}`} className="border rounded-lg px-6">
                    <AccordionTrigger className="text-left hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Не нашли ответ на свой вопрос?</h2>
            <p className="text-muted-foreground mb-8">
              Свяжитесь с нами, и мы с радостью ответим на все ваши вопросы
            </p>
            <Button asChild>
              <Link href="/contacts">
                <MessageSquare className="mr-2 h-4 w-4" />
                Связаться с нами
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
