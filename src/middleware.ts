import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
// import { getSiteOrigin } from "@/lib/env" // Temporarily disabled

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isOnboarded = token?.isOnboarded
    const isAuth = !!token
    const userRole = token?.role

    // Public routes that don't require authentication
    const publicRoutes = ["/", "/login", "/register"]
    const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname)

    // Admin routes
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")
    const isApiAdminRoute = req.nextUrl.pathname.startsWith("/api/admin")

    // If not authenticated and trying to access protected route
    if (!isAuth && !isPublicRoute) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Check admin access
    if (isAuth && (isAdminRoute || isApiAdminRoute) && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url))
    }

    // If authenticated but not onboarded and not on onboarding page
    if (isAuth && !isOnboarded && req.nextUrl.pathname !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", req.url))
    }

    // If authenticated and onboarded but on auth pages, redirect to home
    if (isAuth && isOnboarded && (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register")) {
      return NextResponse.redirect(new URL("/", req.url))
    }

    // If authenticated and onboarded but on onboarding page, redirect to home
    if (isAuth && isOnboarded && req.nextUrl.pathname === "/onboarding") {
      return NextResponse.redirect(new URL("/", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - api/upload (Upload API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|api/upload|_next/static|_next/image|favicon.ico).*)",
  ],
}
