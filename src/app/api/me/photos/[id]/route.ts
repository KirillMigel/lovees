import 'server-only'
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const photoId = params.id

    // Check if photo belongs to user
    const photo = await prisma.photo.findFirst({
      where: {
        id: photoId,
        userId: session.user.id
      }
    })

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 })
    }

    // If deleting primary photo, make another photo primary
    if (photo.isPrimary) {
      const otherPhotos = await prisma.photo.findMany({
        where: {
          userId: session.user.id,
          id: { not: photoId }
        },
        orderBy: { createdAt: "asc" },
        take: 1
      })

      if (otherPhotos.length > 0) {
        await prisma.photo.update({
          where: { id: otherPhotos[0].id },
          data: { isPrimary: true }
        })
      }
    }

    // Delete photo
    await prisma.photo.delete({
      where: { id: photoId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete photo error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const photoId = params.id
    const body = await request.json()
    const { isPrimary } = body

    // Check if photo belongs to user
    const photo = await prisma.photo.findFirst({
      where: {
        id: photoId,
        userId: session.user.id
      }
    })

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 })
    }

    if (isPrimary) {
      // Remove primary from other photos
      await prisma.photo.updateMany({
        where: { userId: session.user.id },
        data: { isPrimary: false }
      })

      // Set this photo as primary
      await prisma.photo.update({
        where: { id: photoId },
        data: { isPrimary: true }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update photo error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}