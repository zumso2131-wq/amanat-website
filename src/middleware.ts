// ============================================
// MIDDLEWARE — ЗАЩИТА МАРШРУТОВ
// ============================================
// Проверка авторизации и ролей для /admin и /cabinet

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  // ========================================
  // ПУБЛИЧНЫЕ МАРШРУТЫ — доступны всем
  // ========================================
  const publicRoutes = [
    "/",
    "/login",
    "/usloviya",
    "/catalog",
    "/calculator",
    "/faq",
    "/contacts",
    "/apply",
  ]
  
  const isPublicRoute = publicRoutes.some(route => pathname === route)
  
  // API маршруты для публичного доступа
  const isPublicApi = 
    pathname.startsWith("/api/applications") ||
    pathname.startsWith("/api/products") ||
    pathname.startsWith("/api/auth")

  // Статические файлы
  const isStaticFile = 
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")

  // Пропускаем публичные маршруты и статику
  if (isPublicRoute || isPublicApi || isStaticFile) {
    return NextResponse.next()
  }

  // ========================================
  // СТРАНИЦА ВХОДА
  // ========================================
  const isLoginPage = pathname === "/login"

  // Авторизованных пользователей перенаправляем с /login
  if (isLoginPage && isLoggedIn) {
    // Админы и менеджеры → /admin
    if (userRole === "ADMIN" || userRole === "MANAGER") {
      return NextResponse.redirect(new URL("/admin", req.url))
    }
    // Клиенты → /cabinet
    return NextResponse.redirect(new URL("/cabinet", req.url))
  }

  // ========================================
  // ЗАЩИТА /cabinet — только авторизованные
  // ========================================
  const isCabinetRoute = pathname.startsWith("/cabinet")

  if (isCabinetRoute) {
    // Не авторизован → на страницу входа
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // Авторизован — пропускаем
    return NextResponse.next()
  }

  // ========================================
  // ЗАЩИТА /admin — только ADMIN и MANAGER
  // ========================================
  const isAdminRoute = pathname.startsWith("/admin")

  if (isAdminRoute) {
    // Не авторизован → на страницу входа
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Проверка роли: только ADMIN и MANAGER
    if (userRole !== "ADMIN" && userRole !== "MANAGER") {
      // Клиент пытается зайти в админку → редирект в кабинет
      return NextResponse.redirect(new URL("/cabinet", req.url))
    }

    // Админ или менеджер — пропускаем
    return NextResponse.next()
  }

  // ========================================
  // ЗАЩИТА API — для защищённых эндпоинтов
  // ========================================
  const isProtectedApi = pathname.startsWith("/api/") && !isPublicApi

  if (isProtectedApi && !isLoggedIn) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Требуется авторизация" },
      { status: 401 }
    )
  }

  // ========================================
  // ПО УМОЛЧАНИЮ — пропускаем
  // ========================================
  return NextResponse.next()
})

// ========================================
// КОНФИГУРАЦИЯ MATCHER
// ========================================
// Указываем, какие маршруты обрабатывать middleware

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
