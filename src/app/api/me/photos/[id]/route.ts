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
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      )
    }

    const photo = await prisma.photo.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!photo) {
      return NextResponse.json(
        { error: "Фотография не найдена" },
        { status: 404 }
      )
    }

    await prisma.photo.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Фотография удалена" })

  } catch (error) {
    console.error("Delete photo error:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
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
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { isPrimary } = body

    const photo = await prisma.photo.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!photo) {
      return NextResponse.json(
        { error: "Фотография не найдена" },
        { status: 404 }
      )
    }

    // If setting as primary, unset all other primary photos
    if (isPrimary) {
      await prisma.photo.updateMany({
        where: { userId: session.user.id },
        data: { isPrimary: false }
      })
    }

    const updatedPhoto = await prisma.photo.update({
      where: { id: params.id },
      data: { isPrimary }
    })

    return NextResponse.json({ photo: updatedPhoto })

  } catch (error) {
    console.error("Update photo error:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
