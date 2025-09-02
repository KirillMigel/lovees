import { prisma } from "./prisma"
import { normalizeMatchUsers, getMatchPartnerId, isUserInMatch } from "./match-utils"

export class MatchService {
  /**
   * Create a new match between two users
   * Automatically normalizes user IDs to ensure userAId < userBId
   */
  static async createMatch(userId1: string, userId2: string) {
    const { userAId, userBId } = normalizeMatchUsers(userId1, userId2)
    
    return await prisma.match.create({
      data: {
        userAId,
        userBId,
      },
      include: {
        userA: true,
        userB: true,
      },
    })
  }

  /**
   * Get all matches for a user
   */
  static async getUserMatches(userId: string) {
    return await prisma.match.findMany({
      where: {
        OR: [
          { userAId: userId },
          { userBId: userId },
        ],
      },
      include: {
        userA: true,
        userB: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Get a specific match between two users
   */
  static async getMatch(userId1: string, userId2: string) {
    const { userAId, userBId } = normalizeMatchUsers(userId1, userId2)
    
    return await prisma.match.findUnique({
      where: {
        userAId_userBId: {
          userAId,
          userBId,
        },
      },
      include: {
        userA: true,
        userB: true,
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })
  }

  /**
   * Check if two users have a match
   */
  static async hasMatch(userId1: string, userId2: string): Promise<boolean> {
    const { userAId, userBId } = normalizeMatchUsers(userId1, userId2)
    
    const match = await prisma.match.findUnique({
      where: {
        userAId_userBId: {
          userAId,
          userBId,
        },
      },
    })
    
    return !!match
  }

  /**
   * Get match partner for a given user and match
   */
  static getMatchPartner(match: { userAId: string; userBId: string }, currentUserId: string) {
    return getMatchPartnerId(match, currentUserId)
  }

  /**
   * Check if user is part of a match
   */
  static isUserInMatch(match: { userAId: string; userBId: string }, userId: string) {
    return isUserInMatch(match, userId)
  }
}
