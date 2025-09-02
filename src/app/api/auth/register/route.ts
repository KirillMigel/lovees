import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { registerSchema } from "@/lib/validations/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: "", // Will be filled during onboarding
        birthdate: new Date(), // Will be updated during onboarding
        gender: "OTHER", // Will be updated during onboarding
        city: "", // Will be filled during onboarding
        lat: 0,
        lng: 0,
        interests: [],
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      }
    })

    return NextResponse.json({
      message: "Пользователь успешно создан",
      user
    })

  } catch (error) {
    console.error("Registration error:", error)
    
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
