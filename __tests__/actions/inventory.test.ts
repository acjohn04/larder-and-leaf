import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ZodError } from 'zod'

// --- Mocks ---

// Mock next/cache (server actions call revalidatePath)
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

// Mock Prisma client
const mockCreateMany = vi.fn().mockResolvedValue({ count: 1 })
const mockDelete = vi.fn().mockResolvedValue({})
const mockFindMany = vi.fn().mockResolvedValue([])

vi.mock('@/lib/prisma', () => ({
    prisma: {
        inventoryItem: {
            createMany: (...args: unknown[]) => mockCreateMany(...args),
            delete: (...args: unknown[]) => mockDelete(...args),
            findMany: (...args: unknown[]) => mockFindMany(...args),
        },
    },
}))

// Mock Gemini (generateMealIdeas uses it, but we're not testing that here)
vi.mock('@/lib/gemini', () => ({
    genAI: {
        getGenerativeModel: vi.fn(),
    },
}))

// Mock dictionaries
vi.mock('@/dictionaries', () => ({
    getDictionary: vi.fn().mockResolvedValue({
        errors: { emptyPantry: 'Pantry is empty' },
    }),
}))

import { addInventoryItems, deleteInventoryItem } from '@/app/actions/inventory'

// --- Tests ---

describe('addInventoryItems', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    const validItem = {
        name: 'Apples',
        category: 'Produce',
        quantity: 5,
        unit: 'pieces',
        confidenceScore: 0.95,
    }

    it('accepts a valid item and calls Prisma', async () => {
        await addInventoryItems([validItem])

        expect(mockCreateMany).toHaveBeenCalledOnce()
        const callData = mockCreateMany.mock.calls[0][0].data
        expect(callData).toHaveLength(1)
        expect(callData[0].name).toBe('Apples')
    })

    it('applies defaults for unit and minThreshold when omitted', async () => {
        await addInventoryItems([{
            name: 'Rice',
            category: 'Pantry',
            quantity: 1,
            confidenceScore: 0.8,
        }])

        const callData = mockCreateMany.mock.calls[0][0].data
        expect(callData[0].unit).toBe('units')
        expect(callData[0].minThreshold).toBe(0)
    })

    it('accepts expiresAt as a Date', async () => {
        const expiry = new Date('2026-06-01')
        await addInventoryItems([{ ...validItem, expiresAt: expiry }])

        const callData = mockCreateMany.mock.calls[0][0].data
        expect(callData[0].expiresAt).toEqual(expiry)
    })

    it('rejects an empty array', async () => {
        await expect(addInventoryItems([])).rejects.toThrow(ZodError)
        expect(mockCreateMany).not.toHaveBeenCalled()
    })

    it('rejects a batch larger than 50 items', async () => {
        const oversizedBatch = Array.from({ length: 51 }, (_, i) => ({
            ...validItem,
            name: `Item ${i}`,
        }))

        await expect(addInventoryItems(oversizedBatch)).rejects.toThrow(ZodError)
        expect(mockCreateMany).not.toHaveBeenCalled()
    })

    it('rejects an item with an empty name', async () => {
        await expect(
            addInventoryItems([{ ...validItem, name: '' }])
        ).rejects.toThrow(ZodError)
    })

    it('rejects an item with a name exceeding 200 characters', async () => {
        await expect(
            addInventoryItems([{ ...validItem, name: 'x'.repeat(201) }])
        ).rejects.toThrow(ZodError)
    })

    it('rejects a negative quantity', async () => {
        await expect(
            addInventoryItems([{ ...validItem, quantity: -1 }])
        ).rejects.toThrow(ZodError)
    })

    it('rejects zero quantity', async () => {
        await expect(
            addInventoryItems([{ ...validItem, quantity: 0 }])
        ).rejects.toThrow(ZodError)
    })

    it('rejects quantity exceeding 99999', async () => {
        await expect(
            addInventoryItems([{ ...validItem, quantity: 100000 }])
        ).rejects.toThrow(ZodError)
    })

    it('rejects confidenceScore above 1', async () => {
        await expect(
            addInventoryItems([{ ...validItem, confidenceScore: 1.5 }])
        ).rejects.toThrow(ZodError)
    })

    it('rejects confidenceScore below 0', async () => {
        await expect(
            addInventoryItems([{ ...validItem, confidenceScore: -0.1 }])
        ).rejects.toThrow(ZodError)
    })

    it('accepts exactly 50 items', async () => {
        const maxBatch = Array.from({ length: 50 }, (_, i) => ({
            ...validItem,
            name: `Item ${i}`,
        }))

        await addInventoryItems(maxBatch)
        expect(mockCreateMany).toHaveBeenCalledOnce()
        expect(mockCreateMany.mock.calls[0][0].data).toHaveLength(50)
    })
})

describe('deleteInventoryItem', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('accepts a valid id and calls Prisma', async () => {
        await deleteInventoryItem('clx123abc')

        expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'clx123abc' } })
    })

    it('rejects an empty id', async () => {
        await expect(deleteInventoryItem('')).rejects.toThrow(ZodError)
        expect(mockDelete).not.toHaveBeenCalled()
    })

    it('rejects an id exceeding 100 characters', async () => {
        await expect(deleteInventoryItem('x'.repeat(101))).rejects.toThrow(ZodError)
        expect(mockDelete).not.toHaveBeenCalled()
    })
})
