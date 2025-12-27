// ============================================
// КОНТАКТЫ — /contacts
// ============================================

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react"

export default function ContactsPage() {
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

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          На главную
        </Link>

        <h1 className="text-4xl font-bold mb-8">Контакты</h1>

        <div className="grid grid-cols-2 gap-6">
          {/* Телефон */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-red-600" />
                Телефон
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a href="tel:+77001234567" className="text-2xl font-bold text-red-600 hover:underline">
                +7 (700) 123-45-67
              </a>
              <p className="text-muted-foreground mt-2">
                Звоните с 9:00 до 20:00 без выходных
              </p>
            </CardContent>
          </Card>

          {/* WhatsApp */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-600" />
                WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a href="https://wa.me/77001234567" target="_blank" rel="noopener noreferrer" className="text-2xl font-bold text-green-600 hover:underline">
                +7 (700) 123-45-67
              </a>
              <p className="text-muted-foreground mt-2">
                Пишите в любое время
              </p>
            </CardContent>
          </Card>

          {/* Email */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-red-600" />
                Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a href="mailto:info@amanat.kz" className="text-2xl font-bold text-red-600 hover:underline">
                info@amanat.kz
              </a>
              <p className="text-muted-foreground mt-2">
                Ответим в течение 24 часов
              </p>
            </CardContent>
          </Card>

          {/* Часы работы */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-red-600" />
                Режим работы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">Ежедневно 9:00 — 20:00</p>
              <p className="text-muted-foreground mt-2">
                Без выходных и перерывов
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Адрес */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-600" />
              Адрес офиса
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-medium mb-2">
              г. Алматы, ул. Абая, 1
            </p>
            <p className="text-muted-foreground mb-4">
              Бизнес-центр &quot;Аманат&quot;, 2 этаж, офис 201
            </p>
            {/* Карта-заглушка */}
            <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground">Карта</span>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-lg mb-4">Готовы оформить рассрочку?</p>
          <Link href="/apply">
            <Button size="lg" className="bg-red-600 hover:bg-red-700">
              Оформить заявку
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
