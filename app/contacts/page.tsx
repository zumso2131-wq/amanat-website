import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8">Контакты</h1>

        <Card>
          <CardHeader>
            <CardTitle>Наши контакты</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold">Телефон:</p>
              <p className="text-gray-700">+7 (999) 123-45-67</p>
            </div>
            <div>
              <p className="font-semibold">Email:</p>
              <p className="text-gray-700">info@amanat.ru</p>
            </div>
            <div>
              <p className="font-semibold">Адрес:</p>
              <p className="text-gray-700">г. Москва, ул. Примерная, д. 1</p>
            </div>
            <div>
              <p className="font-semibold">Режим работы:</p>
              <p className="text-gray-700">Пн-Пт: 9:00 - 18:00</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
