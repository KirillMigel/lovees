"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { profileUpdateSchema } from "@/lib/validations/auth"
import { toast } from "sonner"
import { UploadButton } from "@uploadthing/react"
import { OurFileRouter } from "@/lib/uploadthing"

const INTERESTS = [
  "Спорт", "Музыка", "Кино", "Путешествия", "Кулинария", "Искусство",
  "Книги", "Фотография", "Танцы", "Йога", "Гейминг", "Программирование",
  "Дизайн", "Мода", "Природа", "Животные", "Кофе", "Чай", "Вино"
]

interface User {
  id: string
  name: string
  email: string
  bio?: string
  city: string
  latitude?: number
  longitude?: number
  interests: string[]
  photos: Array<{ id: string; url: string; isPrimary: boolean }>
}

export default function ProfileSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    bio: "",
    city: "",
    interests: [] as string[],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated") {
      fetchUserProfile()
    }
  }, [status, router])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/me")
      if (!response.ok) {
        throw new Error("Ошибка загрузки профиля")
      }
      const { user: userData } = await response.json()
      setUser(userData)
      setFormData({
        bio: userData.bio || "",
        city: userData.city || "",
        interests: userData.interests || [],
      })
    } catch (error) {
      toast.error("Ошибка загрузки профиля")
    }
  }

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Геолокация не поддерживается вашим браузером")
      return
    }

    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch("/api/me", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }),
          })

          if (!response.ok) {
            throw new Error("Ошибка обновления местоположения")
          }

          toast.success("Местоположение обновлено")
          fetchUserProfile()
        } catch (error) {
          toast.error("Ошибка обновления местоположения")
        } finally {
          setIsGettingLocation(false)
        }
      },
      (error) => {
        toast.error("Не удалось получить местоположение")
        setIsGettingLocation(false)
      }
    )
  }

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
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error("Ошибка загрузки фото")
      }

      toast.success("Фото загружено")
      fetchUserProfile()
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

      toast.success("Главное фото обновлено")
      fetchUserProfile()
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

      toast.success("Фото удалено")
      fetchUserProfile()
    } catch (error) {
      toast.error("Ошибка удаления фото")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const validatedData = profileUpdateSchema.parse(formData)

      const response = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Ошибка обновления профиля")
      }

      toast.success("Профиль обновлен!")
      fetchUserProfile()
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("Произошла ошибка при обновлении профиля")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-foreground">Загрузка...</div>
    </div>
  }

  if (!user) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-foreground">Профиль не найден</div>
    </div>
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
            <CardTitle>Настройки профиля</CardTitle>
            <CardDescription>
              Обновите информацию о себе
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Основная информация</h3>
                
                <div className="space-y-2">
                  <Label>Имя</Label>
                  <Input value={user.name} disabled />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user.email} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">О себе</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Расскажите о себе..."
                    disabled={isLoading}
                    maxLength={500}
                  />
                  <p className="text-sm text-muted-foreground">
                    {formData.bio.length}/500 символов
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Город</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
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
                      {isGettingLocation ? "Получение..." : "Обновить местоположение"}
                    </Button>
                    {user.latitude && (
                      <span className="text-sm text-muted-foreground self-center">
                        ✓ Обновлено
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
                  {user.photos.map((photo) => (
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
                  
                  {user.photos.length < 6 && (
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
                  Загружено: {user.photos.length}/6 фотографий
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Сохранение..." : "Сохранить изменения"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
