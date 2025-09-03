import { NextResponse } from "next/server";

export function middleware(request: Request) {
  // Временно отключаем всю логику middleware для отладки
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Временно отключаем middleware полностью
     * Match only non-existent paths to disable middleware
     */
    "/non-existent-path-for-middleware-disabling",
  ],
};