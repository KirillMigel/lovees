import 'server-only'
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkRateLimit } from "@/lib/rate-limit"
import { z } from "zod"

const swipeSchema = z.object({
  targetId: z.string().min(1, "Target ID is required"),
  direction: z.enum(["LEFT", "RIGHT", "SUPER"], {
    errorMap: () => ({ message: "Direction must be LEFT, RIGHT, or SUPER" })
  })
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { targetId, direction } = swipeSchema.parse(body)

    // Check rate limit
    const rateLimit = await checkRateLimit(session.user.id, 'swipe')
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: "Rate limit exceeded", 
          remaining: rateLimit.remaining,
          resetTime: rateLimit.resetTime
        },
        { status: 429 }
      )
    }

    // Check if user is trying to swipe themselves
    if (session.user.id === targetId) {
      return NextResponse.json(
        { error: "Cannot swipe yourself" },
        { status: 400 }
      )
    }

    // Check if target user exists and is not banned
    const targetUser = await prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, isBanned: true }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      )
    }

    if (targetUser.isBanned) {
      return NextResponse.json(
        { error: "Cannot swipe banned user" },
        { status: 400 }
      )
    }

    // Check if swipe already exists
    const existingSwipe = await prisma.swipe.findUnique({
      where: {
        swiperId_targetId: {
          swiperId: session.user.id,
          targetId: targetId
        }
      }
    })

    if (existingSwipe) {
      return NextResponse.json(
        { error: "Already swiped this user" },
        { status: 400 }
      )
    }

    // Create the swipe
    const swipe = await prisma.swipe.create({
      data: {
        swiperId: session.user.id,
        targetId: targetId,
        direction: direction
      }
    })

    let matchCreated = false
    let matchId: string | undefined

    // Check for mutual right swipe (match)
    if (direction === "RIGHT") {
      const mutualSwipe = await prisma.swipe.findUnique({
        where: {
          swiperId_targetId: {
            swiperId: targetId,
            targetId: session.user.id
          }
        }
      })

      if (mutualSwipe && mutualSwipe.direction === "RIGHT") {
        // Create match - normalize user IDs (userA = min, userB = max)
        const userAId = session.user.id < targetId ? session.user.id : targetId
        const userBId = session.user.id > targetId ? session.user.id : targetId

        // Check if match already exists
        const existingMatch = await prisma.match.findUnique({
          where: {
            userAId_userBId: {
              userAId: userAId,
              userBId: userBId
            }
          }
        })

        if (!existingMatch) {
          const match = await prisma.match.create({
            data: {
              userAId: userAId,
              userBId: userBId
            }
          })
          matchCreated = true
          matchId = match.id
        }
      }
    }

    return NextResponse.json({
      matchCreated,
      matchId
    })
  } catch (error) {
    console.error("Swipe error:", error)
    
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