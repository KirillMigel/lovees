import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      )
    }

    // Get all user data
    const userData = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        photos: {
          select: {
            id: true,
            url: true,
            isPrimary: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" }
        },
        preference: true,
        swipesGiven: {
          select: {
            id: true,
            targetId: true,
            direction: true,
            createdAt: true,
            target: {
              select: {
                id: true,
                name: true,
                age: true,
                city: true,
              }
            }
          },
          orderBy: { createdAt: "desc" }
        },
        swipesReceived: {
          select: {
            id: true,
            swiperId: true,
            direction: true,
            createdAt: true,
            swiper: {
              select: {
                id: true,
                name: true,
                age: true,
                city: true,
              }
            }
          },
          orderBy: { createdAt: "desc" }
        },
        matchesAsA: {
          include: {
            userB: {
              select: {
                id: true,
                name: true,
                age: true,
                city: true,
                photos: {
                  where: { isPrimary: true },
                  select: { url: true }
                }
              }
            },
            messages: {
              select: {
                id: true,
                text: true,
                createdAt: true,
                readAt: true,
                senderId: true,
              },
              orderBy: { createdAt: "asc" }
            }
          },
          orderBy: { createdAt: "desc" }
        },
        matchesAsB: {
          include: {
            userA: {
              select: {
                id: true,
                name: true,
                age: true,
                city: true,
                photos: {
                  where: { isPrimary: true },
                  select: { url: true }
                }
              }
            },
            messages: {
              select: {
                id: true,
                text: true,
                createdAt: true,
                readAt: true,
                senderId: true,
              },
              orderBy: { createdAt: "asc" }
            }
          },
          orderBy: { createdAt: "desc" }
        },
        reportsMade: {
          select: {
            id: true,
            reason: true,
            description: true,
            createdAt: true,
            reported: {
              select: {
                id: true,
                name: true,
              }
            }
          },
          orderBy: { createdAt: "desc" }
        },
        reportsReceived: {
          select: {
            id: true,
            reason: true,
            description: true,
            createdAt: true,
            reporter: {
              select: {
                id: true,
                name: true,
              }
            }
          },
          orderBy: { createdAt: "desc" }
        },
        blocksGiven: {
          select: {
            id: true,
            blockedId: true,
            createdAt: true,
            blocked: {
              select: {
                id: true,
                name: true,
              }
            }
          },
          orderBy: { createdAt: "desc" }
        },
        blocksReceived: {
          select: {
            id: true,
            userId: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
              }
            }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    })

    if (!userData) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      )
    }

    // Calculate age for export
    const calculateAge = (birthdate: Date) => {
      const today = new Date()
      const age = today.getFullYear() - birthdate.getFullYear()
      const monthDiff = today.getMonth() - birthdate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
        return age - 1
      }
      return age
    }

    // Prepare export data
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        age: calculateAge(userData.birthdate),
        gender: userData.gender,
        bio: userData.bio,
        city: userData.city,
        interests: userData.interests,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      },
      photos: userData.photos,
      preferences: userData.preference,
      swipes: {
        given: userData.swipesGiven,
        received: userData.swipesReceived,
      },
      matches: [
        ...userData.matchesAsA.map(match => ({
          id: match.id,
          matchedUser: match.userB,
          createdAt: match.createdAt,
          messages: match.messages,
        })),
        ...userData.matchesAsB.map(match => ({
          id: match.id,
          matchedUser: match.userA,
          createdAt: match.createdAt,
          messages: match.messages,
        }))
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      reports: {
        made: userData.reportsMade,
        received: userData.reportsReceived,
      },
      blocks: {
        given: userData.blocksGiven,
        received: userData.blocksReceived,
      },
      statistics: {
        totalPhotos: userData.photos.length,
        totalSwipesGiven: userData.swipesGiven.length,
        totalSwipesReceived: userData.swipesReceived.length,
        totalMatches: userData.matchesAsA.length + userData.matchesAsB.length,
        totalMessages: [
          ...userData.matchesAsA.flatMap(match => match.messages),
          ...userData.matchesAsB.flatMap(match => match.messages)
        ].length,
        totalReportsMade: userData.reportsMade.length,
        totalReportsReceived: userData.reportsReceived.length,
        totalBlocksGiven: userData.blocksGiven.length,
        totalBlocksReceived: userData.blocksReceived.length,
      }
    }

    // Return as downloadable JSON
    const response = new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="lovees-data-${userData.id}-${new Date().toISOString().split('T')[0]}.json"`
      }
    })

    return response

  } catch (error) {
    console.error("Export data error:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
