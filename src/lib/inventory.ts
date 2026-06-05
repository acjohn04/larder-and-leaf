import type { InventoryItem } from '@prisma/client'

/**
 * Number of days ahead to look for expiring-soon items.
 * Used by stat cards and per-item badges.
 */
export const EXPIRING_SOON_DAYS = 3

/**
 * An item is "expired" if its `expiresAt` date is strictly before `now`.
 */
export function isExpired(item: Pick<InventoryItem, 'expiresAt'>, now: Date): boolean {
    return item.expiresAt !== null && new Date(item.expiresAt) < now
}

/**
 * An item is "expiring soon" if its `expiresAt` falls within
 * `[now, now + EXPIRING_SOON_DAYS days]` — i.e. it hasn't expired yet
 * but will within the window.
 */
export function isExpiringSoon(item: Pick<InventoryItem, 'expiresAt'>, now: Date): boolean {
    if (!item.expiresAt) return false
    const expiresDate = new Date(item.expiresAt)
    const cutoff = new Date(now)
    cutoff.setDate(cutoff.getDate() + EXPIRING_SOON_DAYS)
    return expiresDate >= now && expiresDate <= cutoff
}

/**
 * An item is "low stock" if its quantity is at or below its
 * user-defined minThreshold (and the threshold is set).
 */
export function isLowStock(item: Pick<InventoryItem, 'quantity' | 'minThreshold'>): boolean {
    return item.minThreshold > 0 && item.quantity <= item.minThreshold
}
