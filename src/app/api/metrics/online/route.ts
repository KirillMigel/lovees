import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// In-memory store for online users (in production, use Redis)
const onlineUsers = new Set<string>()
const lastSeen = new Map<string, number>()

// Clean up inactive users every 5 minutes
setInterval(() => {
  const now = Date.now()
  const inactiveThreshold = 5 * 60 * 1000 // 5 minutes

  for (const [userId, lastActivity] of lastSeen.entries()) {
    if (now - lastActivity > inactiveThreshold) {
      onlineUsers.delete(userId)
      lastSeen.delete(userId)
    }
  }
}, 5 * 60 * 1000)

export async function GET() {
  try {
    return NextResponse.json({
      onlineUsers: onlineUsers.size,
      users: Array.from(onlineUsers),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Get online users error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { action } = await request.json()
    const userId = session.user.id
    const now = Date.now()

    if (action === "heartbeat") {
      onlineUsers.add(userId)
      lastSeen.set(userId, now)
    } else if (action === "disconnect") {
      onlineUsers.delete(userId)
      lastSeen.delete(userId)
    }

    return NextResponse.json({
      success: true,
      onlineUsers: onlineUsers.size,
    })
  } catch (error) {
    console.error("Update online status error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
