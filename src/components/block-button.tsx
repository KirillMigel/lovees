"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Ban, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface BlockButtonProps {
  blockedUserId: string
  blockedUserName: string
  onBlocked?: () => void
}

export function BlockButton({ blockedUserId, blockedUserName, onBlocked }: BlockButtonProps) {
  const [isBlocking, setIsBlocking] = useState(false)

  const handleBlock = async () => {
    if (!confirm(`Заблокировать пользователя "${blockedUserName}"? Вы больше не будете видеть его в выдаче и чатах.`)) {
      return
    }

    setIsBlocking(true)
    try {
      const response = await fetch("/api/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockedId: blockedUserId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Ошибка блокировки")
      }

      toast.success("Пользователь заблокирован")
      onBlocked?.()
    } catch (error) {
      console.error("Block error:", error)
      toast.error(error instanceof Error ? error.message : "Ошибка блокировки")
    } finally {
      setIsBlocking(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleBlock}
      disabled={isBlocking}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      {isBlocking ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Ban className="h-4 w-4 mr-2" />
      )}
      Заблокировать
    </Button>
  )
}
