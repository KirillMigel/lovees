"use client"

import { ThemeProvider } from "next-themes"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        storageKey="lovees-theme"
      >
        {children}
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  )
}
