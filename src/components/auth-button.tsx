"use client"

import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"

export function AuthButton() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <Button variant="ghost" size="sm" disabled>
        <User className="w-4 h-4 mr-2" />
        Загрузка...
      </Button>
    )
  }

  if (!session) {
    return (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" asChild>
          <a href="/login">Войти</a>
        </Button>
        <Button size="sm" asChild>
          <a href="/register">Регистрация</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        Привет, {session.user.name}!
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Выйти
      </Button>
    </div>
  )
}
