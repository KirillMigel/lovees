import 'server-only'
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { triggerMatchEvent } from "@/lib/pusher"
import { z } from "zod"

const markReadSchema = z.object({
  matchId: z.string().min(1, "Match ID is required"),
  messageIds: z.array(z.string()).optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { matchId, messageIds } = markReadSchema.parse(body)

    // Check if user is part of this match
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [
          { userAId: session.user.id },
          { userBId: session.user.id }
        ]
      }
    })

    if (!match) {
      return NextResponse.json(
        { error: "Match not found or access denied" },
        { status: 404 }
      )
    }

    // Mark messages as read
    const whereClause: any = {
      matchId,
      senderId: { not: session.user.id }, // Don't mark own messages as read
      readAt: null
    }

    if (messageIds && messageIds.length > 0) {
      whereClause.id = { in: messageIds }
    }

    const updatedMessages = await prisma.message.updateMany({
      where: whereClause,
      data: {
        readAt: new Date()
      }
    })

    // Trigger Pusher event to notify sender
    await triggerMatchEvent(matchId, 'message:read', {
      messageIds: messageIds || [],
      readBy: session.user.id,
      readAt: new Date()
    })

    return NextResponse.json({
      updatedCount: updatedMessages.count
    })
  } catch (error) {
    console.error("Mark messages read error:", error)
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid data" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
