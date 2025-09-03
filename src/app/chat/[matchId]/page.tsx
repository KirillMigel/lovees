"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { toast } from "sonner"
import { subscribeToMatch, unsubscribeFromMatch } from "@/lib/pusher-client"
import { formatDistanceToNow } from "date-fns"
import { ru } from "date-fns/locale"
import { ArrowLeft, Send } from "lucide-react"

interface Message {
  id: string
  text: string
  createdAt: string
  readAt: string | null
  sender: {
    id: string
    name: string
  }
  isFromMe: boolean
}

interface MatchInfo {
  id: string
  otherUser: {
    id: string
    name: string
    photoUrl: string | null
  }
}

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const matchId = params.matchId as string
  
  const [messages, setMessages] = useState<Message[]>([])
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated" && matchId) {
      fetchMatchInfo()
      fetchMessages()
    }
  }, [status, matchId, router])

  useEffect(() => {
    if (matchId) {
      // Subscribe to Pusher events
      const channel = subscribeToMatch(matchId, {
        onMessage: (data) => {
          setMessages(prev => [...prev, data])
          scrollToBottom()
        },
        onMessageRead: (data) => {
          // Update read status for messages
          setMessages(prev => 
            prev.map(msg => 
              data.messageIds.includes(msg.id) 
                ? { ...msg, readAt: data.readAt }
                : msg
            )
          )
        }
      })

      return () => {
        unsubscribeFromMatch(matchId)
      }
    }
  }, [matchId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchMatchInfo = async () => {
    try {
      const response = await fetch("/api/matches")
      if (!response.ok) throw new Error("Ошибка загрузки мэтчей")
      
      const data = await response.json()
      const match = data.matches.find((m: any) => m.id === matchId)
      
      if (!match) {
        toast.error("Мэтч не найден")
        router.push("/matches")
        return
      }
      
      setMatchInfo({
        id: match.id,
        otherUser: match.otherUser
      })
    } catch (error) {
      toast.error("Ошибка загрузки информации о мэтче")
    }
  }

  const fetchMessages = async (pageNum = 1, append = false) => {
    try {
      const response = await fetch(`/api/messages?matchId=${matchId}&page=${pageNum}&limit=50`)
      
      if (!response.ok) {
        throw new Error("Ошибка загрузки сообщений")
      }

      const data = await response.json()
      
      if (append) {
        setMessages(prev => [...data.messages, ...prev])
      } else {
        setMessages(data.messages)
      }
      
      setHasMore(data.hasMore)
      setPage(pageNum)
    } catch (error) {
      toast.error("Ошибка загрузки сообщений")
    } finally {
      setIsLoading(false)
    }
  }

  const loadMoreMessages = () => {
    if (hasMore && !isLoading) {
      fetchMessages(page + 1, true)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    const messageText = newMessage.trim()
    setNewMessage("")

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          text: messageText
        })
      })

      if (!response.ok) {
        throw new Error("Ошибка отправки сообщения")
      }

      // Message will be added via Pusher event
    } catch (error) {
      toast.error("Ошибка отправки сообщения")
      setNewMessage(messageText) // Restore message text
    } finally {
      setIsSending(false)
    }
  }

  const markMessagesAsRead = async () => {
    try {
      await fetch("/api/messages/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId })
      })
    } catch (error) {
      // Silent fail for read receipts
    }
  }

  // Mark messages as read when component mounts or messages change
  useEffect(() => {
    if (messages.length > 0) {
      markMessagesAsRead()
    }
  }, [messages])

  const formatMessageTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ru 
      })
    } catch {
      return "недавно"
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Загрузка...</div>
      </div>
    )
  }

  if (!matchInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Мэтч не найден</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/matches">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={matchInfo.otherUser.photoUrl || undefined} 
              alt={matchInfo.otherUser.name} 
            />
            <AvatarFallback>
              {matchInfo.otherUser.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h1 className="font-semibold text-foreground">
              {matchInfo.otherUser.name}
            </h1>
          </div>
          
          <ThemeToggle />
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={(e) => {
          const { scrollTop } = e.currentTarget
          if (scrollTop === 0 && hasMore) {
            loadMoreMessages()
          }
        }}
      >
        {hasMore && (
          <div className="text-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={loadMoreMessages}
              disabled={isLoading}
            >
              {isLoading ? "Загрузка..." : "Загрузить еще"}
            </Button>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isFromMe ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.isFromMe
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs opacity-70">
                  {formatMessageTime(message.createdAt)}
                </span>
                {message.isFromMe && (
                  <span className="text-xs opacity-70 ml-2">
                    {message.readAt ? "✓✓" : "✓"}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-border p-4">
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Напишите сообщение..."
            disabled={isSending}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                sendMessage(e)
              }
            }}
          />
          <Button type="submit" disabled={!newMessage.trim() || isSending}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}