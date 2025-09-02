import { NextApiRequest, NextApiResponse } from "next"
import { Server as ServerIO } from "socket.io"
import { Server as NetServer } from "http"
import { NextApiResponseServerIO } from "@/lib/socket"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const SocketHandler = async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (res.socket.server.io) {
    console.log("Socket is already running")
  } else {
    console.log("Socket is initializing")
    const io = new ServerIO(res.socket.server, {
      cors: {
        origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
    })
    res.socket.server.io = io

    // Middleware for authentication
    io.use(async (socket, next) => {
      try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
          return next(new Error("Unauthorized"))
        }
        socket.data.userId = session.user.id
        next()
      } catch (error) {
        next(new Error("Authentication failed"))
      }
    })

    io.on("connection", (socket) => {
      console.log("New client connected:", socket.id, "User:", socket.data.userId)

      // Join match room
      socket.on("join:match", async (data: { matchId: string }) => {
        try {
          const { matchId } = data
          const userId = socket.data.userId

          // Verify user is part of this match
          const match = await prisma.match.findFirst({
            where: {
              id: matchId,
              OR: [
                { userAId: userId },
                { userBId: userId },
              ],
            },
          })

          if (!match) {
            socket.emit("error", { message: "Match not found or access denied" })
            return
          }

          socket.join(`match:${matchId}`)
          console.log(`User ${userId} joined match ${matchId}`)
          
          // Mark messages as read when joining
          await prisma.message.updateMany({
            where: {
              matchId,
              senderId: { not: userId },
              readAt: null,
            },
            data: {
              readAt: new Date(),
            },
          })

          socket.emit("joined:match", { matchId })
        } catch (error) {
          console.error("Error joining match:", error)
          socket.emit("error", { message: "Failed to join match" })
        }
      })

      // Send message
      socket.on("message:send", async (data: { matchId: string; text: string }) => {
        try {
          const { matchId, text } = data
          const userId = socket.data.userId

          // Verify user is part of this match
          const match = await prisma.match.findFirst({
            where: {
              id: matchId,
              OR: [
                { userAId: userId },
                { userBId: userId },
              ],
            },
          })

          if (!match) {
            socket.emit("error", { message: "Match not found or access denied" })
            return
          }

          // Create message in database
          const message = await prisma.message.create({
            data: {
              matchId,
              senderId: userId,
              text,
            },
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          })

          // Broadcast to all users in the match room
          io.to(`match:${matchId}`).emit("message:new", {
            id: message.id,
            text: message.text,
            senderId: message.senderId,
            senderName: message.sender.name,
            createdAt: message.createdAt,
            readAt: message.readAt,
          })

          console.log(`Message sent in match ${matchId} by user ${userId}`)
        } catch (error) {
          console.error("Error sending message:", error)
          socket.emit("error", { message: "Failed to send message" })
        }
      })

      // Mark messages as read
      socket.on("message:read", async (data: { matchId: string }) => {
        try {
          const { matchId } = data
          const userId = socket.data.userId

          // Mark all unread messages in this match as read
          await prisma.message.updateMany({
            where: {
              matchId,
              senderId: { not: userId },
              readAt: null,
            },
            data: {
              readAt: new Date(),
            },
          })

          // Notify other users in the match
          socket.to(`match:${matchId}`).emit("messages:read", {
            matchId,
            readBy: userId,
          })

          console.log(`Messages marked as read in match ${matchId} by user ${userId}`)
        } catch (error) {
          console.error("Error marking messages as read:", error)
        }
      })

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id)
      })
    })
  }
  res.end()
}

export default SocketHandler
