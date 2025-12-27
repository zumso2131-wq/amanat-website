import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function UsloviyaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8">Условия рассрочки</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Срок рассрочки</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Рассрочка предоставляется на срок от 3 до 12 месяцев.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Наценка</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>3 месяца: от 15%</li>
                <li>5 месяцев: 25%</li>
                <li>6 месяцев: 35%</li>
                <li>7-12 месяцев: от 40% до 65%</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Первоначальный взнос</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Первоначальный взнос не обязателен. Вы можете начать выплаты сразу после получения товара.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Документы</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Для оформления рассрочки необходим только паспорт и контактный телефон.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
