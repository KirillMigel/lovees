import 'server-only'
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const preferencesSchema = z.object({
  minAge: z.number().min(18).max(100),
  maxAge: z.number().min(18).max(100),
  distanceKm: z.number().min(1).max(1000),
  genders: z.array(z.enum(["MALE", "FEMALE", "OTHER"])).min(1)
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const preferences = await prisma.preference.findUnique({
      where: { userId: session.user.id }
    })

    if (!preferences) {
      // Return default preferences if none set
      return NextResponse.json({
        preferences: {
          minAge: 18,
          maxAge: 35,
          distanceKm: 50,
          genders: ["MALE", "FEMALE", "OTHER"]
        }
      })
    }

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error("Get preferences error:", error)
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
    const validatedData = preferencesSchema.parse(body)

    // Validate age range
    if (validatedData.minAge > validatedData.maxAge) {
      return NextResponse.json(
        { error: "Min age cannot be greater than max age" },
        { status: 400 }
      )
    }

    const preferences = await prisma.preference.upsert({
      where: { userId: session.user.id },
      update: validatedData,
      create: {
        userId: session.user.id,
        ...validatedData
      }
    })

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error("Update preferences error:", error)
    
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