import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  // Public routes - no protection needed
  const publicRoutes = ["/", "/login", "/usloviya", "/catalog", "/calculator", "/faq", "/contacts", "/apply"]
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith("/api/applications") || pathname.startsWith("/api/products")
  )

  // Auth routes
  const isAuthRoute = pathname === "/login"

  // Admin routes
  const isAdminRoute = pathname.startsWith("/admin")

  // Cabinet routes  
  const isCabinetRoute = pathname.startsWith("/cabinet")

  // API routes
  const isApiRoute = pathname.startsWith("/api")

  // Redirect logged-in users from login to appropriate dashboard
  if (isAuthRoute && isLoggedIn) {
    if (userRole === "ADMIN" || userRole === "MANAGER") {
      return NextResponse.redirect(new URL("/admin", req.url))
    }
    return NextResponse.redirect(new URL("/cabinet", req.url))
  }

  // Protect cabinet routes
  if (isCabinetRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Protect admin routes
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
    if (userRole !== "ADMIN" && userRole !== "MANAGER") {
      return NextResponse.redirect(new URL("/cabinet", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
