import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const deleteAccountSchema = z.object({
  confirmation: z.literal("DELETE_ACCOUNT"),
  password: z.string().min(1, "Пароль обязателен"),
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
    const { confirmation, password } = deleteAccountSchema.parse(body)

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        name: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      )
    }

    // Verify password for non-OAuth users
    if (user.passwordHash) {
      const bcrypt = await import("bcryptjs")
      const isValidPassword = await bcrypt.compare(password, user.passwordHash)
      
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Неверный пароль" },
          { status: 400 }
        )
      }
    }

    // Start transaction for cascading deletion
    await prisma.$transaction(async (tx) => {
      // Delete all user's photos from S3 (if needed)
      const photos = await tx.photo.findMany({
        where: { userId: user.id },
        select: { url: true }
      })

      // Note: In a real app, you might want to delete files from S3 here
      // For now, we'll just delete the database records

      // Delete all user data (cascading deletes will handle related records)
      await tx.user.delete({
        where: { id: user.id }
      })
    })

    return NextResponse.json({
      message: "Аккаунт успешно удален",
      deletedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error("Delete account error:", error)
    
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
