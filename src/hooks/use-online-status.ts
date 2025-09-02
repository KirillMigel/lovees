"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"

export function useOnlineStatus() {
  const { data: session } = useSession()

  useEffect(() => {
    if (!session?.user?.id) return

    let heartbeatInterval: NodeJS.Timeout

    const sendHeartbeat = async () => {
      try {
        await fetch("/api/metrics/online", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "heartbeat" }),
        })
      } catch (error) {
        console.error("Failed to send heartbeat:", error)
      }
    }

    const handleBeforeUnload = async () => {
      try {
        // Send disconnect signal
        await fetch("/api/metrics/online", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "disconnect" }),
        })
      } catch (error) {
        console.error("Failed to send disconnect:", error)
      }
    }

    // Send initial heartbeat
    sendHeartbeat()

    // Send heartbeat every 2 minutes
    heartbeatInterval = setInterval(sendHeartbeat, 2 * 60 * 1000)

    // Send disconnect on page unload
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval)
      }
      window.removeEventListener("beforeunload", handleBeforeUnload)
      
      // Send disconnect signal
      handleBeforeUnload()
    }
  }, [session?.user?.id])
}
