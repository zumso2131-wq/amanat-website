import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SupportPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Поддержка</h1>

      <Card>
        <CardHeader>
          <CardTitle>Контакты поддержки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-semibold">Телефон:</p>
            <p className="text-gray-700">+7 (999) 123-45-67</p>
          </div>
          <div>
            <p className="font-semibold">Email:</p>
            <p className="text-gray-700">support@amanat.ru</p>
          </div>
          <div>
            <p className="font-semibold">Режим работы:</p>
            <p className="text-gray-700">Пн-Пт: 9:00 - 18:00</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
