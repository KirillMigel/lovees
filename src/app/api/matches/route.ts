import 'server-only'
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's matches with last message and other user info
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { userAId: session.user.id },
          { userBId: session.user.id }
        ]
      },
      include: {
        userA: {
          select: {
            id: true,
            name: true,
            photos: {
              where: { isPrimary: true },
              take: 1,
              select: { url: true }
            }
          }
        },
        userB: {
          select: {
            id: true,
            name: true,
            photos: {
              where: { isPrimary: true },
              take: 1,
              select: { url: true }
            }
          }
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            text: true,
            createdAt: true,
            readAt: true,
            senderId: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Format matches with other user info and last message
    const formattedMatches = matches.map(match => {
      const isUserA = match.userAId === session.user.id
      const otherUser = isUserA ? match.userB : match.userA
      const lastMessage = match.messages[0] || null

      return {
        id: match.id,
        otherUser: {
          id: otherUser.id,
          name: otherUser.name,
          photoUrl: otherUser.photos[0]?.url || null
        },
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          text: lastMessage.text,
          createdAt: lastMessage.createdAt,
          readAt: lastMessage.readAt,
          isFromMe: lastMessage.senderId === session.user.id
        } : null,
        createdAt: match.createdAt,
        unreadCount: 0 // Will be calculated separately if needed
      }
    })

    return NextResponse.json({ matches: formattedMatches })
  } catch (error) {
    console.error("Get matches error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}