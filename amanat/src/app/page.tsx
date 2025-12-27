// ============================================
// ГЛАВНАЯ СТРАНИЦА — /
// ============================================

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Smartphone, 
  Laptop, 
  Watch, 
  Gamepad2, 
  ShieldCheck, 
  Clock, 
  Calculator, 
  FileText,
  ArrowRight,
  CheckCircle
} from "lucide-react"

const categories = [
  { icon: Smartphone, name: "Смартфоны", href: "/catalog?category=smartphones" },
  { icon: Laptop, name: "Ноутбуки", href: "/catalog?category=laptops" },
  { icon: Watch, name: "Умные часы", href: "/catalog?category=watches" },
  { icon: Gamepad2, name: "Игровые консоли", href: "/catalog?category=gaming" },
]

const features = [
  { icon: ShieldCheck, title: "Без скрытых платежей", desc: "Прозрачные условия" },
  { icon: Clock, title: "До 12 месяцев", desc: "Удобный срок рассрочки" },
  { icon: Calculator, title: "Онлайн расчёт", desc: "Узнайте сумму сразу" },
  { icon: FileText, title: "Быстрое оформление", desc: "За 15 минут" },
]

const steps = [
  { num: "1", title: "Выберите товар", desc: "В каталоге или магазине партнёра" },
  { num: "2", title: "Оставьте заявку", desc: "Онлайн или по телефону" },
  { num: "3", title: "Получите товар", desc: "После одобрения и первого взноса" },
  { num: "4", title: "Платите частями", desc: "По удобному графику" },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-red-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">А</span>
            </div>
            <span className="font-bold text-xl">Аманат</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/usloviya" className="text-sm hover:text-red-600 transition">Условия</Link>
            <Link href="/catalog" className="text-sm hover:text-red-600 transition">Каталог</Link>
            <Link href="/calculator" className="text-sm hover:text-red-600 transition">Калькулятор</Link>
            <Link href="/faq" className="text-sm hover:text-red-600 transition">FAQ</Link>
            <Link href="/contacts" className="text-sm hover:text-red-600 transition">Контакты</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline">Кабинет</Button>
            </Link>
            <Link href="/apply">
              <Button className="bg-red-600 hover:bg-red-700">Оформить заявку</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-red-600 to-red-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-6">
              Рассрочка на технику <br />без переплат*
            </h1>
            <p className="text-xl mb-8 text-red-100">
              Получите любой товар сейчас и платите частями до 12 месяцев. 
              Быстрое одобрение за 15 минут.
            </p>
            <div className="flex gap-4">
              <Link href="/apply">
                <Button size="lg" className="bg-white text-red-600 hover:bg-red-50">
                  Оформить заявку
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/calculator">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Рассчитать
                </Button>
              </Link>
            </div>
            <p className="text-sm mt-6 text-red-200">
              *Наценка от 15% за 3 месяца. Подробнее в условиях.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-4 gap-6">
            {features.map((f, i) => (
              <Card key={i} className="text-center">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <f.icon className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="font-bold mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Популярные категории</h2>
          <div className="grid grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <Link key={i} href={cat.href}>
                <Card className="hover:shadow-lg transition cursor-pointer group">
                  <CardContent className="pt-8 pb-8 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-gray-100 group-hover:bg-red-100 flex items-center justify-center mx-auto mb-4 transition">
                      <cat.icon className="h-8 w-8 text-gray-600 group-hover:text-red-600 transition" />
                    </div>
                    <h3 className="font-medium">{cat.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Как это работает</h2>
          <div className="grid grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="h-14 w-14 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  {step.num}
                </div>
                <h3 className="font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-red-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Готовы оформить рассрочку?</h2>
          <p className="text-xl mb-8 text-red-100">
            Оставьте заявку и получите ответ в течение 15 минут
          </p>
          <Link href="/apply">
            <Button size="lg" className="bg-white text-red-600 hover:bg-red-50">
              Оформить заявку
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-lg bg-red-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">А</span>
                </div>
                <span className="font-bold text-xl">Аманат</span>
              </div>
              <p className="text-sm text-gray-400">
                Рассрочка на технику без скрытых платежей
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Информация</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/usloviya" className="hover:text-white">Условия рассрочки</Link></li>
                <li><Link href="/faq" className="hover:text-white">Вопросы и ответы</Link></li>
                <li><Link href="/contacts" className="hover:text-white">Контакты</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Покупателям</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/catalog" className="hover:text-white">Каталог</Link></li>
                <li><Link href="/calculator" className="hover:text-white">Калькулятор</Link></li>
                <li><Link href="/apply" className="hover:text-white">Оформить заявку</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Контакты</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>+7 (700) 123-45-67</li>
                <li>info@amanat.kz</li>
                <li>г. Алматы, ул. Абая, 1</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            © 2024 Аманат. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  )
}
