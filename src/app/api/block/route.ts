import 'server-only'
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const blockSchema = z.object({
  userId: z.string().min(1, "User ID is required")
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { userId } = blockSchema.parse(body)

    // Check if user is trying to block themselves
    if (session.user.id === userId) {
      return NextResponse.json(
        { error: "Cannot block yourself" },
        { status: 400 }
      )
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if already blocked
    const existingBlock = await prisma.block.findUnique({
      where: {
        userId_blockedId: {
          userId: session.user.id,
          blockedId: userId
        }
      }
    })

    if (existingBlock) {
      return NextResponse.json(
        { error: "User already blocked" },
        { status: 400 }
      )
    }

    // Create block
    const block = await prisma.block.create({
      data: {
        userId: session.user.id,
        blockedId: userId
      }
    })

    // Delete any existing match between these users
    await prisma.match.deleteMany({
      where: {
        OR: [
          { userAId: session.user.id, userBId: userId },
          { userAId: userId, userBId: session.user.id }
        ]
      }
    })

    return NextResponse.json({ 
      block: {
        id: block.id,
        blockedId: block.blockedId,
        createdAt: block.createdAt
      }
    })
  } catch (error) {
    console.error("Block error:", error)
    
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

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { userId } = blockSchema.parse(body)

    // Remove block
    const deletedBlock = await prisma.block.deleteMany({
      where: {
        userId: session.user.id,
        blockedId: userId
      }
    })

    if (deletedBlock.count === 0) {
      return NextResponse.json(
        { error: "User not blocked" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unblock error:", error)
    
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