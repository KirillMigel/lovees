import 'server-only'
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkRateLimit } from "@/lib/rate-limit"
import { z } from "zod"

const reportSchema = z.object({
  reportedId: z.string().min(1, "Reported user ID is required"),
  reason: z.enum(["SPAM", "INAPPROPRIATE_CONTENT", "HARASSMENT", "FAKE_PROFILE", "UNDERAGE", "OTHER"], {
    errorMap: () => ({ message: "Invalid report reason" })
  }),
  description: z.string().max(500, "Description too long").optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { reportedId, reason, description } = reportSchema.parse(body)

    // Check rate limit
    const rateLimit = await checkRateLimit(session.user.id, 'report')
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

    // Check if user is trying to report themselves
    if (session.user.id === reportedId) {
      return NextResponse.json(
        { error: "Cannot report yourself" },
        { status: 400 }
      )
    }

    // Check if reported user exists
    const reportedUser = await prisma.user.findUnique({
      where: { id: reportedId },
      select: { id: true, isBanned: true }
    })

    if (!reportedUser) {
      return NextResponse.json(
        { error: "Reported user not found" },
        { status: 404 }
      )
    }

    // Check if user already reported this person
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: session.user.id,
        reportedId: reportedId
      }
    })

    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this user" },
        { status: 400 }
      )
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        reporterId: session.user.id,
        reportedId: reportedId,
        reason: reason,
        description: description
      }
    })

    // Auto-ban for certain serious reasons
    if (["HARASSMENT", "UNDERAGE", "INAPPROPRIATE_CONTENT"].includes(reason)) {
      await prisma.user.update({
        where: { id: reportedId },
        data: { isBanned: true }
      })
    }

    return NextResponse.json({ 
      report: {
        id: report.id,
        reason: report.reason,
        createdAt: report.createdAt
      }
    })
  } catch (error) {
    console.error("Report error:", error)
    
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