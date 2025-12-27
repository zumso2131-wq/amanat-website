import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function FAQPage() {
  const faqs = [
    {
      question: "Как оформить рассрочку?",
      answer: "Заполните заявку на сайте или обратитесь в наш офис с паспортом.",
    },
    {
      question: "Какие документы нужны?",
      answer: "Только паспорт и контактный телефон.",
    },
    {
      question: "Можно ли досрочно погасить рассрочку?",
      answer: "Да, вы можете погасить рассрочку досрочно без дополнительных комиссий.",
    },
    {
      question: "Что делать при просрочке платежа?",
      answer: "Свяжитесь с нами как можно скорее для решения вопроса.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8">Часто задаваемые вопросы</h1>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
