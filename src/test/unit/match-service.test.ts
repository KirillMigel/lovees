import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MatchService } from '@/lib/match-service'

// Mock Prisma
const mockPrisma = {
  match: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
}

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

describe('MatchService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createMatch', () => {
    it('should create a match with normalized user IDs (userAId < userBId)', async () => {
      const userId1 = 'user-1'
      const userId2 = 'user-2'
      const mockMatch = {
        id: 'match-1',
        userAId: 'user-1',
        userBId: 'user-2',
        createdAt: new Date(),
      }

      mockPrisma.match.create.mockResolvedValue(mockMatch)

      const result = await MatchService.createMatch(userId1, userId2)

      expect(mockPrisma.match.create).toHaveBeenCalledWith({
        data: {
          userAId: 'user-1',
          userBId: 'user-2',
        },
      })
      expect(result).toEqual(mockMatch)
    })

    it('should normalize user IDs when userAId > userBId', async () => {
      const userId1 = 'user-z'
      const userId2 = 'user-a'
      const mockMatch = {
        id: 'match-1',
        userAId: 'user-a',
        userBId: 'user-z',
        createdAt: new Date(),
      }

      mockPrisma.match.create.mockResolvedValue(mockMatch)

      const result = await MatchService.createMatch(userId1, userId2)

      expect(mockPrisma.match.create).toHaveBeenCalledWith({
        data: {
          userAId: 'user-a',
          userBId: 'user-z',
        },
      })
      expect(result).toEqual(mockMatch)
    })

    it('should handle same user IDs', async () => {
      const userId1 = 'user-1'
      const userId2 = 'user-1'
      const mockMatch = {
        id: 'match-1',
        userAId: 'user-1',
        userBId: 'user-1',
        createdAt: new Date(),
      }

      mockPrisma.match.create.mockResolvedValue(mockMatch)

      const result = await MatchService.createMatch(userId1, userId2)

      expect(mockPrisma.match.create).toHaveBeenCalledWith({
        data: {
          userAId: 'user-1',
          userBId: 'user-1',
        },
      })
      expect(result).toEqual(mockMatch)
    })
  })

  describe('getMatch', () => {
    it('should find existing match with normalized IDs', async () => {
      const userId1 = 'user-1'
      const userId2 = 'user-2'
      const mockMatch = {
        id: 'match-1',
        userAId: 'user-1',
        userBId: 'user-2',
        createdAt: new Date(),
      }

      mockPrisma.match.findUnique.mockResolvedValue(mockMatch)

      const result = await MatchService.getMatch(userId1, userId2)

      expect(mockPrisma.match.findUnique).toHaveBeenCalledWith({
        where: {
          userAId_userBId: {
            userAId: 'user-1',
            userBId: 'user-2',
          },
        },
      })
      expect(result).toEqual(mockMatch)
    })

    it('should normalize IDs when searching for match', async () => {
      const userId1 = 'user-z'
      const userId2 = 'user-a'
      const mockMatch = {
        id: 'match-1',
        userAId: 'user-a',
        userBId: 'user-z',
        createdAt: new Date(),
      }

      mockPrisma.match.findUnique.mockResolvedValue(mockMatch)

      const result = await MatchService.getMatch(userId1, userId2)

      expect(mockPrisma.match.findUnique).toHaveBeenCalledWith({
        where: {
          userAId_userBId: {
            userAId: 'user-a',
            userBId: 'user-z',
          },
        },
      })
      expect(result).toEqual(mockMatch)
    })

    it('should return null when match not found', async () => {
      const userId1 = 'user-1'
      const userId2 = 'user-2'

      mockPrisma.match.findUnique.mockResolvedValue(null)

      const result = await MatchService.getMatch(userId1, userId2)

      expect(result).toBeNull()
    })
  })
})
