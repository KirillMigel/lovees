import { NextRequest, NextResponse } from "next/server"

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string // Custom key generator
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyGenerator } = options

  return (req: NextRequest) => {
    const key = keyGenerator ? keyGenerator(req) : getDefaultKey(req)
    const now = Date.now()
    
    // Clean up expired entries
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k)
      }
    }

    const current = rateLimitStore.get(key)
    
    if (!current) {
      // First request in window
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      })
      return null // No rate limit exceeded
    }

    if (current.resetTime < now) {
      // Window expired, reset
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      })
      return null // No rate limit exceeded
    }

    if (current.count >= maxRequests) {
      // Rate limit exceeded
      return {
        limit: maxRequests,
        remaining: 0,
        resetTime: current.resetTime,
        retryAfter: Math.ceil((current.resetTime - now) / 1000)
      }
    }

    // Increment counter
    current.count++
    rateLimitStore.set(key, current)

    return {
      limit: maxRequests,
      remaining: maxRequests - current.count,
      resetTime: current.resetTime,
      retryAfter: 0
    }
  }
}

function getDefaultKey(req: NextRequest): string {
  // Use IP address as default key
  const forwarded = req.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : req.ip || "unknown"
  return `rate_limit:${ip}`
}

export function createUserRateLimit(windowMs: number, maxRequests: number) {
  return rateLimit({
    windowMs,
    maxRequests,
    keyGenerator: (req) => {
      // Try to get user ID from headers (set by auth middleware)
      const userId = req.headers.get("x-user-id")
      if (userId) {
        return `user_rate_limit:${userId}`
      }
      // Fallback to IP
      return getDefaultKey(req)
    }
  })
}

export function createSwipeRateLimit() {
  // 100 swipes per day (24 hours)
  return createUserRateLimit(24 * 60 * 60 * 1000, 100)
}

export function createMessageRateLimit() {
  // 1000 messages per hour
  return createUserRateLimit(60 * 60 * 1000, 1000)
}

export function createReportRateLimit() {
  // 10 reports per day
  return createUserRateLimit(24 * 60 * 60 * 1000, 10)
}

export function createBlockRateLimit() {
  // 50 blocks per day
  return createUserRateLimit(24 * 60 * 60 * 1000, 50)
}

export function withRateLimit(
  rateLimiter: (req: NextRequest) => any,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const rateLimitResult = rateLimiter(req)
    
    if (rateLimitResult) {
      return NextResponse.json(
        {
          error: "Превышен лимит запросов",
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          retryAfter: rateLimitResult.retryAfter
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
            "Retry-After": rateLimitResult.retryAfter.toString()
          }
        }
      )
    }

    return handler(req)
  }
}
