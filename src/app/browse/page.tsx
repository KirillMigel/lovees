"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { SwipeCard } from "@/components/swipe-card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ThemeToggle } from "@/components/theme-toggle"
import { toast } from "sonner"

interface Candidate {
  id: string
  name: string
  age: number
  city: string
  primaryPhotoUrl: string | null
  interests: string[]
  distanceKm: number
}

export default function BrowsePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showMatchDialog, setShowMatchDialog] = useState(false)
  const [matchedUser, setMatchedUser] = useState<Candidate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSwiping, setIsSwiping] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated") {
      fetchCandidates()
    }
  }, [status, router])

  const fetchCandidates = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/browse")
      
      if (!response.ok) {
        if (response.status === 400) {
          const data = await response.json()
          if (data.error === "Preferences not set") {
            toast.error("Сначала настройте предпочтения поиска")
            router.push("/settings/preferences")
            return
          }
          if (data.error === "Location not set") {
            toast.error("Сначала укажите ваше местоположение")
            router.push("/settings/profile")
            return
          }
        }
        throw new Error("Ошибка загрузки кандидатов")
      }

      const data = await response.json()
      setCandidates(data.candidates)
    } catch (error) {
      toast.error("Ошибка загрузки кандидатов")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwipe = async (direction: "LEFT" | "RIGHT" | "SUPER") => {
    if (isSwiping || currentIndex >= candidates.length) return

    setIsSwiping(true)
    const currentCandidate = candidates[currentIndex]

    try {
      const response = await fetch("/api/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetId: currentCandidate.id,
          direction: direction
        })
      })

      if (!response.ok) {
        if (response.status === 429) {
          const data = await response.json()
          toast.error(`Лимит свайпов исчерпан. Осталось: ${data.remaining}`)
        } else {
          throw new Error("Ошибка свайпа")
        }
      } else {
        const data = await response.json()

        if (data.matchCreated) {
          setMatchedUser(currentCandidate)
          setShowMatchDialog(true)
        }

        setCurrentIndex(prev => prev + 1)
      }
    } catch (error) {
      toast.error("Ошибка свайпа")
    } finally {
      setIsSwiping(false)
    }
  }

  const handleReport = async (userId: string) => {
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportedId: userId,
          reason: "OTHER",
          description: "Пользователь пожаловался через интерфейс"
        })
      })

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Слишком много жалоб. Попробуйте позже.")
        } else {
          throw new Error("Ошибка отправки жалобы")
        }
      } else {
        toast.success("Жалоба отправлена")
        setCurrentIndex(prev => prev + 1)
      }
    } catch (error) {
      toast.error("Ошибка отправки жалобы")
    }
  }

  const handleBlock = async (userId: string) => {
    try {
      const response = await fetch("/api/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      })

      if (!response.ok) {
        throw new Error("Ошибка блокировки")
      }

      toast.success("Пользователь заблокирован")
      setCurrentIndex(prev => prev + 1)
    } catch (error) {
      toast.error("Ошибка блокировки")
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (isSwiping) return
    
    if (event.key === "ArrowLeft") {
      handleSwipe("LEFT")
    } else if (event.key === "ArrowRight") {
      handleSwipe("RIGHT")
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Загрузка...</div>
      </div>
    )
  }

  const currentCandidate = candidates[currentIndex]

  if (!currentCandidate) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-foreground">Lovees</h1>
            <ThemeToggle />
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Больше никого нет поблизости
            </h2>
            <p className="text-muted-foreground">
              Попробуйте изменить настройки поиска
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background" onKeyDown={handleKeyPress} tabIndex={0}>
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Lovees</h1>
          <ThemeToggle />
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-sm mx-auto">
          <AnimatePresence>
            <SwipeCard
              key={currentCandidate.id}
              user={{
                id: currentCandidate.id,
                name: currentCandidate.name,
                age: currentCandidate.age,
                city: currentCandidate.city,
                interests: currentCandidate.interests,
                photoUrl: currentCandidate.primaryPhotoUrl || "https://via.placeholder.com/400x600?text=No+Photo"
              }}
              onSwipe={handleSwipe}
              onReport={handleReport}
              onBlock={handleBlock}
            />
          </AnimatePresence>
          
          {/* Action buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleSwipe("LEFT")}
              className="w-16 h-16 rounded-full"
              disabled={isSwiping}
            >
              ✖
            </Button>
            <Button
              variant="default"
              size="lg"
              onClick={() => handleSwipe("RIGHT")}
              className="w-16 h-16 rounded-full"
              disabled={isSwiping}
            >
              ❤
            </Button>
          </div>
          
          <p className="text-center text-sm text-muted-foreground mt-4">
            Используйте клавиши ← → или кнопки для свайпа
          </p>
        </div>
      </main>

      {/* Match Dialog */}
      <Dialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              🎉 Это взаимность!
            </DialogTitle>
            <DialogDescription className="text-center">
              Вы понравились {matchedUser?.name}!
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Теперь вы можете начать общение
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setShowMatchDialog(false)}>
                Продолжить поиск
              </Button>
              <Button 
                variant="default"
                onClick={() => {
                  setShowMatchDialog(false)
                  // Navigate to chat
                  window.location.href = `/chat/${matchedUser?.id}`
                }}
              >
                Написать
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}