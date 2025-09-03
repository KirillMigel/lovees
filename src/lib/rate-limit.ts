import 'server-only'
import { prisma } from "./prisma"

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  swipe: {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    maxRequests: 100
  },
  message: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30
  },
  report: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5
  }
}

export async function checkRateLimit(
  userId: string, 
  action: keyof typeof RATE_LIMITS
): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
  const config = RATE_LIMITS[action]
  if (!config) {
    return { allowed: true, remaining: Infinity, resetTime: new Date() }
  }

  const now = new Date()
  const windowStart = new Date(now.getTime() - config.windowMs)

  // Count requests in the current window
  const requestCount = await prisma.swipe.count({
    where: {
      swiperId: userId,
      createdAt: {
        gte: windowStart
      }
    }
  })

  const remaining = Math.max(0, config.maxRequests - requestCount)
  const allowed = requestCount < config.maxRequests
  const resetTime = new Date(now.getTime() + config.windowMs)

  return { allowed, remaining, resetTime }
}

export async function recordRateLimit(
  userId: string,
  action: keyof typeof RATE_LIMITS
): Promise<void> {
  // For swipe action, we record it in the Swipe table
  // For other actions, we could create a separate RateLimit table
  if (action === 'swipe') {
    // Swipe is already recorded in the Swipe table
    return
  }

  // For other actions, we could implement a generic rate limit table
  // For now, we'll just return
}