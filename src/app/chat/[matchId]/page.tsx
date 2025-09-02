"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Send, Circle } from "lucide-react"
import {
  joinMatch,
  sendMessage,
  markMessagesAsRead,
  onMessageNew,
  onJoinedMatch,
  onMessagesRead,
  offMessageNew,
  offJoinedMatch,
  offMessagesRead,
} from "@/lib/socket-client"

interface Message {
  id: string
  text: string
  senderId: string
  senderName: string
  createdAt: string
  readAt: string | null
}

interface Match {
  id: string
  userA: {
    id: string
    name: string
    photos: Array<{ url: string; isPrimary: boolean }>
  }
  userB: {
    id: string
    name: string
    photos: Array<{ url: string; isPrimary: boolean }>
  }
}

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const matchId = params.matchId as string

  const [match, setMatch] = useState<Match | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")
  const [isOnline, setIsOnline] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!session?.user?.id) return

    // Fetch match details
    const fetchMatch = async () => {
      try {
        const response = await fetch("/api/matches")
        if (response.ok) {
          const data = await response.json()
          const foundMatch = data.matches.find((m: Match) => m.id === matchId)
          if (foundMatch) {
            setMatch(foundMatch)
          } else {
            setError("Матч не найден")
          }
        }
      } catch (error) {
        setError("Ошибка загрузки матча")
      }
    }

    // Fetch messages
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages?matchId=${matchId}`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data.messages)
        }
      } catch (error) {
        setError("Ошибка загрузки сообщений")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMatch()
    fetchMessages()

    // Join match room
    joinMatch(matchId)

    // Socket event handlers
    const handleNewMessage = (message: Message) => {
      setMessages(prev => [...prev, message])
    }

    const handleJoinedMatch = () => {
      setIsOnline(true)
    }

    const handleMessagesRead = () => {
      // Update read status for messages
      setMessages(prev => 
        prev.map(msg => 
          msg.senderId !== session?.user?.id ? { ...msg, readAt: new Date().toISOString() } : msg
        )
      )
    }

    onMessageNew(handleNewMessage)
    onJoinedMatch(handleJoinedMatch)
    onMessagesRead(handleMessagesRead)

    // Mark messages as read when component mounts
    markMessagesAsRead(matchId)

    // Mark messages as read when window gains focus
    const handleFocus = () => {
      markMessagesAsRead(matchId)
    }

    window.addEventListener("focus", handleFocus)

    return () => {
      offMessageNew(handleNewMessage)
      offJoinedMatch(handleJoinedMatch)
      offMessagesRead(handleMessagesRead)
      window.removeEventListener("focus", handleFocus)
    }
  }, [matchId, session?.user?.id])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    try {
      sendMessage(matchId, newMessage.trim())
      setNewMessage("")
    } catch (error) {
      setError("Ошибка отправки сообщения")
    } finally {
      setIsSending(false)
    }
  }

  const getMatchPartner = () => {
    if (!match || !session?.user?.id) return null
    return match.userA.id === session.user.id ? match.userB : match.userA
  }

  const partner = getMatchPartner()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Загрузка чата...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => router.back()}>
            Назад
          </Button>
        </div>
      </div>
    )
  }

  if (!match || !partner) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <p className="text-muted-foreground mb-4">Матч не найден</p>
          <Button onClick={() => router.back()}>
            Назад
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-3">
            {partner.photos[0] ? (
              <img
                src={partner.photos[0].url}
                alt={partner.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <span className="text-lg">👤</span>
              </div>
            )}
            
            <div>
              <h1 className="font-semibold">{partner.name}</h1>
              <div className="flex items-center gap-1">
                <Circle 
                  className={`w-2 h-2 ${isOnline ? "fill-green-500 text-green-500" : "fill-gray-400 text-gray-400"}`} 
                />
                <span className="text-xs text-muted-foreground">
                  {isOnline ? "В сети" : "Не в сети"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>Начните общение!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === session?.user?.id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === session?.user?.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.senderId === session?.user?.id
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                }`}>
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {message.senderId === session?.user?.id && message.readAt && (
                    <span className="ml-1">✓✓</span>
                  )}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t bg-card p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Напишите сообщение..."
            className="flex-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isSending}
          />
          <Button type="submit" disabled={!newMessage.trim() || isSending}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
