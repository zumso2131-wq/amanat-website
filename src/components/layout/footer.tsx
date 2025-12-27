import Link from "next/link"
import { Phone, Mail, MapPin, Clock } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">А</span>
              </div>
              <span className="font-bold text-xl">Аманат</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Рассрочка на технику и товары без переплаты. 
              Честные условия, прозрачные платежи.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Информация</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/usloviya" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Условия рассрочки
              </Link>
              <Link href="/catalog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Каталог товаров
              </Link>
              <Link href="/calculator" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Калькулятор
              </Link>
              <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Частые вопросы
              </Link>
            </nav>
          </div>

          {/* Contacts */}
          <div className="space-y-4">
            <h3 className="font-semibold">Контакты</h3>
            <div className="space-y-3">
              <a 
                href="tel:+77001234567" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="h-4 w-4" />
                +7 (700) 123-45-67
              </a>
              <a 
                href="mailto:info@amanat.kz" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-4 w-4" />
                info@amanat.kz
              </a>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>г. Алматы, ул. Примерная, 123</span>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="space-y-4">
            <h3 className="font-semibold">Режим работы</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Пн-Пт: 9:00 - 19:00</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Сб: 10:00 - 16:00</span>
              </div>
              <div className="text-sm text-muted-foreground ml-6">
                Вс: выходной
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Аманат. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}
