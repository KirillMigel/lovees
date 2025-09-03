"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { ru } from "date-fns/locale"

interface Match {
  id: string
  otherUser: {
    id: string
    name: string
    photoUrl: string | null
  }
  lastMessage: {
    id: string
    text: string
    createdAt: string
    readAt: string | null
    isFromMe: boolean
  } | null
  createdAt: string
  unreadCount: number
}

export default function MatchesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated") {
      fetchMatches()
    }
  }, [status, router])

  const fetchMatches = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/matches")
      
      if (!response.ok) {
        throw new Error("Ошибка загрузки мэтчей")
      }

      const data = await response.json()
      setMatches(data.matches)
    } catch (error) {
      toast.error("Ошибка загрузки мэтчей")
    } finally {
      setIsLoading(false)
    }
  }

  const formatLastMessageTime = (dateString: string) => {
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Мэтчи</h1>
          <div className="flex items-center gap-4">
            <Link href="/browse">
              <Button variant="outline" size="sm">
                Поиск
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {matches.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Пока нет мэтчей
            </h2>
            <p className="text-muted-foreground mb-6">
              Начните свайпать, чтобы найти интересных людей!
            </p>
            <Link href="/browse">
              <Button>Начать поиск</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <Link key={match.id} href={`/chat/${match.id}`}>
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage 
                          src={match.otherUser.photoUrl || undefined} 
                          alt={match.otherUser.name} 
                        />
                        <AvatarFallback>
                          {match.otherUser.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-foreground truncate">
                            {match.otherUser.name}
                          </h3>
                          {match.lastMessage && (
                            <span className="text-xs text-muted-foreground">
                              {formatLastMessageTime(match.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        
                        {match.lastMessage ? (
                          <p className="text-sm text-muted-foreground truncate">
                            {match.lastMessage.isFromMe && "Вы: "}
                            {match.lastMessage.text}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Начните общение!
                          </p>
                        )}
                      </div>
                      
                      {match.unreadCount > 0 && (
                        <div className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {match.unreadCount}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}