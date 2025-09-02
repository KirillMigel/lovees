import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const actionSchema = z.object({
  action: z.enum(["ban", "dismiss"]),
  reason: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Доступ запрещен. Требуются права администратора" },
        { status: 403 }
      )
    }

    const reportId = params.id
    const body = await request.json()
    const { action, reason } = actionSchema.parse(body)

    // Find the report
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        reported: {
          select: { id: true, name: true, email: true, isBanned: true }
        }
      }
    })

    if (!report) {
      return NextResponse.json(
        { error: "Репорт не найден" },
        { status: 404 }
      )
    }

    if (action === "ban") {
      // Ban the reported user
      await prisma.user.update({
        where: { id: report.reportedId },
        data: { isBanned: true }
      })

      // Delete all matches for the banned user
      await prisma.match.deleteMany({
        where: {
          OR: [
            { userAId: report.reportedId },
            { userBId: report.reportedId },
          ]
        }
      })

      // Delete all messages from the banned user
      await prisma.message.deleteMany({
        where: { senderId: report.reportedId }
      })

      return NextResponse.json({
        message: "Пользователь забанен",
        action: "ban",
        user: {
          id: report.reported.id,
          name: report.reported.name,
          email: report.reported.email,
        }
      })

    } else if (action === "dismiss") {
      // Just dismiss the report (no action taken)
      return NextResponse.json({
        message: "Репорт отклонен",
        action: "dismiss",
        user: {
          id: report.reported.id,
          name: report.reported.name,
          email: report.reported.email,
        }
      })
    }

  } catch (error) {
    console.error("Report action error:", error)
    
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
