import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { MatchService } from "@/lib/match-service"
import { withRateLimit, createSwipeRateLimit } from "@/lib/rate-limit"
import { z } from "zod"

const swipeSchema = z.object({
  targetId: z.string(),
  direction: z.enum(["LEFT", "RIGHT", "SUPER"]),
})

async function swipeHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { targetId, direction } = swipeSchema.parse(body)

    // Check if user is trying to swipe themselves
    if (session.user.id === targetId) {
      return NextResponse.json(
        { error: "Нельзя свайпать самого себя" },
        { status: 400 }
      )
    }

    // Check if user already swiped this target
    const existingSwipe = await prisma.swipe.findUnique({
      where: {
        swiperId_targetId: {
          swiperId: session.user.id,
          targetId,
        },
      },
    })

    if (existingSwipe) {
      return NextResponse.json(
        { error: "Вы уже свайпнули этого пользователя" },
        { status: 400 }
      )
    }

    // Create swipe
    const swipe = await prisma.swipe.create({
      data: {
        swiperId: session.user.id,
        targetId,
        direction,
      },
    })

    let matchCreated = false
    let matchId: string | undefined

    // Check for match if direction is RIGHT or SUPER
    if (direction === "RIGHT" || direction === "SUPER") {
      // Check if target user also swiped right on current user
      const targetSwipe = await prisma.swipe.findFirst({
        where: {
          swiperId: targetId,
          targetId: session.user.id,
          direction: { in: ["RIGHT", "SUPER"] },
        },
      })

      if (targetSwipe) {
        // It's a match! Check if match already exists
        const existingMatch = await MatchService.getMatch(session.user.id, targetId)
        
        if (!existingMatch) {
          const match = await MatchService.createMatch(session.user.id, targetId)
          matchCreated = true
          matchId = match.id
        } else {
          matchCreated = true
          matchId = existingMatch.id
        }
      }
    }

    return NextResponse.json({
      matchCreated,
      matchId,
    })

  } catch (error) {
    console.error("Swipe error:", error)
    
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

// Apply rate limiting to swipe endpoint
export const POST = withRateLimit(createSwipeRateLimit(), swipeHandler)
