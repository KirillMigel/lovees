"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Flag, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ReportButtonProps {
  reportedUserId: string
  reportedUserName: string
  onReported?: () => void
}

export function ReportButton({ reportedUserId, reportedUserName, onReported }: ReportButtonProps) {
  const [isReporting, setIsReporting] = useState(false)

  const handleReport = async () => {
    if (!confirm(`Пожаловаться на пользователя "${reportedUserName}"?`)) {
      return
    }

    setIsReporting(true)
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportedId: reportedUserId,
          reason: "OTHER", // Default reason, could be made configurable
          description: `Жалоба на пользователя ${reportedUserName}`,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Ошибка отправки жалобы")
      }

      toast.success("Жалоба отправлена")
      onReported?.()
    } catch (error) {
      console.error("Report error:", error)
      toast.error(error instanceof Error ? error.message : "Ошибка отправки жалобы")
    } finally {
      setIsReporting(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleReport}
      disabled={isReporting}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      {isReporting ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Flag className="h-4 w-4 mr-2" />
      )}
      Пожаловаться
    </Button>
  )
}
