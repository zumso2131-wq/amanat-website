import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Проверка доступа к админ панели
    if (path.startsWith('/admin')) {
      if (!token || (token.role !== 'ADMIN' && token.role !== 'MANAGER')) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    // Проверка доступа к кабинету клиента
    if (path.startsWith('/cabinet')) {
      if (!token || token.role !== 'CLIENT') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname

        // Публичные страницы доступны всем
        const publicPaths = ['/', '/usloviya', '/catalog', '/calculator', '/faq', '/contacts', '/apply', '/login']
        if (publicPaths.includes(path) || path.startsWith('/api/auth')) {
          return true
        }

        // Для защищённых страниц нужен токен
        if (path.startsWith('/admin') || path.startsWith('/cabinet')) {
          return !!token
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/cabinet/:path*'],
}
