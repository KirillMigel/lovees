import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const messageSchema = z.object({
  matchId: z.string(),
  text: z.string().min(1).max(1000),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get("matchId")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")

    if (!matchId) {
      return NextResponse.json(
        { error: "matchId обязателен" },
        { status: 400 }
      )
    }

    // Verify user is part of this match
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [
          { userAId: session.user.id },
          { userBId: session.user.id },
        ],
      },
    })

    if (!match) {
      return NextResponse.json(
        { error: "Матч не найден или нет доступа" },
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
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    })

    // Get total count for pagination
    const totalCount = await prisma.message.count({
      where: { matchId },
    })

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        matchId,
        senderId: { not: session.user.id },
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    })

    return NextResponse.json({
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: page * limit < totalCount,
      },
    })

  } catch (error) {
    console.error("Get messages error:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { matchId, text } = messageSchema.parse(body)

    // Verify user is part of this match
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [
          { userAId: session.user.id },
          { userBId: session.user.id },
        ],
      },
    })

    if (!match) {
      return NextResponse.json(
        { error: "Матч не найден или нет доступа" },
        { status: 404 }
      )
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        matchId,
        senderId: session.user.id,
        text,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({ message })

  } catch (error) {
    console.error("Create message error:", error)
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Некорректные данные" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
