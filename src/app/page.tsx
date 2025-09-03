"use client"

import { useSession } from "next-auth/react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Загрузка...</div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-foreground">Lovees App</h1>
            <ThemeToggle />
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Добро пожаловать в Lovees!
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Современное приложение знакомств
            </p>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4 justify-center">
                <a 
                  href="/api/auth/signin?callbackUrl=%2F"
                  className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Войти
                </a>
                <a 
                  href="/styleguide" 
                  className="inline-block bg-outline border border-input px-6 py-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Style Guide
                </a>
              </div>
              <div className="text-sm text-muted-foreground">
                Статус: Работает! 🚀
              </div>
              
              <div className="flex justify-center gap-6 mt-8">
                <a 
                  href="/privacy" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Политика конфиденциальности
                </a>
                <a 
                  href="/terms" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Условия использования
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Lovees App</h1>
          <div className="flex items-center gap-4">
            <span className="text-foreground">Привет, {session?.user?.name}!</span>
            <a 
              href="/api/auth/signout"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Выйти
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Добро пожаловать, {session?.user?.name}!
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Вы успешно вошли в систему
          </p>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 justify-center">
              <a 
                href="/browse" 
                className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Начать поиск
              </a>
              <a 
                href="/matches" 
                className="inline-block bg-secondary text-secondary-foreground px-6 py-3 rounded-lg hover:bg-secondary/80 transition-colors"
              >
                Мэтчи
              </a>
              <a 
                href="/settings/profile" 
                className="inline-block bg-outline border border-input px-6 py-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Настройки
              </a>
            </div>
            <div className="text-sm text-muted-foreground">
              Email: {session?.user?.email}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}