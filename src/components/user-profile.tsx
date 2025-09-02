"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Edit, MapPin, Calendar, Heart } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  birthdate: string
  gender: string
  bio?: string
  city: string
  interests: string[]
  photos: Array<{
    id: string
    url: string
    isPrimary: boolean
  }>
}

export function UserProfile() {
  const { data: session } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserProfile()
    }
  }, [session])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Загрузка профиля...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Профиль не найден</p>
      </div>
    )
  }

  const primaryPhoto = user.photos.find(photo => photo.isPrimary)
  const age = new Date().getFullYear() - new Date(user.birthdate).getFullYear()

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {primaryPhoto && (
              <img
                src={primaryPhoto.url}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">{age} лет</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Редактировать
          </Button>
        </div>

        {user.bio && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">О себе</h3>
            <p className="text-muted-foreground">{user.bio}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{user.city}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {user.gender === "MALE" && "Мужской"}
              {user.gender === "FEMALE" && "Женский"}
              {user.gender === "OTHER" && "Другой"}
            </span>
          </div>
        </div>

        {user.interests.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Интересы
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {user.photos.length > 1 && (
          <div>
            <h3 className="font-semibold mb-2">Фотографии</h3>
            <div className="grid grid-cols-3 gap-2">
              {user.photos
                .filter(photo => !photo.isPrimary)
                .slice(0, 5)
                .map((photo) => (
                  <img
                    key={photo.id}
                    src={photo.url}
                    alt="Profile"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
