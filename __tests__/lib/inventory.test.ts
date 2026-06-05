import { describe, it, expect } from 'vitest'
import { isExpired, isExpiringSoon, isLowStock, EXPIRING_SOON_DAYS } from '@/lib/inventory'

const now = new Date('2026-06-01T12:00:00Z')

describe('inventory helpers', () => {
  describe('EXPIRING_SOON_DAYS', () => {
    it('equals 3', () => {
      expect(EXPIRING_SOON_DAYS).toBe(3)
    })
  })

  describe('isExpired', () => {
    it('returns true when expiresAt is before now', () => {
      expect(isExpired({ expiresAt: new Date('2026-05-30T12:00:00Z') }, now)).toBe(true)
    })

    it('returns false when expiresAt equals now (boundary)', () => {
      expect(isExpired({ expiresAt: new Date('2026-06-01T12:00:00Z') }, now)).toBe(false)
    })

    it('returns false when expiresAt is after now', () => {
      expect(isExpired({ expiresAt: new Date('2026-06-05T12:00:00Z') }, now)).toBe(false)
    })

    it('returns false when expiresAt is null', () => {
      expect(isExpired({ expiresAt: null }, now)).toBe(false)
    })
  })

  describe('isExpiringSoon', () => {
    it('returns true when expiresAt is within the 3-day window', () => {
      // 1 day from now
      expect(isExpiringSoon({ expiresAt: new Date('2026-06-02T12:00:00Z') }, now)).toBe(true)
    })

    it('returns true at the exact boundary (now + 3 days)', () => {
      const boundary = new Date(now)
      boundary.setDate(boundary.getDate() + 3)
      expect(isExpiringSoon({ expiresAt: boundary }, now)).toBe(true)
    })

    it('returns true when expiresAt equals now (lower boundary)', () => {
      expect(isExpiringSoon({ expiresAt: new Date('2026-06-01T12:00:00Z') }, now)).toBe(true)
    })

    it('returns false when expiresAt is in the past (expired)', () => {
      expect(isExpiringSoon({ expiresAt: new Date('2026-05-30T12:00:00Z') }, now)).toBe(false)
    })

    it('returns false when expiresAt is beyond the 3-day window', () => {
      expect(isExpiringSoon({ expiresAt: new Date('2026-06-15T12:00:00Z') }, now)).toBe(false)
    })

    it('returns false when expiresAt is null', () => {
      expect(isExpiringSoon({ expiresAt: null }, now)).toBe(false)
    })
  })

  describe('isLowStock', () => {
    it('returns true when quantity is below threshold', () => {
      expect(isLowStock({ quantity: 1, minThreshold: 5 })).toBe(true)
    })

    it('returns true when quantity equals threshold', () => {
      expect(isLowStock({ quantity: 3, minThreshold: 3 })).toBe(true)
    })

    it('returns false when quantity is above threshold', () => {
      expect(isLowStock({ quantity: 10, minThreshold: 5 })).toBe(false)
    })

    it('returns false when threshold is 0 (not configured)', () => {
      expect(isLowStock({ quantity: 1, minThreshold: 0 })).toBe(false)
    })
  })

  describe('isExpired and isExpiringSoon are mutually exclusive', () => {
    it('an expired item is not expiring soon', () => {
      const item = { expiresAt: new Date('2026-05-29T12:00:00Z') }
      expect(isExpired(item, now)).toBe(true)
      expect(isExpiringSoon(item, now)).toBe(false)
    })

    it('an expiring-soon item is not expired', () => {
      const item = { expiresAt: new Date('2026-06-02T12:00:00Z') }
      expect(isExpired(item, now)).toBe(false)
      expect(isExpiringSoon(item, now)).toBe(true)
    })
  })
})
