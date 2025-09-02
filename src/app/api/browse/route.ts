import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateDistance, calculateAge, calculateInterestOverlap } from "@/lib/geo-utils"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      )
    }

    // Get current user with preferences
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        preference: true,
        swipesGiven: {
          select: { targetId: true }
        },
        blocksGiven: {
          select: { blockedId: true }
        }
      }
    })

    if (!currentUser) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      )
    }

    if (!currentUser.preference) {
      return NextResponse.json(
        { error: "Настройте предпочтения для просмотра кандидатов" },
        { status: 400 }
      )
    }

    const { minAge, maxAge, distanceKm, genders } = currentUser.preference
    const swipedUserIds = currentUser.swipesGiven.map(swipe => swipe.targetId)
    const blockedUserIds = currentUser.blocksGiven.map(block => block.blockedId)

    // Get all potential candidates
    const candidates = await prisma.user.findMany({
      where: {
        id: { 
          not: session.user.id, // Exclude current user
          notIn: [...swipedUserIds, ...blockedUserIds], // Exclude already swiped and blocked users
        },
        isBanned: false,
        gender: { in: genders },
        // Age filter will be applied in code since we need to calculate from birthdate
        photos: {
          some: {} // Must have at least one photo
        }
      },
      include: {
        photos: {
          where: { isPrimary: true },
          select: { url: true }
        }
      }
    })

    // Filter by age and distance, calculate scores
    const filteredCandidates = candidates
      .map(candidate => {
        const age = calculateAge(candidate.birthdate)
        const distance = calculateDistance(
          Number(currentUser.lat),
          Number(currentUser.lng),
          Number(candidate.lat),
          Number(candidate.lng)
        )
        const interestOverlap = calculateInterestOverlap(
          currentUser.interests,
          candidate.interests
        )

        return {
          ...candidate,
          age,
          distance,
          interestOverlap,
          primaryPhotoUrl: candidate.photos[0]?.url || null
        }
      })
      .filter(candidate => {
        // Filter by age
        if (candidate.age < minAge || candidate.age > maxAge) {
          return false
        }
        
        // Filter by distance
        if (candidate.distance > distanceKm) {
          return false
        }

        return true
      })
      .sort((a, b) => {
        // Sort by distance first, then by interest overlap
        if (Math.abs(a.distance - b.distance) < 0.1) {
          return b.interestOverlap - a.interestOverlap
        }
        return a.distance - b.distance
      })
      .slice(0, 30) // Limit to 30 candidates
      .map(candidate => ({
        id: candidate.id,
        name: candidate.name,
        age: candidate.age,
        city: candidate.city,
        primaryPhotoUrl: candidate.primaryPhotoUrl,
        interests: candidate.interests,
        distanceKm: Math.round(candidate.distance * 10) / 10 // Round to 1 decimal
      }))

    return NextResponse.json({ candidates: filteredCandidates })

  } catch (error) {
    console.error("Browse error:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
