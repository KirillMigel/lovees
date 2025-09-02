"use client"

import { useState, useEffect } from "react"
import { Users } from "lucide-react"

export function OnlineUsers() {
  const [onlineCount, setOnlineCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        const response = await fetch("/api/metrics/online")
        if (response.ok) {
          const data = await response.json()
          setOnlineCount(data.onlineUsers)
        }
      } catch (error) {
        console.error("Failed to fetch online users:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Fetch immediately
    fetchOnlineUsers()

    // Update every 30 seconds
    const interval = setInterval(fetchOnlineUsers, 30000)

    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Users className="h-4 w-4" />
      <span>{onlineCount} онлайн</span>
    </div>
  )
}
