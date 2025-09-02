import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const addPhotoSchema = z.object({
  url: z.string().url(),
  isPrimary: z.boolean().optional().default(false),
})

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
    const { url, isPrimary } = addPhotoSchema.parse(body)

    // Check if user already has 6 photos
    const photoCount = await prisma.photo.count({
      where: { userId: session.user.id }
    })

    if (photoCount >= 6) {
      return NextResponse.json(
        { error: "Максимум 6 фотографий" },
        { status: 400 }
      )
    }

    // If this is set as primary, unset all other primary photos
    if (isPrimary) {
      await prisma.photo.updateMany({
        where: { userId: session.user.id },
        data: { isPrimary: false }
      })
    }

    const photo = await prisma.photo.create({
      data: {
        userId: session.user.id,
        url,
        isPrimary,
      }
    })

    return NextResponse.json({ photo })

  } catch (error) {
    console.error("Add photo error:", error)
    
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

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      )
    }

    const photos = await prisma.photo.findMany({
      where: { userId: session.user.id },
      orderBy: { isPrimary: 'desc' }
    })

    return NextResponse.json({ photos })

  } catch (error) {
    console.error("Get photos error:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
