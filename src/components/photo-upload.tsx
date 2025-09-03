"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Upload, X, Star, Loader2 } from "lucide-react"
import { useDropzone } from "react-dropzone"
// TODO: Replace with client-side image validation or API calls
// import { validateImageFile, processImage, formatFileSize, MAX_PHOTOS_PER_USER } from "@/lib/image-utils"

// Temporary client-side implementations
const MAX_PHOTOS_PER_USER = 6

const validateImageFile = (file: File) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB
  
  if (!validTypes.includes(file.type)) {
    return { isValid: false, error: 'Неподдерживаемый формат файла' }
  }
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'Файл слишком большой (максимум 5MB)' }
  }
  
  return { isValid: true }
}

const processImage = async (file: File) => {
  // TODO: Implement client-side image processing or use API
  return {
    thumbnail: file,
    original: file
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

interface PhotoUploadProps {
  photos: Array<{ id: string; url: string; isPrimary: boolean }>
  onPhotoAdd: (photo: { id: string; url: string; isPrimary: boolean }) => void
  onPhotoRemove: (id: string) => void
  onPhotoSetPrimary: (id: string) => void
  maxPhotos?: number
}

export function PhotoUpload({
  photos,
  onPhotoAdd,
  onPhotoRemove,
  onPhotoSetPrimary,
  maxPhotos = MAX_PHOTOS_PER_USER,
}: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  const handlePhotoRemove = async (id: string) => {
    try {
      const response = await fetch("/api/upload/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId: id }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || "Ошибка удаления фото")
        return
      }

      // Remove from local state
      onPhotoRemove(id)
    } catch (error) {
      console.error("Delete photo error:", error)
      alert("Ошибка удаления фото")
    }
  }

  const uploadFile = async (file: File): Promise<void> => {
    const fileId = `${file.name}-${Date.now()}`
    
    try {
      // Validate file
      const validation = validateImageFile(file)
      if (!validation.isValid) {
        alert(validation.error)
        return
      }

      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))

      // Get presigned URL
      const presignedResponse = await fetch("/api/upload/presigned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
        }),
      })

      if (!presignedResponse.ok) {
        const error = await presignedResponse.json()
        throw new Error(error.error || "Ошибка получения URL для загрузки")
      }

      const { presignedUrl, key } = await presignedResponse.json()
      setUploadProgress(prev => ({ ...prev, [fileId]: 25 }))

      // Process image (create thumbnail)
      const processedImage = await processImage(file)
      setUploadProgress(prev => ({ ...prev, [fileId]: 50 }))

      // Upload to S3
      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        body: processedImage.thumbnail,
        headers: {
          "Content-Type": file.type,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error("Ошибка загрузки файла")
      }

      setUploadProgress(prev => ({ ...prev, [fileId]: 75 }))

      // Confirm upload and save to database
      const confirmResponse = await fetch("/api/upload/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key,
          isPrimary: photos.length === 0, // First photo is primary
        }),
      })

      if (!confirmResponse.ok) {
        const error = await confirmResponse.json()
        throw new Error(error.error || "Ошибка сохранения фото")
      }

      const { photo } = await confirmResponse.json()
      setUploadProgress(prev => ({ ...prev, [fileId]: 100 }))

      // Add photo to list
      onPhotoAdd(photo)

      // Clean up progress
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[fileId]
          return newProgress
        })
      }, 1000)

    } catch (error) {
      console.error("Upload error:", error)
      alert(error instanceof Error ? error.message : "Ошибка загрузки")
      
      // Clean up progress on error
      setUploadProgress(prev => {
        const newProgress = { ...prev }
        delete newProgress[fileId]
        return newProgress
      })
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (photos.length + acceptedFiles.length > maxPhotos) {
      alert(`Максимум ${maxPhotos} фотографий`)
      return
    }

    setIsUploading(true)
    
    try {
      // Upload files in parallel
      await Promise.all(acceptedFiles.map(uploadFile))
    } finally {
      setIsUploading(false)
    }
  }, [photos.length, maxPhotos, onPhotoAdd])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: maxPhotos - photos.length,
    disabled: photos.length >= maxPhotos || isUploading,
  })

  const totalProgress = Object.values(uploadProgress).length > 0 
    ? Object.values(uploadProgress).reduce((sum, progress) => sum + progress, 0) / Object.values(uploadProgress).length
    : 0

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Фотографии</h3>
      
      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Загрузка фотографий...</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <div key={photo.id} className="relative group">
            <Image
              src={photo.url}
              alt="Profile"
              width={128}
              height={128}
              className="w-full h-32 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onPhotoSetPrimary(photo.id)}
                className={photo.isPrimary ? "bg-yellow-500" : ""}
              >
                <Star className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handlePhotoRemove(photo.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {photo.isPrimary && (
              <div className="absolute top-2 right-2 bg-yellow-500 text-white rounded-full p-1">
                <Star className="w-3 h-3" />
              </div>
            )}
          </div>
        ))}
        
        {photos.length < maxPhotos && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed border-muted-foreground/25 rounded-lg h-32 flex items-center justify-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "hover:border-primary/50"
            } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input {...getInputProps()} />
            <div className="text-center">
              {isUploading ? (
                <Loader2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground animate-spin" />
              ) : (
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              )}
              <p className="text-sm text-muted-foreground">
                {isUploading ? "Загрузка..." : isDragActive ? "Отпустите файлы" : "Загрузить фото"}
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-sm text-muted-foreground space-y-1">
        <p>{photos.length}/{maxPhotos} фотографий. Выберите главную фотографию.</p>
        <p>Поддерживаемые форматы: JPEG, PNG, WebP. Максимальный размер: 5MB.</p>
      </div>
    </div>
  )
}
