import sharp from "sharp"

export interface ImageValidationResult {
  isValid: boolean
  error?: string
}

export interface ProcessedImage {
  original: Buffer
  thumbnail: Buffer
  width: number
  height: number
}

// Allowed image types
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg", 
  "image/png",
  "image/webp"
] as const

export const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const

// Maximum file size (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024

// Maximum number of photos per user
export const MAX_PHOTOS_PER_USER = 6

export function validateImageFile(file: File): ImageValidationResult {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
    return {
      isValid: false,
      error: "Неподдерживаемый формат файла. Разрешены: JPEG, PNG, WebP"
    }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `Файл слишком большой. Максимальный размер: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    }
  }

  // Check file extension
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
  if (!ALLOWED_EXTENSIONS.includes(extension as any)) {
    return {
      isValid: false,
      error: "Неподдерживаемое расширение файла"
    }
  }

  return { isValid: true }
}

export async function processImage(file: File): Promise<ProcessedImage> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Get image metadata
  const metadata = await sharp(buffer).metadata()
  
  if (!metadata.width || !metadata.height) {
    throw new Error("Не удалось получить размеры изображения")
  }

  // Create thumbnail (max width 1080px, maintain aspect ratio)
  const thumbnail = await sharp(buffer)
    .resize(1080, null, {
      withoutEnlargement: true,
      fit: 'inside'
    })
    .jpeg({ quality: 85 })
    .toBuffer()

  return {
    original: buffer,
    thumbnail,
    width: metadata.width,
    height: metadata.height
  }
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    img.onerror = () => {
      reject(new Error("Не удалось загрузить изображение"))
    }
    img.src = URL.createObjectURL(file)
  })
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
