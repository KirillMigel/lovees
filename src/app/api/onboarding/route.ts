import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { onboardingSchema } from "@/lib/validations/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, birthdate, gender, interests, city, lat, lng } = onboardingSchema.parse(body)

    // Update user profile
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        birthdate: new Date(birthdate),
        gender,
        interests,
        city,
        lat,
        lng,
      },
      select: {
        id: true,
        name: true,
        birthdate: true,
        gender: true,
        interests: true,
        city: true,
        lat: true,
        lng: true,
      }
    })

    return NextResponse.json({ user })

  } catch (error) {
    console.error("Onboarding error:", error)
    
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
