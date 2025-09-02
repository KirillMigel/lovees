import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generatePresignedUrl, generateFileKey } from "@/lib/s3"
import { z } from "zod"

const presignedRequestSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().regex(/^image\/(jpeg|jpg|png|webp)$/),
  fileSize: z.number().min(1).max(5 * 1024 * 1024), // 5MB max
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
    const { filename, contentType, fileSize } = presignedRequestSchema.parse(body)

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

    // Generate unique file key
    const key = generateFileKey(session.user.id, filename)

    // Generate presigned URL
    const presignedUrl = await generatePresignedUrl(key, contentType, 3600) // 1 hour

    return NextResponse.json({
      presignedUrl,
      key,
      expiresIn: 3600,
    })

  } catch (error) {
    console.error("Generate presigned URL error:", error)
    
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
