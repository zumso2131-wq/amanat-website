"use client"

// ============================================
// СТРАНИЦА РЕГИСТРАЦИИ — /register
// ============================================

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Eye, EyeOff, Loader2, Phone, Lock, User } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Валидация формы
  const validate = () => {
    const newErrors: Record<string, string> = {}

    // Телефон
    if (!formData.phone) {
      newErrors.phone = "Введите номер телефона"
    } else if (formData.phone.replace(/\D/g, "").length < 10) {
      newErrors.phone = "Номер телефона должен содержать минимум 10 цифр"
    }

    // Пароль
    if (!formData.password) {
      newErrors.password = "Введите пароль"
    } else if (formData.password.length < 8) {
      newErrors.password = "Пароль должен содержать минимум 8 символов"
    }

    // Подтверждение пароля
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Подтвердите пароль"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return

    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Ошибка регистрации",
          description: data.error || "Не удалось зарегистрироваться",
        })
        return
      }

      // Успешная регистрация
      toast({
        title: "Регистрация успешна!",
        description: "Теперь вы можете войти в систему",
      })

      // Редирект на страницу входа
      router.push("/login?registered=true")
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Произошла ошибка при регистрации. Попробуйте позже.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2c3e50]/5 via-white to-[#27ae60]/10 px-4 py-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          {/* Логотип */}
          <Link href="/" className="flex items-center justify-center gap-2">
            <div className="h-12 w-12 rounded-xl bg-[#2c3e50] flex items-center justify-center">
              <span className="text-white font-bold text-2xl">А</span>
            </div>
            <span className="font-bold text-3xl text-[#2c3e50]">AMANAT</span>
          </Link>
          
          <div>
            <CardTitle className="text-2xl">Регистрация</CardTitle>
            <CardDescription className="mt-2">
              Создайте аккаунт для оформления рассрочки
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ФИО (опционально) */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                ФИО (опционально)
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Иванов Иван Иванович"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                disabled={loading}
                className="h-11"
              />
            </div>

            {/* Телефон */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Номер телефона <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="89291234567"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value })
                  if (errors.phone) setErrors({ ...errors, phone: "" })
                }}
                required
                disabled={loading}
                autoComplete="tel"
                className={`h-11 ${errors.phone ? "border-red-500" : ""}`}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* Пароль */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Пароль <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Минимум 8 символов"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value })
                    if (errors.password) setErrors({ ...errors, password: "" })
                  }}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  className={`h-11 pr-10 ${errors.password ? "border-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Подтверждение пароля */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Подтверждение пароля <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Повторите пароль"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value })
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" })
                  }}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  className={`h-11 pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Кнопка регистрации */}
            <Button 
              type="submit" 
              className="w-full h-11 text-base bg-[#27ae60] hover:bg-[#2ecc71]" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Регистрация...
                </>
              ) : (
                "Зарегистрироваться"
              )}
            </Button>
          </form>

          {/* Ссылка на вход */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Уже есть аккаунт?{" "}
              <Link href="/login" className="text-[#27ae60] hover:underline font-medium">
                Войти
              </Link>
            </p>
            <Link 
              href="/" 
              className="text-sm text-muted-foreground hover:text-[#27ae60] transition-colors block"
            >
              ← Вернуться на главную
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
