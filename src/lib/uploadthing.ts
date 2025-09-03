import 'server-only'
import { createUploadthing, type FileRouter } from "uploadthing/next"
import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { prisma } from "./prisma"

const f = createUploadthing()

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "5MB", maxFileCount: 6 } })
    .middleware(async ({ req }) => {
      const session = await getServerSession(authOptions)
      
      if (!session?.user?.id) {
        throw new Error("Unauthorized")
      }

      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Создаем запись Photo в базе данных
      const photo = await prisma.photo.create({
        data: {
          url: file.url,
          userId: metadata.userId,
          isPrimary: false, // Будет обновлено отдельно
        },
      })

      return { url: file.url, photoId: photo.id }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter