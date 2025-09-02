import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withRateLimit, createReportRateLimit } from "@/lib/rate-limit"
import { z } from "zod"

const reportSchema = z.object({
  reportedId: z.string().min(1),
  reason: z.enum(["SPAM", "INAPPROPRIATE_CONTENT", "HARASSMENT", "FAKE_PROFILE", "UNDERAGE", "OTHER"]),
  description: z.string().optional(),
})

async function reportHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { reportedId, reason, description } = reportSchema.parse(body)

    // Check if user is trying to report themselves
    if (reportedId === session.user.id) {
      return NextResponse.json(
        { error: "Нельзя пожаловаться на самого себя" },
        { status: 400 }
      )
    }

    // Check if reported user exists
    const reportedUser = await prisma.user.findUnique({
      where: { id: reportedId },
      select: { id: true, name: true }
    })

    if (!reportedUser) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      )
    }

    // Check if user already reported this person
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: session.user.id,
        reportedId: reportedId,
      }
    })

    if (existingReport) {
      return NextResponse.json(
        { error: "Вы уже жаловались на этого пользователя" },
        { status: 409 }
      )
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        reporterId: session.user.id,
        reportedId: reportedId,
        reason,
        description,
      },
      include: {
        reporter: {
          select: { id: true, name: true, email: true }
        },
        reported: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json({
      message: "Жалоба отправлена",
      report: {
        id: report.id,
        reason: report.reason,
        description: report.description,
        createdAt: report.createdAt,
        reportedUser: {
          id: report.reported.id,
          name: report.reported.name,
        }
      }
    })

  } catch (error) {
    console.error("Report error:", error)
    
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

// Apply rate limiting to report endpoint
export const POST = withRateLimit(createReportRateLimit(), reportHandler)
