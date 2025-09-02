"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, Loader2 } from "lucide-react"

interface GeolocationProps {
  onLocationUpdate: (lat: number, lng: number, city: string) => void
  initialLat?: number
  initialLng?: number
  initialCity?: string
}

export function Geolocation({
  onLocationUpdate,
  initialLat,
  initialLng,
  initialCity,
}: GeolocationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [location, setLocation] = useState({
    lat: initialLat || 0,
    lng: initialLng || 0,
    city: initialCity || "",
  })

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Геолокация не поддерживается вашим браузером")
      return
    }

    setIsLoading(true)
    setError("")

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        try {
          // Reverse geocoding to get city name
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ru`
          )
          const data = await response.json()
          
          const city = data.city || data.locality || "Неизвестный город"
          
          setLocation({ lat: latitude, lng: longitude, city })
          onLocationUpdate(latitude, longitude, city)
        } catch (error) {
          setError("Не удалось определить город")
          setLocation({ lat: latitude, lng: longitude, city: "Неизвестный город" })
          onLocationUpdate(latitude, longitude, "Неизвестный город")
        }
        
        setIsLoading(false)
      },
      (error) => {
        let errorMessage = "Не удалось получить местоположение"
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Доступ к геолокации запрещен"
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Информация о местоположении недоступна"
            break
          case error.TIMEOUT:
            errorMessage = "Время ожидания истекло"
            break
        }
        
        setError(errorMessage)
        setIsLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Местоположение</h3>
      
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          onClick={getCurrentLocation}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <MapPin className="w-4 h-4 mr-2" />
          )}
          {isLoading ? "Определение местоположения..." : "Определить местоположение"}
        </Button>
        
        {error && (
          <p className="text-destructive text-sm">{error}</p>
        )}
        
        {location.city && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>Город:</strong> {location.city}
            </p>
            <p className="text-xs text-muted-foreground">
              Координаты: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
