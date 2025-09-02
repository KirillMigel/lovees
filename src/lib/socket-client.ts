import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

export const getSocket = () => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000", {
      withCredentials: true,
      transports: ["websocket", "polling"],
    })

    socket.on("connect", () => {
      console.log("Socket connected:", socket?.id)
    })

    socket.on("disconnect", () => {
      console.log("Socket disconnected")
    })

    socket.on("error", (error) => {
      console.error("Socket error:", error)
    })
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// Chat-specific socket functions
export const joinMatch = (matchId: string) => {
  const socket = getSocket()
  socket.emit("join:match", { matchId })
}

export const sendMessage = (matchId: string, text: string) => {
  const socket = getSocket()
  socket.emit("message:send", { matchId, text })
}

export const markMessagesAsRead = (matchId: string) => {
  const socket = getSocket()
  socket.emit("message:read", { matchId })
}

export const onMessageNew = (callback: (message: any) => void) => {
  const socket = getSocket()
  socket.on("message:new", callback)
}

export const onJoinedMatch = (callback: (data: any) => void) => {
  const socket = getSocket()
  socket.on("joined:match", callback)
}

export const onMessagesRead = (callback: (data: any) => void) => {
  const socket = getSocket()
  socket.on("messages:read", callback)
}

export const offMessageNew = (callback: (message: any) => void) => {
  const socket = getSocket()
  socket.off("message:new", callback)
}

export const offJoinedMatch = (callback: (data: any) => void) => {
  const socket = getSocket()
  socket.off("joined:match", callback)
}

export const offMessagesRead = (callback: (data: any) => void) => {
  const socket = getSocket()
  socket.off("messages:read", callback)
}
