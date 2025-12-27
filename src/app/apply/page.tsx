"use client"

// ============================================
// ЗАЯВКА НА РАССРОЧКУ — /apply
// ============================================

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Send, Loader2, CheckCircle } from "lucide-react"

function ApplyForm() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    product: searchParams.get("product") || "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setSubmitted(true)
        toast({
          title: "Заявка отправлена!",
          description: "Мы свяжемся с вами в ближайшее время",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: data.error || "Не удалось отправить заявку",
        })
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Произошла ошибка. Попробуйте позже.",
      })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Заявка отправлена!</h2>
          <p className="text-muted-foreground mb-6">
            Наш менеджер свяжется с вами в течение 15 минут
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/">
              <Button variant="outline">На главную</Button>
            </Link>
            <Link href="/calculator">
              <Button>Рассчитать ещё</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Заявка на рассрочку</CardTitle>
        <CardDescription>
          Заполните форму, и мы свяжемся с вами в течение 15 минут
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Ваше имя *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Иван Иванов"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Телефон *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+7 (700) 000-00-00"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product">Интересующий товар</Label>
            <Input
              id="product"
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              placeholder="iPhone 15, MacBook Pro и т.д."
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Сообщение</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Дополнительная информация или вопросы"
              rows={3}
              disabled={loading}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#27ae60] hover:bg-[#2ecc71]" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Отправка...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Отправить заявку
              </>
            )}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных
        </p>
      </CardContent>
    </Card>
  )
}

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-[#27ae60] flex items-center justify-center">
              <span className="text-white font-bold text-xl">А</span>
            </div>
            <span className="font-bold text-xl">Аманат</span>
          </Link>
          <Link href="/login">
            <Button variant="outline">Кабинет</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          На главную
        </Link>

        <Suspense fallback={
          <Card className="max-w-md mx-auto">
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            </CardContent>
          </Card>
        }>
          <ApplyForm />
        </Suspense>
      </main>
    </div>
  )
}
