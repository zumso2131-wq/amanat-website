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
  Phone,
  Mail,
  MapPin
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
            <div className="h-10 w-10 rounded-lg bg-[#2c3e50] flex items-center justify-center">
              <span className="text-white font-bold text-xl">А</span>
            </div>
            <span className="font-bold text-xl text-[#2c3e50]">AMANAT</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/usloviya" className="text-sm text-gray-600 hover:text-[#27ae60] transition">Условия</Link>
            <Link href="/catalog" className="text-sm text-gray-600 hover:text-[#27ae60] transition">Каталог</Link>
            <Link href="/calculator" className="text-sm text-gray-600 hover:text-[#27ae60] transition">Калькулятор</Link>
            <Link href="/faq" className="text-sm text-gray-600 hover:text-[#27ae60] transition">FAQ</Link>
            <Link href="/contacts" className="text-sm text-gray-600 hover:text-[#27ae60] transition">Контакты</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" className="border-[#2c3e50] text-[#2c3e50] hover:bg-[#2c3e50] hover:text-white">
                Кабинет
              </Button>
            </Link>
            <Link href="/apply">
              <Button className="bg-[#27ae60] hover:bg-[#2ecc71] text-white">
                Оформить заявку
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - оригинальный дизайн */}
      <section className="bg-[#2c3e50] text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 animate-fade-in">
            Добро пожаловать в AMANAT
          </h1>
          <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
            Оформите рассрочку на электронику и бытовую технику с минимальными условиями!
            Быстрое одобрение за 15 минут.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/apply">
              <Button size="lg" className="bg-[#27ae60] hover:bg-[#2ecc71] text-white px-8">
                Оформить заявку
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/calculator">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#2c3e50]">
                Калькулятор
              </Button>
            </Link>
          </div>
          <p className="text-sm mt-8 text-gray-400">
            *Наценка от 15% за 3 месяца. Подробнее в условиях.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <Card key={i} className="text-center border-0 shadow-md hover:shadow-lg transition">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-full bg-[#27ae60]/10 flex items-center justify-center mx-auto mb-4">
                    <f.icon className="h-6 w-6 text-[#27ae60]" />
                  </div>
                  <h3 className="font-bold mb-1 text-[#2c3e50]">{f.title}</h3>
                  <p className="text-sm text-gray-500">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-[#2c3e50]">Популярные категории</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <Link key={i} href={cat.href}>
                <Card className="hover:shadow-lg transition cursor-pointer group border-0 shadow-md">
                  <CardContent className="pt-8 pb-8 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-gray-100 group-hover:bg-[#27ae60]/10 flex items-center justify-center mx-auto mb-4 transition">
                      <cat.icon className="h-8 w-8 text-gray-500 group-hover:text-[#27ae60] transition" />
                    </div>
                    <h3 className="font-medium text-[#2c3e50]">{cat.name}</h3>
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
          <h2 className="text-3xl font-bold mb-12 text-center text-[#2c3e50]">Как это работает</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="h-14 w-14 rounded-full bg-[#27ae60] text-white flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  {step.num}
                </div>
                <h3 className="font-bold mb-2 text-[#2c3e50]">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#27ae60] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Готовы оформить рассрочку?</h2>
          <p className="text-xl mb-8 text-green-100">
            Оставьте заявку и получите ответ в течение 15 минут
          </p>
          <Link href="/apply">
            <Button size="lg" className="bg-white text-[#27ae60] hover:bg-gray-100">
              Оформить заявку
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2c3e50] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-lg bg-[#27ae60] flex items-center justify-center">
                  <span className="text-white font-bold text-xl">А</span>
                </div>
                <span className="font-bold text-xl">AMANAT</span>
              </div>
              <p className="text-sm text-gray-400">
                Рассрочка на технику без скрытых платежей
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Информация</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/usloviya" className="hover:text-[#27ae60] transition">Условия рассрочки</Link></li>
                <li><Link href="/faq" className="hover:text-[#27ae60] transition">Вопросы и ответы</Link></li>
                <li><Link href="/contacts" className="hover:text-[#27ae60] transition">Контакты</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Покупателям</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/catalog" className="hover:text-[#27ae60] transition">Каталог</Link></li>
                <li><Link href="/calculator" className="hover:text-[#27ae60] transition">Калькулятор</Link></li>
                <li><Link href="/apply" className="hover:text-[#27ae60] transition">Оформить заявку</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Контакты</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  +7 (700) 123-45-67
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  info@amanat.kz
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  г. Алматы, ул. Абая, 1
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-500">
            © 2024 AMANAT. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  )
}
