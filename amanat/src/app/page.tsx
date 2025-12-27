import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Calculator, 
  Shield, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Smartphone,
  Laptop,
  Tv,
  Refrigerator
} from "lucide-react"

const features = [
  {
    icon: Calculator,
    title: "Прозрачные условия",
    description: "Наценка от 15% до 65% в зависимости от срока. Никаких скрытых комиссий."
  },
  {
    icon: Shield,
    title: "Без банков",
    description: "Мы не банк. Рассрочка напрямую от магазина без процентов по кредиту."
  },
  {
    icon: Clock,
    title: "Срок до 12 месяцев",
    description: "Выбирайте удобный срок рассрочки от 3 до 12 месяцев."
  },
  {
    icon: CheckCircle2,
    title: "Быстрое оформление",
    description: "Оформление за 15 минут. Нужен только паспорт и ИИН."
  },
]

const categories = [
  { icon: Smartphone, name: "Смартфоны", count: 150 },
  { icon: Laptop, name: "Ноутбуки", count: 80 },
  { icon: Tv, name: "Телевизоры", count: 60 },
  { icon: Refrigerator, name: "Бытовая техника", count: 200 },
]

const steps = [
  { step: 1, title: "Выберите товар", description: "В нашем каталоге или принесите свой" },
  { step: 2, title: "Оставьте заявку", description: "Онлайн или в офисе" },
  { step: 3, title: "Подпишите договор", description: "Быстрое оформление за 15 минут" },
  { step: 4, title: "Получите товар", description: "И платите частями каждый месяц" },
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 bg-gradient-to-br from-primary/5 via-background to-primary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Рассрочка на товары{" "}
                <span className="text-primary">без переплаты</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Покупайте технику и товары в рассрочку от 3 до 12 месяцев. 
                Честная наценка, понятные условия, никаких скрытых платежей.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/apply">
                    Оформить рассрочку
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/calculator">
                    <Calculator className="mr-2 h-4 w-4" />
                    Рассчитать платёж
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Почему выбирают нас
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, idx) => (
                <Card key={idx} className="border-0 shadow-sm">
                  <CardContent className="pt-6">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Как это работает
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {steps.map((item) => (
                <div key={item.step} className="text-center">
                  <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-bold">Популярные категории</h2>
              <Button variant="outline" asChild>
                <Link href="/catalog">
                  Весь каталог
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((category, idx) => (
                <Link key={idx} href={`/catalog?category=${category.name}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-6 text-center">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <category.icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.count} товаров</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Готовы оформить рассрочку?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Оставьте заявку прямо сейчас и получите решение в течение 15 минут
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/apply">
                Оставить заявку
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
