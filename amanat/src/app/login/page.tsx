"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Eye, EyeOff, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        phone: formData.phone,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Ошибка входа",
          description: "Неверный номер телефона или пароль",
        })
      } else {
        // Redirect based on role - will be handled by middleware
        router.push("/cabinet")
        router.refresh()
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Произошла ошибка при входе",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">А</span>
            </div>
            <span className="font-bold text-2xl">Аманат</span>
          </Link>
          <CardTitle>Вход в систему</CardTitle>
          <CardDescription>
            Введите номер телефона и пароль для входа
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Номер телефона</Label>
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
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Введите пароль"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Вход...
                </>
              ) : (
                "Войти"
              )}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              ← Вернуться на главную
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
