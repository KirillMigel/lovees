"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { toast } from "sonner"

interface Preferences {
  minAge: number
  maxAge: number
  distanceKm: number
  genders: string[]
}

export default function PreferencesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [preferences, setPreferences] = useState<Preferences>({
    minAge: 18,
    maxAge: 35,
    distanceKm: 50,
    genders: ["MALE", "FEMALE", "OTHER"]
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated") {
      fetchPreferences()
    }
  }, [status, router])

  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/preferences")
      if (!response.ok) {
        throw new Error("Ошибка загрузки предпочтений")
      }
      const { preferences: prefs } = await response.json()
      setPreferences(prefs)
    } catch (error) {
      toast.error("Ошибка загрузки предпочтений")
    }
  }

  const handleGenderToggle = (gender: string) => {
    setPreferences(prev => ({
      ...prev,
      genders: prev.genders.includes(gender)
        ? prev.genders.filter(g => g !== gender)
        : [...prev.genders, gender]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (preferences.genders.length === 0) {
        toast.error("Выберите хотя бы один пол")
        setIsLoading(false)
        return
      }

      if (preferences.minAge > preferences.maxAge) {
        toast.error("Минимальный возраст не может быть больше максимального")
        setIsLoading(false)
        return
      }

      const response = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      })

      if (!response.ok) {
        throw new Error("Ошибка сохранения предпочтений")
      }

      toast.success("Предпочтения сохранены!")
      router.push("/browse")
    } catch (error) {
      toast.error("Ошибка сохранения предпочтений")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
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
          <h1 className="text-2xl font-bold text-foreground">Lovees</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Настройки поиска</CardTitle>
            <CardDescription>
              Настройте параметры поиска подходящих людей
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Age Range */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Возраст</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minAge">От</Label>
                    <input
                      id="minAge"
                      type="number"
                      min="18"
                      max="100"
                      value={preferences.minAge}
                      onChange={(e) => setPreferences(prev => ({ 
                        ...prev, 
                        minAge: parseInt(e.target.value) || 18 
                      }))}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxAge">До</Label>
                    <input
                      id="maxAge"
                      type="number"
                      min="18"
                      max="100"
                      value={preferences.maxAge}
                      onChange={(e) => setPreferences(prev => ({ 
                        ...prev, 
                        maxAge: parseInt(e.target.value) || 35 
                      }))}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Distance */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Расстояние</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="distance">Максимальное расстояние (км)</Label>
                  <input
                    id="distance"
                    type="number"
                    min="1"
                    max="1000"
                    value={preferences.distanceKm}
                    onChange={(e) => setPreferences(prev => ({ 
                      ...prev, 
                      distanceKm: parseInt(e.target.value) || 50 
                    }))}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Пол</h3>
                
                <div className="space-y-2">
                  {[
                    { value: "MALE", label: "Мужчины" },
                    { value: "FEMALE", label: "Женщины" },
                    { value: "OTHER", label: "Другие" }
                  ].map((gender) => (
                    <label key={gender.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={preferences.genders.includes(gender.value)}
                        onChange={() => handleGenderToggle(gender.value)}
                        disabled={isLoading}
                        className="rounded border-input"
                      />
                      <span className="text-foreground">{gender.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Сохранение..." : "Сохранить предпочтения"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
