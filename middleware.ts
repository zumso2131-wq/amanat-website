import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin")) {
      if (token?.role !== "ADMIN" && token?.role !== "MANAGER") {
        return NextResponse.redirect(new URL("/login", req.url)); // Or 403 page
      }
    }

    if (path.startsWith("/cabinet")) {
      if (token?.role !== "CLIENT") {
        // Ideally allow admins to see client view? For now strict.
        // Or redirect to admin if admin tries to access cabinet?
        // Let's keep it simple: strict access.
        if (token?.role === "ADMIN" || token?.role === "MANAGER") {
             // Admin might want to see cabinet, but usually they have their own view.
             // We'll redirect admins to /admin if they hit /cabinet by mistake, or allow it?
             // Prompt says: "Client portal (CLIENT)".
             // Let's strictly enforce.
             return NextResponse.redirect(new URL("/admin", req.url));
        }
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/cabinet/:path*"],
};
