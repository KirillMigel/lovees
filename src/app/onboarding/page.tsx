"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { onboardingSchema } from "@/lib/validations/auth"
import { toast } from "sonner"
import { UploadButton } from "@uploadthing/react"
import { OurFileRouter } from "@/lib/uploadthing"

const INTERESTS = [
  "Спорт", "Музыка", "Кино", "Путешествия", "Кулинария", "Искусство",
  "Книги", "Фотография", "Танцы", "Йога", "Гейминг", "Программирование",
  "Дизайн", "Мода", "Природа", "Животные", "Кофе", "Чай", "Вино"
]

export default function OnboardingPage() {
  const [formData, setFormData] = useState({
    name: "",
    birthdate: "",
    gender: "" as "MALE" | "FEMALE" | "OTHER" | "",
    city: "",
    interests: [] as string[],
  })
  const [photos, setPhotos] = useState<Array<{ id: string; url: string; isPrimary: boolean }>>([])
  const [location, setLocation] = useState<{ latitude?: number; longitude?: number }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const router = useRouter()

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Геолокация не поддерживается вашим браузером")
      return
    }

    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        toast.success("Местоположение получено")
        setIsGettingLocation(false)
      },
      (error) => {
        toast.error("Не удалось получить местоположение")
        setIsGettingLocation(false)
      }
    )
  }, [])

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handlePhotoUpload = async (url: string) => {
    try {
      const response = await fetch("/api/me/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          url, 
          isPrimary: photos.length === 0 
        }),
      })

      if (!response.ok) {
        throw new Error("Ошибка загрузки фото")
      }

      const { photo } = await response.json()
      setPhotos(prev => [...prev, photo])
      toast.success("Фото загружено")
    } catch (error) {
      toast.error("Ошибка загрузки фото")
    }
  }

  const handleSetPrimaryPhoto = async (photoId: string) => {
    try {
      const response = await fetch(`/api/me/photos/${photoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrimary: true }),
      })

      if (!response.ok) {
        throw new Error("Ошибка обновления фото")
      }

      setPhotos(prev => 
        prev.map(photo => ({
          ...photo,
          isPrimary: photo.id === photoId
        }))
      )
      toast.success("Главное фото обновлено")
    } catch (error) {
      toast.error("Ошибка обновления фото")
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    try {
      const response = await fetch(`/api/me/photos/${photoId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Ошибка удаления фото")
      }

      setPhotos(prev => prev.filter(photo => photo.id !== photoId))
      toast.success("Фото удалено")
    } catch (error) {
      toast.error("Ошибка удаления фото")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const validatedData = onboardingSchema.parse({
        ...formData,
        ...location,
      })

      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Ошибка сохранения профиля")
      }

      toast.success("Профиль создан!")
      router.push("/browse")
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("Произошла ошибка при создании профиля")
      }
    } finally {
      setIsLoading(false)
    }
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
            <CardTitle>Создание профиля</CardTitle>
            <CardDescription>
              Расскажите о себе, чтобы найти идеальные совпадения
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Основная информация</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Имя</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthdate">Дата рождения</Label>
                  <Input
                    id="birthdate"
                    type="date"
                    value={formData.birthdate}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthdate: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Пол</Label>
                  <div className="flex gap-4">
                    {["MALE", "FEMALE", "OTHER"].map((gender) => (
                      <label key={gender} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="gender"
                          value={gender}
                          checked={formData.gender === gender}
                          onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as any }))}
                          disabled={isLoading}
                        />
                        <span className="text-foreground">
                          {gender === "MALE" ? "Мужской" : gender === "FEMALE" ? "Женский" : "Другой"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Город</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Местоположение</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation || isLoading}
                    >
                      {isGettingLocation ? "Получение..." : "Получить автоматически"}
                    </Button>
                    {location.latitude && (
                      <span className="text-sm text-muted-foreground self-center">
                        ✓ Получено
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Интересы</h3>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => (
                    <Badge
                      key={interest}
                      variant={formData.interests.includes(interest) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleInterestToggle(interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Выбрано: {formData.interests.length} интересов
                </p>
              </div>

              {/* Photos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Фотографии</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.url}
                        alt="Profile"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {photo.isPrimary && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                          Главное
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-2">
                          {!photo.isPrimary && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleSetPrimaryPhoto(photo.id)}
                            >
                              Главное
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeletePhoto(photo.id)}
                          >
                            Удалить
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {photos.length < 6 && (
                    <div className="border-2 border-dashed border-border rounded-lg h-32 flex items-center justify-center">
                      <UploadButton<OurFileRouter, "imageUploader">
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                          if (res?.[0]?.url) {
                            handlePhotoUpload(res[0].url)
                          }
                        }}
                        onUploadError={(error: Error) => {
                          toast.error(`Ошибка загрузки: ${error.message}`)
                        }}
                      />
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Загружено: {photos.length}/6 фотографий
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || photos.length === 0}
              >
                {isLoading ? "Создание профиля..." : "Завершить настройку"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}