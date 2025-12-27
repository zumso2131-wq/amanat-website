"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle2, Loader2 } from "lucide-react"

function ApplyForm() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const productFromUrl = searchParams.get("product") || ""
  const priceFromUrl = searchParams.get("price") || ""

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    product: productFromUrl,
    message: priceFromUrl ? `Интересует товар стоимостью ${Number(priceFromUrl).toLocaleString()} ₸` : "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Ошибка отправки заявки")
      }

      setSuccess(true)
      toast({
        title: "Заявка отправлена!",
        description: "Мы свяжемся с вами в ближайшее время",
        variant: "success",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Произошла ошибка",
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <Card className="max-w-md text-center">
            <CardContent className="pt-8">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Заявка отправлена!</h2>
              <p className="text-muted-foreground mb-6">
                Наш менеджер свяжется с вами в течение 15 минут в рабочее время.
              </p>
              <Button asChild>
                <a href="/">Вернуться на главную</a>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Оставить заявку</h1>
              <p className="text-muted-foreground">
                Заполните форму, и мы свяжемся с вами в ближайшее время
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Контактные данные</CardTitle>
                <CardDescription>
                  Укажите ваши данные для связи
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Ваше имя *</Label>
                    <Input
                      id="fullName"
                      placeholder="Как к вам обращаться?"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Номер телефона *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+7 (700) 000-00-00"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product">Интересующий товар</Label>
                    <Input
                      id="product"
                      placeholder="Например: iPhone 15 Pro"
                      value={formData.product}
                      onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Комментарий</Label>
                    <Textarea
                      id="message"
                      placeholder="Дополнительная информация..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Отправка...
                      </>
                    ) : (
                      "Отправить заявку"
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function ApplyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
        <Footer />
      </div>
    }>
      <ApplyForm />
    </Suspense>
  )
}
