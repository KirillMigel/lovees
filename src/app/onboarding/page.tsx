"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { PhotoUpload } from "@/components/photo-upload"
import { Geolocation } from "@/components/geolocation"
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/auth"

const INTERESTS = [
  "Спорт", "Музыка", "Кино", "Путешествия", "Кулинария", "Искусство",
  "Книги", "Фотография", "Танцы", "Игры", "Технологии", "Природа",
  "Мода", "Животные", "Йога", "Фитнес", "Театр", "Наука"
]

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [photos, setPhotos] = useState<Array<{ id: string; url: string; isPrimary: boolean }>>([])
  const [location, setLocation] = useState({ lat: 0, lng: 0, city: "" })
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
  })

  const selectedInterests = watch("interests") || []

  const handleInterestToggle = (interest: string) => {
    const current = selectedInterests
    const updated = current.includes(interest)
      ? current.filter(i => i !== interest)
      : [...current, interest]
    setValue("interests", updated)
  }

  const handlePhotoAdd = (photo: { id: string; url: string; isPrimary: boolean }) => {
    setPhotos([...photos, photo])
  }

  const handlePhotoRemove = (id: string) => {
    const updatedPhotos = photos.filter(photo => photo.id !== id)
    // If we removed the primary photo, make the first remaining photo primary
    if (updatedPhotos.length > 0 && photos.find(p => p.id === id)?.isPrimary) {
      updatedPhotos[0].isPrimary = true
    }
    setPhotos(updatedPhotos)
  }

  const handlePhotoSetPrimary = (id: string) => {
    const updatedPhotos = photos.map(photo => ({
      ...photo,
      isPrimary: photo.id === id
    }))
    setPhotos(updatedPhotos)
  }

  const handleLocationUpdate = (lat: number, lng: number, city: string) => {
    setLocation({ lat, lng, city })
    setValue("lat", lat)
    setValue("lng", lng)
    setValue("city", city)
  }

  const onSubmit = async (data: OnboardingInput) => {
    if (photos.length === 0) {
      setError("Добавьте хотя бы одну фотографию")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Submit onboarding data
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Произошла ошибка при сохранении данных")
        return
      }

      // Photos are already uploaded and saved to database via the upload component

      router.push("/")
    } catch (error) {
      setError("Произошла ошибка при сохранении данных")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Завершите настройку профиля</h1>
          <p className="text-muted-foreground mt-2">
            Расскажите о себе, чтобы найти идеальные совпадения
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Основная информация</h2>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Имя *
              </label>
              <input
                {...register("name")}
                type="text"
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Ваше имя"
              />
              {errors.name && (
                <p className="text-destructive text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="birthdate" className="block text-sm font-medium mb-2">
                Дата рождения *
              </label>
              <input
                {...register("birthdate")}
                type="date"
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.birthdate && (
                <p className="text-destructive text-sm mt-1">{errors.birthdate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Пол *</label>
              <div className="flex gap-4">
                {["MALE", "FEMALE", "OTHER"].map((gender) => (
                  <label key={gender} className="flex items-center">
                    <input
                      {...register("gender")}
                      type="radio"
                      value={gender}
                      className="mr-2"
                    />
                    {gender === "MALE" && "Мужской"}
                    {gender === "FEMALE" && "Женский"}
                    {gender === "OTHER" && "Другой"}
                  </label>
                ))}
              </div>
              {errors.gender && (
                <p className="text-destructive text-sm mt-1">{errors.gender.message}</p>
              )}
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Интересы *</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`p-2 rounded-lg border text-sm transition-colors ${
                    selectedInterests.includes(interest)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-input hover:bg-muted"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
            {errors.interests && (
              <p className="text-destructive text-sm">{errors.interests.message}</p>
            )}
          </div>

          {/* Location */}
          <Geolocation
            onLocationUpdate={handleLocationUpdate}
            initialLat={location.lat}
            initialLng={location.lng}
            initialCity={location.city}
          />

          {/* Photos */}
          <PhotoUpload
            photos={photos}
            onPhotoAdd={handlePhotoAdd}
            onPhotoRemove={handlePhotoRemove}
            onPhotoSetPrimary={handlePhotoSetPrimary}
            maxPhotos={6}
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? "Сохранение..." : "Завершить настройку"}
          </Button>
        </form>
      </div>
    </div>
  )
}
