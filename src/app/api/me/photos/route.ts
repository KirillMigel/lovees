import 'server-only'
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const addPhotoSchema = z.object({
  url: z.string().url(),
  isPrimary: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { url, isPrimary = false } = addPhotoSchema.parse(body)

    // Check photo count limit
    const photoCount = await prisma.photo.count({
      where: { userId: session.user.id }
    })

    if (photoCount >= 6) {
      return NextResponse.json(
        { error: "Максимум 6 фотографий" },
        { status: 400 }
      )
    }

    // If this is the first photo or explicitly set as primary, make it primary
    const shouldBePrimary = photoCount === 0 || isPrimary

    if (shouldBePrimary) {
      // Remove primary from other photos
      await prisma.photo.updateMany({
        where: { userId: session.user.id },
        data: { isPrimary: false }
      })
    }

    const photo = await prisma.photo.create({
      data: {
        url,
        userId: session.user.id,
        isPrimary: shouldBePrimary,
      }
    })

    return NextResponse.json({ photo }, { status: 201 })
  } catch (error) {
    console.error("Add photo error:", error)
    
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