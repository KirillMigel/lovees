import 'server-only'
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { triggerMatchEvent } from "@/lib/pusher"
import { z } from "zod"

const sendMessageSchema = z.object({
  matchId: z.string().min(1, "Match ID is required"),
  text: z.string().min(1, "Message text is required").max(1000, "Message too long")
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get('matchId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!matchId) {
      return NextResponse.json(
        { error: "Match ID is required" },
        { status: 400 }
      )
    }

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

    // Get messages with pagination
    const messages = await prisma.message.findMany({
      where: { matchId },
      include: {
        sender: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit
    })

    // Format messages
    const formattedMessages = messages.map(message => ({
      id: message.id,
      text: message.text,
      createdAt: message.createdAt,
      readAt: message.readAt,
      sender: {
        id: message.sender.id,
        name: message.sender.name
      },
      isFromMe: message.senderId === session.user.id
    }))

    return NextResponse.json({
      messages: formattedMessages.reverse(), // Reverse to show oldest first
      hasMore: messages.length === limit
    })
  } catch (error) {
    console.error("Get messages error:", error)
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { matchId, text } = sendMessageSchema.parse(body)

    // Check if user is part of this match
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [
          { userAId: session.user.id },
          { userBId: session.user.id }
        ]
      },
      include: {
        userA: { select: { id: true, name: true } },
        userB: { select: { id: true, name: true } }
      }
    })

    if (!match) {
      return NextResponse.json(
        { error: "Match not found or access denied" },
        { status: 404 }
      )
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        matchId,
        senderId: session.user.id,
        text
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Trigger Pusher event
    await triggerMatchEvent(matchId, 'message:new', {
      id: message.id,
      text: message.text,
      createdAt: message.createdAt,
      sender: {
        id: message.sender.id,
        name: message.sender.name
      },
      isFromMe: message.senderId === session.user.id
    })

    return NextResponse.json({
      message: {
        id: message.id,
        text: message.text,
        createdAt: message.createdAt,
        readAt: message.readAt,
        sender: {
          id: message.sender.id,
          name: message.sender.name
        },
        isFromMe: message.senderId === session.user.id
      }
    })
  } catch (error) {
    console.error("Send message error:", error)
    
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