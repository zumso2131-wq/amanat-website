// ============================================
// КАТАЛОГ — /catalog
// ============================================

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, ShoppingCart } from "lucide-react"
import { formatMoney } from "@/lib/calculations"

// Демо-товары
const products = [
  {
    id: "1",
    name: "iPhone 15 Pro Max 256GB",
    category: "Смартфоны",
    price: 650000,
    image: "📱",
    monthlyFrom: 129583,
  },
  {
    id: "2",
    name: "Samsung Galaxy S24 Ultra",
    category: "Смартфоны",
    price: 580000,
    image: "📱",
    monthlyFrom: 115500,
  },
  {
    id: "3",
    name: "MacBook Pro 14 M3",
    category: "Ноутбуки",
    price: 1200000,
    image: "💻",
    monthlyFrom: 239000,
  },
  {
    id: "4",
    name: "MacBook Air 15 M2",
    category: "Ноутбуки",
    price: 780000,
    image: "💻",
    monthlyFrom: 155400,
  },
  {
    id: "5",
    name: "Sony PlayStation 5",
    category: "Игровые консоли",
    price: 280000,
    image: "🎮",
    monthlyFrom: 55800,
  },
  {
    id: "6",
    name: "Apple Watch Ultra 2",
    category: "Умные часы",
    price: 420000,
    image: "⌚",
    monthlyFrom: 83700,
  },
  {
    id: "7",
    name: "iPad Pro 12.9 M2",
    category: "Планшеты",
    price: 620000,
    image: "📱",
    monthlyFrom: 123540,
  },
  {
    id: "8",
    name: "AirPods Max",
    category: "Аксессуары",
    price: 280000,
    image: "🎧",
    monthlyFrom: 55800,
  },
]

const categories = ["Все", "Смартфоны", "Ноутбуки", "Планшеты", "Умные часы", "Игровые консоли", "Аксессуары"]

export default function CatalogPage() {
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

      <main className="container mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          На главную
        </Link>

        <h1 className="text-4xl font-bold mb-8">Каталог товаров</h1>

        {/* Фильтры */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Поиск товаров..." className="pl-10" />
          </div>
          <div className="flex gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={cat === "Все" ? "default" : "outline"}
                size="sm"
                className={cat === "Все" ? "bg-red-600 hover:bg-red-700" : ""}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Товары */}
        <div className="grid grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition">
              <div className="h-48 bg-gray-100 flex items-center justify-center text-6xl">
                {product.image}
              </div>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">{product.category}</div>
                <h3 className="font-medium mb-2 line-clamp-2">{product.name}</h3>
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {formatMoney(product.price)}
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  от {formatMoney(product.monthlyFrom)}/мес
                </div>
                <div className="flex gap-2">
                  <Link href={`/apply?product=${encodeURIComponent(product.name)}&price=${product.price}`} className="flex-1">
                    <Button className="w-full bg-red-600 hover:bg-red-700" size="sm">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      В рассрочку
                    </Button>
                  </Link>
                  <Link href={`/calculator?price=${product.price}`}>
                    <Button variant="outline" size="sm">
                      Расчёт
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
