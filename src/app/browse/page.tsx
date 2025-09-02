"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SwipeCard } from "@/components/swipe-card"
import { MatchModal } from "@/components/match-modal"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw, Settings } from "lucide-react"

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
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isSwiping, setIsSwiping] = useState(false)
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [matchedCandidate, setMatchedCandidate] = useState<Candidate | null>(null)
  const router = useRouter()

  const fetchCandidates = async () => {
    setIsLoading(true)
    setError("")
    
    try {
      const response = await fetch("/api/browse")
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || "Ошибка загрузки кандидатов")
        return
      }
      
      setCandidates(data.candidates)
      setCurrentIndex(0)
    } catch (error) {
      setError("Ошибка загрузки кандидатов")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCandidates()
  }, [])

  const handleSwipe = async (direction: "LEFT" | "RIGHT" | "SUPER") => {
    if (isSwiping || currentIndex >= candidates.length) return
    
    setIsSwiping(true)
    const candidate = candidates[currentIndex]
    
    try {
      const response = await fetch("/api/swipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetId: candidate.id,
          direction,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || "Ошибка отправки свайпа")
        return
      }
      
      // Handle match
      if (data.matchCreated) {
        setMatchedCandidate(candidate)
        setShowMatchModal(true)
      }
      
      // Remove swiped candidate from the list
      setCandidates(prev => prev.filter(c => c.id !== candidate.id))
      
      // If we removed the current candidate, don't increment index
      // If we're at the end, the component will handle showing "no more candidates"
      
    } catch (error) {
      setError("Ошибка отправки свайпа")
    } finally {
      setIsSwiping(false)
    }
  }

  const handleCloseMatchModal = () => {
    setShowMatchModal(false)
    setMatchedCandidate(null)
  }

  const handleStartChat = () => {
    setShowMatchModal(false)
    setMatchedCandidate(null)
    router.push("/matches")
  }

  const currentCandidate = candidates[currentIndex]
  const hasMoreCandidates = currentIndex < candidates.length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка кандидатов...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchCandidates}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Попробовать снова
          </Button>
        </div>
      </div>
    )
  }

  if (!hasMoreCandidates) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
            <h1 className="text-xl font-bold">Просмотр</h1>
            <Button variant="ghost" onClick={() => router.push("/settings")}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </header>
        
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">Поздравляем!</h2>
            <p className="text-muted-foreground mb-6">
              Вы просмотрели всех доступных кандидатов. Проверьте свои матчи или обновите предпочтения.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={fetchCandidates}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Обновить
              </Button>
              <Button variant="outline" onClick={() => router.push("/matches")}>
                Мои матчи
              </Button>
            </div>
          </div>
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
          <h1 className="text-xl font-bold">
            {currentIndex + 1} из {candidates.length}
          </h1>
          <Button variant="ghost" onClick={() => router.push("/settings")}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-sm mx-auto">
          <SwipeCard
            candidate={currentCandidate}
            onSwipe={handleSwipe}
          />
          
          {/* Instructions */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p className="mb-2">Используйте кнопки или свайпы:</p>
            <div className="flex justify-center gap-6">
              <div className="flex items-center gap-1">
                <span className="text-red-500">❌</span>
                <span>Нет</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">⭐</span>
                <span>Супер</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-green-500">❤️</span>
                <span>Да</span>
              </div>
            </div>
            <p className="mt-2">Или используйте клавиши ← → ↑</p>
          </div>
        </div>
      </main>

      {/* Match Modal */}
      <MatchModal
        isOpen={showMatchModal}
        onClose={handleCloseMatchModal}
        onStartChat={handleStartChat}
        candidateName={matchedCandidate?.name || ""}
        candidatePhoto={matchedCandidate?.primaryPhotoUrl || undefined}
      />
    </div>
  )
}
