import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Search, ShoppingCart, Calculator } from "lucide-react"
import { formatMoney } from "@/lib/calculations"

// Demo products
const products = [
  { id: 1, name: "iPhone 15 Pro Max 256GB", category: "Смартфоны", price: 650000, image: "📱" },
  { id: 2, name: "Samsung Galaxy S24 Ultra", category: "Смартфоны", price: 580000, image: "📱" },
  { id: 3, name: "MacBook Air M3 13\"", category: "Ноутбуки", price: 750000, image: "💻" },
  { id: 4, name: "HP Pavilion 15", category: "Ноутбуки", price: 350000, image: "💻" },
  { id: 5, name: "Samsung QLED 55\"", category: "Телевизоры", price: 420000, image: "📺" },
  { id: 6, name: "LG OLED 65\"", category: "Телевизоры", price: 890000, image: "📺" },
  { id: 7, name: "Sony PlayStation 5", category: "Игровые консоли", price: 280000, image: "🎮" },
  { id: 8, name: "Apple Watch Series 9", category: "Умные часы", price: 220000, image: "⌚" },
  { id: 9, name: "Samsung холодильник", category: "Бытовая техника", price: 380000, image: "🧊" },
  { id: 10, name: "Стиральная машина LG", category: "Бытовая техника", price: 290000, image: "🧺" },
  { id: 11, name: "Кондиционер Midea", category: "Климат", price: 180000, image: "❄️" },
  { id: 12, name: "iPad Pro 12.9\"", category: "Планшеты", price: 550000, image: "📱" },
]

const categories = ["Все", "Смартфоны", "Ноутбуки", "Телевизоры", "Бытовая техника", "Игровые консоли", "Умные часы", "Климат", "Планшеты"]

export default function CatalogPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Каталог товаров</h1>
            <p className="text-muted-foreground">
              Выберите товар и оформите рассрочку от 3 до 12 месяцев
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Поиск товаров..." 
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 5).map((cat) => (
                <Button
                  key={cat}
                  variant={cat === "Все" ? "default" : "outline"}
                  size="sm"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const monthlyPayment = Math.floor(product.price * 1.25 / 5) // 5 months, 25% markup
              return (
                <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="text-6xl text-center mb-4">{product.image}</div>
                    <Badge variant="secondary" className="w-fit">
                      {product.category}
                    </Badge>
                    <CardTitle className="text-lg line-clamp-2 h-14">
                      {product.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">{formatMoney(product.price)}</p>
                      <p className="text-sm text-muted-foreground">
                        от {formatMoney(monthlyPayment)}/мес
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button className="flex-1" asChild>
                      <Link href={`/apply?product=${encodeURIComponent(product.name)}&price=${product.price}`}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        В рассрочку
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/calculator?price=${product.price}`}>
                        <Calculator className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>

          {/* Info Banner */}
          <div className="mt-12 p-8 bg-muted/50 rounded-xl text-center">
            <h2 className="text-xl font-semibold mb-2">Не нашли нужный товар?</h2>
            <p className="text-muted-foreground mb-4">
              Вы можете принести свой товар из любого магазина, и мы оформим на него рассрочку
            </p>
            <Button variant="outline" asChild>
              <Link href="/apply">Оставить заявку</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
