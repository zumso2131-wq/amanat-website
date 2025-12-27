import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-700">Аманат</h1>
          <nav className="flex gap-4">
            <Link href="/usloviya" className="text-gray-700 hover:text-green-700">Условия</Link>
            <Link href="/catalog" className="text-gray-700 hover:text-green-700">Каталог</Link>
            <Link href="/calculator" className="text-gray-700 hover:text-green-700">Калькулятор</Link>
            <Link href="/faq" className="text-gray-700 hover:text-green-700">FAQ</Link>
            <Link href="/contacts" className="text-gray-700 hover:text-green-700">Контакты</Link>
            <Link href="/login">
              <Button variant="outline">Войти</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Добро пожаловать в Аманат
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Оформите рассрочку на электронику и бытовую технику с минимальными условиями!
          </p>
          <Link href="/apply">
            <Button size="lg" className="text-lg px-8">
              Оставить заявку
            </Button>
          </Link>
        </section>

        <section className="grid md:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Быстрое оформление</CardTitle>
              <CardDescription>Минимум документов, максимум удобства</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Оформите рассрочку всего за несколько минут. Только паспорт и телефон.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Гибкие условия</CardTitle>
              <CardDescription>От 3 до 12 месяцев рассрочки</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Выберите удобный срок и сумму первоначального взноса.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Прозрачные условия</CardTitle>
              <CardDescription>Без скрытых платежей</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Все условия рассрочки указаны заранее. Никаких сюрпризов.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t bg-white mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; 2024 Аманат. Все права защищены.</p>
        </div>
      </footer>
    </div>
  )
}
