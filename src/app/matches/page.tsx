"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { MatchCard } from "@/components/match-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Heart, MessageCircle } from "lucide-react"

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
  createdAt: string
  messages: Array<{
    id: string
    text: string
    createdAt: string
    senderId: string
  }>
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      const response = await fetch("/api/matches")
      if (response.ok) {
        const data = await response.json()
        setMatches(data.matches || [])
      } else {
        setError("Ошибка загрузки матчей")
      }
    } catch (error) {
      setError("Ошибка загрузки матчей")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartChat = (matchId: string) => {
    // Navigate to chat page (to be implemented)
    router.push(`/chat/${matchId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-8 h-8 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Загрузка матчей...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchMatches}>
            Попробовать снова
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          <h1 className="text-xl font-bold">Мои матчи</h1>
          <div></div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {matches.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💔</div>
            <h2 className="text-2xl font-bold mb-2">Пока нет матчей</h2>
            <p className="text-muted-foreground mb-6">
              Продолжайте просматривать кандидатов, чтобы найти идеальные совпадения!
            </p>
            <Button size="lg" onClick={() => router.push("/browse")}>
              Начать просмотр
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {matches.length} матч{matches.length === 1 ? "" : matches.length < 5 ? "а" : "ей"}
              </h2>
              <Button variant="outline" size="sm" onClick={() => router.push("/browse")}>
                Найти еще
              </Button>
            </div>
            
            <div className="space-y-3">
              {matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  currentUserId={session?.user?.id || ""}
                  onStartChat={handleStartChat}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
