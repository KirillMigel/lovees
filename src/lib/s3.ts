import 'server-only'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3Client = new S3Client({
  region: process.env.S3_REGION || "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true, // Required for S3-compatible services like Cloudflare R2
})

const BUCKET_NAME = process.env.S3_BUCKET!
const CDN_URL = process.env.S3_PUBLIC_URL!

export interface UploadResult {
  key: string
  url: string
  cdnUrl: string
}

export async function generatePresignedUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600 // 1 hour
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  })

  return await getSignedUrl(s3Client, command, { expiresIn })
}

export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  await s3Client.send(command)
}

export function generateFileKey(userId: string, filename: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = filename.split('.').pop()
  return `photos/${userId}/${timestamp}-${randomString}.${extension}`
}

export function getCdnUrl(key: string): string {
  return `${CDN_URL}/${key}`
}

export function getS3Url(key: string): string {
  return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`
}
