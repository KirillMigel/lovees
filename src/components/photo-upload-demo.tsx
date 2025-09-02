"use client"

import { useState } from "react"
import { PhotoUpload } from "./photo-upload"
import { Button } from "./ui/button"

export function PhotoUploadDemo() {
  const [photos, setPhotos] = useState<Array<{ id: string; url: string; isPrimary: boolean }>>([])

  const handlePhotoAdd = (photo: { id: string; url: string; isPrimary: boolean }) => {
    setPhotos(prev => [...prev, photo])
  }

  const handlePhotoRemove = (id: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== id))
  }

  const handlePhotoSetPrimary = (id: string) => {
    setPhotos(prev => 
      prev.map(photo => ({
        ...photo,
        isPrimary: photo.id === id
      }))
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Демо загрузки фото в S3</h1>
      
      <PhotoUpload
        photos={photos}
        onPhotoAdd={handlePhotoAdd}
        onPhotoRemove={handlePhotoRemove}
        onPhotoSetPrimary={handlePhotoSetPrimary}
      />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Загруженные фото:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="border rounded-lg p-4 space-y-2">
              <img
                src={photo.url}
                alt="Uploaded"
                className="w-full h-48 object-cover rounded"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {photo.isPrimary ? "Основное фото" : "Дополнительное"}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePhotoSetPrimary(photo.id)}
                  disabled={photo.isPrimary}
                >
                  {photo.isPrimary ? "Основное" : "Сделать основным"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Функции:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Загрузка до 6 фото (JPEG, PNG, WebP)</li>
          <li>Максимальный размер: 5MB</li>
          <li>Автоматическое создание превью (1080px ширина)</li>
          <li>Хранение в S3-совместимом хранилище</li>
          <li>CDN оптимизация через Next.js Image</li>
        </ul>
      </div>
    </div>
  )
}
