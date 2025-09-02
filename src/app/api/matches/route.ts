import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      )
    }

    // Get blocked users first
    const blockedUsers = await prisma.block.findMany({
      where: { userId: session.user.id },
      select: { blockedId: true }
    })
    const blockedUserIds = blockedUsers.map(block => block.blockedId)

    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { userAId: session.user.id },
          { userBId: session.user.id },
        ],
        // Exclude matches with blocked users
        AND: [
          { userAId: { notIn: blockedUserIds } },
          { userBId: { notIn: blockedUserIds } },
        ]
      },
      include: {
        userA: {
          select: {
            id: true,
            name: true,
            photos: {
              where: { isPrimary: true },
              select: { url: true, isPrimary: true },
            },
          },
        },
        userB: {
          select: {
            id: true,
            name: true,
            photos: {
              where: { isPrimary: true },
              select: { url: true, isPrimary: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            text: true,
            createdAt: true,
            senderId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ matches })

  } catch (error) {
    console.error("Get matches error:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
