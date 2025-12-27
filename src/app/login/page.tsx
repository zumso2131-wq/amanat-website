"use client"

// ============================================
// СТРАНИЦА ВХОДА — /login
// ============================================

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { signIn, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Eye, EyeOff, Loader2, Phone, Lock, UserPlus, CheckCircle } from "lucide-react"

// ============================================
// ФОРМА ВХОДА (использует useSearchParams)
// ============================================

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { data: session, status } = useSession()
  
  // Состояние формы
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  })

  // Показать сообщение об успешной регистрации
  const justRegistered = searchParams.get("registered") === "true"
  const errorParam = searchParams.get("error")

  // Если пользователь уже авторизован — редирект по роли
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const role = session.user.role
      if (role === "ADMIN" || role === "MANAGER") {
        router.push("/admin")
      } else {
        router.push("/cabinet")
      }
    }
  }, [status, session, router])

  // Показать уведомление после регистрации
  useEffect(() => {
    if (justRegistered) {
      toast({
        title: "Регистрация успешна!",
        description: "Теперь вы можете войти в систему",
      })
    }
    if (errorParam === "Configuration") {
      toast({
        variant: "destructive",
        title: "Ошибка конфигурации",
        description: "Проверьте настройки AUTH_SECRET в .env.local",
      })
    }
  }, [justRegistered, errorParam, toast])

  // Обработка отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Вызов NextAuth signIn
      const result = await signIn("credentials", {
        phone: formData.phone,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        // Ошибка авторизации
        toast({
          variant: "destructive",
          title: "Ошибка входа",
          description: "Неверный номер телефона или пароль",
        })
        setLoading(false)
        return
      }

      // Успешный вход — показываем уведомление
      toast({
        title: "Добро пожаловать!",
        description: "Вы успешно вошли в систему",
      })

      // Refresh чтобы получить session и выполнить редирект
      router.refresh()
    } catch (error) {
      console.error("Login error:", error)
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Произошла ошибка при входе. Попробуйте позже.",
      })
      setLoading(false)
    }
  }

  // Если идёт проверка сессии — показать загрузку
  if (status === "loading") {
    return <LoginSkeleton />
  }

  return (
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
          <CardTitle className="text-2xl">Вход в систему</CardTitle>
          <CardDescription className="mt-2">
            Введите номер телефона и пароль для входа
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {/* Сообщение после регистрации */}
        {justRegistered && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm">Регистрация успешна! Войдите в систему.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Поле телефона */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Номер телефона
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="89291234567"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              disabled={loading}
              autoComplete="tel"
              className="h-11"
            />
          </div>

          {/* Поле пароля */}
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Пароль
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Введите пароль"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={loading}
                autoComplete="current-password"
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Кнопка входа */}
          <Button 
            type="submit" 
            className="w-full h-11 text-base bg-[#27ae60] hover:bg-[#2ecc71]" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Вход...
              </>
            ) : (
              "Войти"
            )}
          </Button>
        </form>

        {/* Кнопка регистрации */}
        <div className="mt-4">
          <Link href="/register">
            <Button 
              variant="outline" 
              className="w-full h-11 text-base border-[#2c3e50] text-[#2c3e50] hover:bg-[#2c3e50] hover:text-white"
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Регистрация
            </Button>
          </Link>
        </div>

        {/* Ссылка на главную */}
        <div className="mt-6 text-center">
          <Link 
            href="/" 
            className="text-sm text-muted-foreground hover:text-[#27ae60] transition-colors"
          >
            ← Вернуться на главную
          </Link>
        </div>

        {/* Демо-данные */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground mb-2 font-medium">
            Демо-аккаунты:
          </p>
          <div className="text-xs space-y-1 font-mono">
            <p>Админ: 89291639595 / Lamaro095</p>
            <p>Менеджер: +77009876543 / manager123</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// LOADING SKELETON
// ============================================

function LoginSkeleton() {
  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <div className="h-12 w-12 rounded-xl bg-muted animate-pulse" />
          <div className="h-9 w-32 rounded bg-muted animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-7 w-48 mx-auto rounded bg-muted animate-pulse" />
          <div className="h-5 w-64 mx-auto rounded bg-muted animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-28 rounded bg-muted animate-pulse" />
          <div className="h-11 w-full rounded bg-muted animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-20 rounded bg-muted animate-pulse" />
          <div className="h-11 w-full rounded bg-muted animate-pulse" />
        </div>
        <div className="h-11 w-full rounded bg-muted animate-pulse" />
        <div className="h-11 w-full rounded bg-muted animate-pulse" />
      </CardContent>
    </Card>
  )
}

// ============================================
// ГЛАВНАЯ СТРАНИЦА
// ============================================

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2c3e50]/5 via-white to-[#27ae60]/10 px-4">
      <Suspense fallback={<LoginSkeleton />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
