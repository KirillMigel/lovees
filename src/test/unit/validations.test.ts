import { describe, it, expect } from 'vitest'
import { registerSchema, loginSchema, onboardingSchema } from '@/lib/validations/auth'

describe('Auth Validations', () => {
  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      }

      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
        confirmPassword: 'password123',
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['email'])
      }
    })

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '123',
        confirmPassword: '123',
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['password'])
      }
    })

    it('should reject mismatched passwords', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'different123',
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['confirmPassword'])
      }
    })
  })

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      }

      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['password'])
      }
    })
  })

  describe('onboardingSchema', () => {
    it('should validate correct onboarding data', () => {
      const validData = {
        name: 'John Doe',
        birthdate: '1990-01-01',
        gender: 'MALE' as const,
        bio: 'Test bio',
        city: 'Moscow',
        lat: 55.7558,
        lng: 37.6176,
        interests: ['music', 'sports'],
        photos: [
          { url: 'https://example.com/photo1.jpg', isPrimary: true },
          { url: 'https://example.com/photo2.jpg', isPrimary: false },
        ],
      }

      const result = onboardingSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject underage user', () => {
      const invalidData = {
        name: 'Young User',
        birthdate: '2010-01-01', // 14 years old
        gender: 'MALE' as const,
        bio: 'Test bio',
        city: 'Moscow',
        lat: 55.7558,
        lng: 37.6176,
        interests: ['music'],
        photos: [{ url: 'https://example.com/photo1.jpg', isPrimary: true }],
      }

      const result = onboardingSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['birthdate'])
      }
    })

    it('should reject user exactly 17 years old', () => {
      const seventeenYearsAgo = new Date()
      seventeenYearsAgo.setFullYear(seventeenYearsAgo.getFullYear() - 17)

      const invalidData = {
        name: 'Seventeen User',
        birthdate: seventeenYearsAgo.toISOString().split('T')[0],
        gender: 'MALE' as const,
        bio: 'Test bio',
        city: 'Moscow',
        lat: 55.7558,
        lng: 37.6176,
        interests: ['music'],
        photos: [{ url: 'https://example.com/photo1.jpg', isPrimary: true }],
      }

      const result = onboardingSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['birthdate'])
      }
    })

    it('should accept user exactly 18 years old', () => {
      const eighteenYearsAgo = new Date()
      eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18)

      const validData = {
        name: 'Eighteen User',
        birthdate: eighteenYearsAgo.toISOString().split('T')[0],
        gender: 'MALE' as const,
        bio: 'Test bio',
        city: 'Moscow',
        lat: 55.7558,
        lng: 37.6176,
        interests: ['music'],
        photos: [{ url: 'https://example.com/photo1.jpg', isPrimary: true }],
      }

      const result = onboardingSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject too many interests', () => {
      const invalidData = {
        name: 'John Doe',
        birthdate: '1990-01-01',
        gender: 'MALE' as const,
        bio: 'Test bio',
        city: 'Moscow',
        lat: 55.7558,
        lng: 37.6176,
        interests: Array(11).fill('interest'), // 11 interests
        photos: [{ url: 'https://example.com/photo1.jpg', isPrimary: true }],
      }

      const result = onboardingSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['interests'])
      }
    })

    it('should reject too many photos', () => {
      const invalidData = {
        name: 'John Doe',
        birthdate: '1990-01-01',
        gender: 'MALE' as const,
        bio: 'Test bio',
        city: 'Moscow',
        lat: 55.7558,
        lng: 37.6176,
        interests: ['music'],
        photos: Array(7).fill({ url: 'https://example.com/photo.jpg', isPrimary: false }), // 7 photos
      }

      const result = onboardingSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['photos'])
      }
    })

    it('should reject no photos', () => {
      const invalidData = {
        name: 'John Doe',
        birthdate: '1990-01-01',
        gender: 'MALE' as const,
        bio: 'Test bio',
        city: 'Moscow',
        lat: 55.7558,
        lng: 37.6176,
        interests: ['music'],
        photos: [], // No photos
      }

      const result = onboardingSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['photos'])
      }
    })

    it('should reject invalid coordinates', () => {
      const invalidData = {
        name: 'John Doe',
        birthdate: '1990-01-01',
        gender: 'MALE' as const,
        bio: 'Test bio',
        city: 'Moscow',
        lat: 95.7558, // Invalid latitude > 90
        lng: 37.6176,
        interests: ['music'],
        photos: [{ url: 'https://example.com/photo1.jpg', isPrimary: true }],
      }

      const result = onboardingSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['lat'])
      }
    })
  })
})
