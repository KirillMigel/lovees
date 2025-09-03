import 'server-only'
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { onboardingSchema } from "@/lib/validations/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = onboardingSchema.parse(body)

    // Update user profile
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validatedData.name,
        birthdate: new Date(validatedData.birthdate),
        gender: validatedData.gender,
        city: validatedData.city,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        interests: validatedData.interests,
      },
      include: {
        photos: {
          orderBy: { isPrimary: "desc" }
        }
      }
    })

    // Create default preferences
    await prisma.preference.upsert({
      where: { userId: session.user.id },
      update: {},
      create: {
        userId: session.user.id,
        minAge: 18,
        maxAge: 35,
        distanceKm: 50,
        genders: ["MALE", "FEMALE", "OTHER"]
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Onboarding error:", error)
    
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