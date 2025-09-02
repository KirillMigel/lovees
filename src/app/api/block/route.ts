import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withRateLimit, createBlockRateLimit } from "@/lib/rate-limit"
import { z } from "zod"

const blockSchema = z.object({
  blockedId: z.string().min(1),
})

async function blockHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { blockedId } = blockSchema.parse(body)

    // Check if user is trying to block themselves
    if (blockedId === session.user.id) {
      return NextResponse.json(
        { error: "Нельзя заблокировать самого себя" },
        { status: 400 }
      )
    }

    // Check if blocked user exists
    const blockedUser = await prisma.user.findUnique({
      where: { id: blockedId },
      select: { id: true, name: true }
    })

    if (!blockedUser) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      )
    }

    // Check if user already blocked this person
    const existingBlock = await prisma.block.findUnique({
      where: {
        userId_blockedId: {
          userId: session.user.id,
          blockedId: blockedId,
        }
      }
    })

    if (existingBlock) {
      return NextResponse.json(
        { error: "Пользователь уже заблокирован" },
        { status: 409 }
      )
    }

    // Create block
    const block = await prisma.block.create({
      data: {
        userId: session.user.id,
        blockedId: blockedId,
      },
      include: {
        blocked: {
          select: { id: true, name: true }
        }
      }
    })

    // Delete any existing matches between these users
    await prisma.match.deleteMany({
      where: {
        OR: [
          { userAId: session.user.id, userBId: blockedId },
          { userAId: blockedId, userBId: session.user.id },
        ]
      }
    })

    return NextResponse.json({
      message: "Пользователь заблокирован",
      block: {
        id: block.id,
        blockedUser: {
          id: block.blocked.id,
          name: block.blocked.name,
        },
        createdAt: block.createdAt,
      }
    })

  } catch (error) {
    console.error("Block error:", error)
    
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

async function unblockHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { blockedId } = blockSchema.parse(body)

    // Find and delete the block
    const block = await prisma.block.findUnique({
      where: {
        userId_blockedId: {
          userId: session.user.id,
          blockedId: blockedId,
        }
      }
    })

    if (!block) {
      return NextResponse.json(
        { error: "Пользователь не заблокирован" },
        { status: 404 }
      )
    }

    await prisma.block.delete({
      where: { id: block.id }
    })

    return NextResponse.json({
      message: "Пользователь разблокирован"
    })

  } catch (error) {
    console.error("Unblock error:", error)
    
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

// Apply rate limiting to block endpoints
export const POST = withRateLimit(createBlockRateLimit(), blockHandler)
export const DELETE = withRateLimit(createBlockRateLimit(), unblockHandler)
