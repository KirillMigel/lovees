import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { z } from "zod"

// Импортируем Prisma только если DATABASE_URL установлен
let prisma: any = null
if (process.env.DATABASE_URL) {
  try {
    const { prisma: prismaClient } = require("@/lib/prisma")
    prisma = prismaClient
  } catch (error) {
    console.warn("Prisma not available:", error)
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

const providers = []

// Добавляем Credentials провайдер только если Prisma доступен
if (prisma) {
  providers.push(
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const { email, password } = loginSchema.parse(credentials)
          
          const user = await prisma.user.findUnique({
            where: { email }
          })

          if (!user || !user.passwordHash) {
            return null
          }

          const isValidPassword = await bcrypt.compare(password, user.passwordHash)
          
          if (!isValidPassword) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error) {
          return null
        }
      }
    })
  )
}

// Добавляем Google OAuth только если переменные окружения установлены
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

const handler = NextAuth({
  // Используем Prisma адаптер только если Prisma доступен
  ...(prisma && { adapter: PrismaAdapter(prisma) }),
  providers,
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})

export const { GET, POST } = handler

export const runtime = "nodejs"