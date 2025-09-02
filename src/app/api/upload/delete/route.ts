import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { deleteFile } from "@/lib/s3"
import { z } from "zod"

const deletePhotoSchema = z.object({
  photoId: z.string(),
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
    const { photoId } = deletePhotoSchema.parse(body)

    // Find the photo
    const photo = await prisma.photo.findUnique({
      where: { id: photoId }
    })

    if (!photo || photo.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Фото не найдено или нет доступа" },
        { status: 404 }
      )
    }

    // Extract key from URL (assuming URL format: https://domain.com/photos/userId/timestamp-random.jpg)
    const url = new URL(photo.url)
    const key = url.pathname.substring(1) // Remove leading slash

    // Delete from S3
    try {
      await deleteFile(key)
    } catch (s3Error) {
      console.error("S3 delete error:", s3Error)
      // Continue with database deletion even if S3 deletion fails
    }

    // Check if this is the primary photo
    const isPrimary = photo.isPrimary

    // Delete from database
    await prisma.photo.delete({
      where: { id: photoId }
    })

    // If we deleted the primary photo, set another photo as primary
    if (isPrimary) {
      const remainingPhotos = await prisma.photo.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "asc" },
        take: 1
      })

      if (remainingPhotos.length > 0) {
        await prisma.photo.update({
          where: { id: remainingPhotos[0].id },
          data: { isPrimary: true }
        })
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Delete photo error:", error)
    
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
