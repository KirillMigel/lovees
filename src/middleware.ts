import { NextResponse } from "next/server"

export function middleware(request: any) {
  // Простой middleware без аутентификации
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Исключаем статические файлы и API routes
    "/((?!_next/static|_next/image|favicon.ico|api/ok).*)",
  ],
}