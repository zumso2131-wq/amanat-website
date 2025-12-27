import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CatalogPage() {
  const products = [
    { id: "1", name: "iPhone 15 Pro", price: "От 89 990 ₽" },
    { id: "2", name: "Samsung Galaxy S24", price: "От 79 990 ₽" },
    { id: "3", name: "MacBook Air M3", price: "От 129 990 ₽" },
    { id: "4", name: "Телевизор Samsung 55\"", price: "От 49 990 ₽" },
    { id: "5", name: "Холодильник LG", price: "От 39 990 ₽" },
    { id: "6", name: "Стиральная машина Bosch", price: "От 34 990 ₽" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Каталог товаров</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
                <CardDescription>{product.price}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/apply">
                  <Button className="w-full">Оформить рассрочку</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
