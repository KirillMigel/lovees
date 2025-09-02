import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getCdnUrl } from "@/lib/s3"
import { z } from "zod"

const confirmUploadSchema = z.object({
  key: z.string(),
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
    const { key, isPrimary } = confirmUploadSchema.parse(body)

    // Check current photo count
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

    // If this is the first photo, make it primary
    const shouldBePrimary = photoCount === 0 || isPrimary

    // Create photo record
    const photo = await prisma.photo.create({
      data: {
        userId: session.user.id,
        url: getCdnUrl(key),
        isPrimary: shouldBePrimary,
      }
    })

    return NextResponse.json({ photo })

  } catch (error) {
    console.error("Confirm upload error:", error)
    
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
