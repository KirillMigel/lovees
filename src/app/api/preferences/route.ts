import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const preferencesSchema = z.object({
  minAge: z.number().min(18).max(100),
  maxAge: z.number().min(18).max(100),
  distanceKm: z.number().min(1).max(1000),
  genders: z.array(z.enum(["MALE", "FEMALE", "OTHER"])).min(1),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      )
    }

    const preferences = await prisma.preference.findUnique({
      where: { userId: session.user.id }
    })

    return NextResponse.json({ preferences })

  } catch (error) {
    console.error("Get preferences error:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}

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
    const { minAge, maxAge, distanceKm, genders } = preferencesSchema.parse(body)

    if (minAge > maxAge) {
      return NextResponse.json(
        { error: "Минимальный возраст не может быть больше максимального" },
        { status: 400 }
      )
    }

    const preferences = await prisma.preference.upsert({
      where: { userId: session.user.id },
      update: {
        minAge,
        maxAge,
        distanceKm,
        genders,
      },
      create: {
        userId: session.user.id,
        minAge,
        maxAge,
        distanceKm,
        genders,
      },
    })

    return NextResponse.json({ preferences })

  } catch (error) {
    console.error("Update preferences error:", error)
    
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
