import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Проверка доступа к админ-панели
    if (path.startsWith('/admin')) {
      if (token?.role !== UserRole.ADMIN && token?.role !== UserRole.MANAGER) {
        return NextResponse.redirect(new URL('/cabinet', req.url));
      }
    }

    // Проверка доступа к кабинету клиента
    if (path.startsWith('/cabinet')) {
      if (token?.role !== UserRole.CLIENT) {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Публичные роуты
        if (
          path === '/' ||
          path.startsWith('/usloviya') ||
          path.startsWith('/catalog') ||
          path.startsWith('/calculator') ||
          path.startsWith('/faq') ||
          path.startsWith('/contacts') ||
          path.startsWith('/apply')
        ) {
          return true;
        }

        // Защищенные роуты требуют авторизации
        return !!token;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    '/cabinet/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/client/:path*',
  ],
};
