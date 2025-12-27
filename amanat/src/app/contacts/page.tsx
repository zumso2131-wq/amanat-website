import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Phone, Mail, MapPin, Clock, MessageSquare } from "lucide-react"

export default function ContactsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-primary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-4">Контакты</h1>
              <p className="text-xl text-muted-foreground">
                Свяжитесь с нами любым удобным способом
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Телефон</CardTitle>
                </CardHeader>
                <CardContent>
                  <a 
                    href="tel:+77001234567" 
                    className="text-lg font-medium hover:text-primary transition-colors"
                  >
                    +7 (700) 123-45-67
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">
                    Звонки с 9:00 до 19:00
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">WhatsApp</CardTitle>
                </CardHeader>
                <CardContent>
                  <a 
                    href="https://wa.me/77001234567" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-medium hover:text-primary transition-colors"
                  >
                    +7 (700) 123-45-67
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">
                    Отвечаем в течение часа
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Email</CardTitle>
                </CardHeader>
                <CardContent>
                  <a 
                    href="mailto:info@amanat.kz" 
                    className="text-lg font-medium hover:text-primary transition-colors"
                  >
                    info@amanat.kz
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ответ в течение 24 часов
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Режим работы</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">Пн-Пт: 9:00 - 19:00</p>
                  <p className="font-medium">Сб: 10:00 - 16:00</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Вс: выходной
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Address */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Наш офис</CardTitle>
                      <p className="text-muted-foreground">Приходите в гости!</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-semibold mb-2">Адрес</h3>
                      <p className="text-muted-foreground mb-4">
                        г. Алматы, ул. Примерная, 123<br />
                        БЦ «Центральный», офис 456
                      </p>
                      <h3 className="font-semibold mb-2">Как добраться</h3>
                      <p className="text-muted-foreground">
                        Станция метро «Абая», выход 2.<br />
                        5 минут пешком в сторону горы.
                      </p>
                    </div>
                    <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
                      <p className="text-muted-foreground">Карта загружается...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Готовы оформить рассрочку?</h2>
            <p className="text-muted-foreground mb-8">
              Оставьте заявку онлайн или приходите к нам в офис
            </p>
            <Button size="lg" asChild>
              <Link href="/apply">
                Оставить заявку
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
