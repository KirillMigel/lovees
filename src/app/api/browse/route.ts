import 'server-only'
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Haversine formula for distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
        },
        blocksReceived: {
          select: { userId: true }
        }
      }
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!currentUser.preference) {
      return NextResponse.json({ error: "Preferences not set" }, { status: 400 })
    }

    if (!currentUser.latitude || !currentUser.longitude) {
      return NextResponse.json({ error: "Location not set" }, { status: 400 })
    }

    // Get swiped and blocked user IDs
    const swipedUserIds = currentUser.swipesGiven.map(swipe => swipe.targetId)
    const blockedUserIds = [
      ...currentUser.blocksGiven.map(block => block.blockedId),
      ...currentUser.blocksReceived.map(block => block.userId)
    ]

    // Calculate age range
    const today = new Date()
    const minBirthdate = new Date(today.getFullYear() - currentUser.preference.maxAge, today.getMonth(), today.getDate())
    const maxBirthdate = new Date(today.getFullYear() - currentUser.preference.minAge, today.getMonth(), today.getDate())

    // Build where clause
    const whereClause = {
      id: {
        not: session.user.id, // Exclude self
        notIn: [...swipedUserIds, ...blockedUserIds] // Exclude swiped and blocked users
      },
      isBanned: false,
      gender: {
        in: currentUser.preference.genders
      },
      birthdate: {
        gte: minBirthdate,
        lte: maxBirthdate
      },
      latitude: {
        not: null
      },
      longitude: {
        not: null
      },
      photos: {
        some: {} // Must have at least one photo
      }
    }

    // Get candidates
    const candidates = await prisma.user.findMany({
      where: whereClause,
      include: {
        photos: {
          where: { isPrimary: true },
          take: 1
        }
      },
      take: 50 // Get more than needed for filtering by distance
    })

    // Calculate distances and filter by distance preference
    const candidatesWithDistance = candidates
      .map(candidate => {
        const distance = calculateDistance(
          Number(currentUser.latitude),
          Number(currentUser.longitude),
          Number(candidate.latitude),
          Number(candidate.longitude)
        )
        return {
          ...candidate,
          distanceKm: Math.round(distance * 10) / 10 // Round to 1 decimal
        }
      })
      .filter(candidate => candidate.distanceKm <= currentUser.preference.distanceKm)

    // Sort by distance, then by interest overlap
    const sortedCandidates = candidatesWithDistance.sort((a, b) => {
      // First sort by distance
      if (a.distanceKm !== b.distanceKm) {
        return a.distanceKm - b.distanceKm
      }
      
      // Then sort by interest overlap
      const aInterests = new Set(a.interests)
      const bInterests = new Set(b.interests)
      const currentUserInterests = new Set(currentUser.interests)
      
      const aOverlap = [...aInterests].filter(interest => currentUserInterests.has(interest)).length
      const bOverlap = [...bInterests].filter(interest => currentUserInterests.has(interest)).length
      
      return bOverlap - aOverlap
    })

    // Take only first 30 candidates
    const limitedCandidates = sortedCandidates.slice(0, 30)

    // Format response
    const formattedCandidates = limitedCandidates.map(candidate => ({
      id: candidate.id,
      name: candidate.name,
      age: today.getFullYear() - candidate.birthdate.getFullYear(),
      city: candidate.city,
      primaryPhotoUrl: candidate.photos[0]?.url || null,
      interests: candidate.interests,
      distanceKm: candidate.distanceKm
    }))

    return NextResponse.json({ candidates: formattedCandidates })
  } catch (error) {
    console.error("Browse error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}