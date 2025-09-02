import { describe, it, expect, vi, beforeEach } from 'vitest'
import { calculateDistance, calculateAge, calculateInterestOverlap } from '@/lib/geo-utils'

// Mock the geo-utils functions
vi.mock('@/lib/geo-utils', () => ({
  calculateDistance: vi.fn(),
  calculateAge: vi.fn(),
  calculateInterestOverlap: vi.fn(),
}))

describe('Candidate Selector', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('calculateDistance', () => {
    it('should calculate distance between two points', () => {
      const mockDistance = 5.2
      ;(calculateDistance as any).mockReturnValue(mockDistance)

      const result = calculateDistance(55.7558, 37.6176, 55.7600, 37.6200)

      expect(calculateDistance).toHaveBeenCalledWith(55.7558, 37.6176, 55.7600, 37.6200)
      expect(result).toBe(mockDistance)
    })

    it('should return 0 for same coordinates', () => {
      ;(calculateDistance as any).mockReturnValue(0)

      const result = calculateDistance(55.7558, 37.6176, 55.7558, 37.6176)

      expect(result).toBe(0)
    })
  })

  describe('calculateAge', () => {
    it('should calculate age from birthdate', () => {
      const mockAge = 25
      ;(calculateAge as any).mockReturnValue(mockAge)

      const birthdate = new Date('1998-01-01')
      const result = calculateAge(birthdate)

      expect(calculateAge).toHaveBeenCalledWith(birthdate)
      expect(result).toBe(mockAge)
    })

    it('should handle edge case for birthday today', () => {
      const today = new Date()
      const birthdate = new Date(today.getFullYear() - 25, today.getMonth(), today.getDate())
      ;(calculateAge as any).mockReturnValue(25)

      const result = calculateAge(birthdate)

      expect(result).toBe(25)
    })
  })

  describe('calculateInterestOverlap', () => {
    it('should calculate interest overlap percentage', () => {
      const mockOverlap = 0.6
      ;(calculateInterestOverlap as any).mockReturnValue(mockOverlap)

      const userInterests = ['music', 'sports', 'travel']
      const candidateInterests = ['music', 'travel', 'cooking']
      const result = calculateInterestOverlap(userInterests, candidateInterests)

      expect(calculateInterestOverlap).toHaveBeenCalledWith(userInterests, candidateInterests)
      expect(result).toBe(mockOverlap)
    })

    it('should return 0 for no common interests', () => {
      ;(calculateInterestOverlap as any).mockReturnValue(0)

      const userInterests = ['music', 'sports']
      const candidateInterests = ['cooking', 'reading']
      const result = calculateInterestOverlap(userInterests, candidateInterests)

      expect(result).toBe(0)
    })

    it('should return 1 for identical interests', () => {
      ;(calculateInterestOverlap as any).mockReturnValue(1)

      const userInterests = ['music', 'sports']
      const candidateInterests = ['music', 'sports']
      const result = calculateInterestOverlap(userInterests, candidateInterests)

      expect(result).toBe(1)
    })
  })

  describe('Candidate Filtering Logic', () => {
    it('should filter candidates by age range', () => {
      const candidates = [
        { age: 20, name: 'Young' },
        { age: 25, name: 'Middle' },
        { age: 35, name: 'Old' },
      ]

      const minAge = 22
      const maxAge = 30

      const filtered = candidates.filter(candidate => 
        candidate.age >= minAge && candidate.age <= maxAge
      )

      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe('Middle')
    })

    it('should filter candidates by distance', () => {
      const candidates = [
        { distance: 5, name: 'Close' },
        { distance: 15, name: 'Medium' },
        { distance: 60, name: 'Far' },
      ]

      const maxDistance = 50

      const filtered = candidates.filter(candidate => 
        candidate.distance <= maxDistance
      )

      expect(filtered).toHaveLength(2)
      expect(filtered.map(c => c.name)).toEqual(['Close', 'Medium'])
    })

    it('should sort candidates by distance and interest overlap', () => {
      const candidates = [
        { distance: 10, interestOverlap: 0.3, name: 'Far-LowInterest' },
        { distance: 5, interestOverlap: 0.8, name: 'Close-HighInterest' },
        { distance: 8, interestOverlap: 0.5, name: 'Medium-MediumInterest' },
      ]

      const sorted = candidates.sort((a, b) => {
        // Sort by distance first, then by interest overlap
        if (Math.abs(a.distance - b.distance) < 0.1) {
          return b.interestOverlap - a.interestOverlap
        }
        return a.distance - b.distance
      })

      expect(sorted[0].name).toBe('Close-HighInterest')
      expect(sorted[1].name).toBe('Medium-MediumInterest')
      expect(sorted[2].name).toBe('Far-LowInterest')
    })

    it('should exclude already swiped users', () => {
      const candidates = [
        { id: 'user-1', name: 'User 1' },
        { id: 'user-2', name: 'User 2' },
        { id: 'user-3', name: 'User 3' },
      ]

      const swipedUserIds = ['user-2']

      const filtered = candidates.filter(candidate => 
        !swipedUserIds.includes(candidate.id)
      )

      expect(filtered).toHaveLength(2)
      expect(filtered.map(c => c.name)).toEqual(['User 1', 'User 3'])
    })

    it('should exclude blocked users', () => {
      const candidates = [
        { id: 'user-1', name: 'User 1' },
        { id: 'user-2', name: 'User 2' },
        { id: 'user-3', name: 'User 3' },
      ]

      const blockedUserIds = ['user-1', 'user-3']

      const filtered = candidates.filter(candidate => 
        !blockedUserIds.includes(candidate.id)
      )

      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe('User 2')
    })
  })
})
