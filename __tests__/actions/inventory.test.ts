import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ZodError } from 'zod'

// --- Mocks ---

// Mock next/cache (server actions call revalidatePath)
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

// Mock Prisma client
const mockFindFirst = vi.fn()
const mockUpdate = vi.fn()
const mockCreate = vi.fn()
const mockDelete = vi.fn().mockResolvedValue({})
const mockFindMany = vi.fn().mockResolvedValue([])

vi.mock('@/lib/prisma', () => ({
    prisma: {
        $transaction: vi.fn(async (callback) => await callback({
            inventoryItem: {
                findFirst: (...args: unknown[]) => mockFindFirst(...args),
                update: (...args: unknown[]) => mockUpdate(...args),
                create: (...args: unknown[]) => mockCreate(...args),
                delete: (...args: unknown[]) => mockDelete(...args),
                findMany: (...args: unknown[]) => mockFindMany(...args),
            }
        })),
        inventoryItem: {
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

    it('accepts a valid item and calls Prisma create when not found', async () => {
        mockFindFirst.mockResolvedValue(null)
        await addInventoryItems([validItem])

        expect(mockCreate).toHaveBeenCalledOnce()
        const callData = mockCreate.mock.calls[0][0].data
        expect(callData.name).toBe('Apples')
    })

    it('updates quantity when an item with the same name exists', async () => {
        mockFindFirst.mockResolvedValue({ id: 'existing-id', name: 'Apples', quantity: 10 })
        await addInventoryItems([validItem]) // validItem has quantity 5

        expect(mockUpdate).toHaveBeenCalledOnce()
        expect(mockUpdate).toHaveBeenCalledWith({
            where: { id: 'existing-id' },
            data: { quantity: { increment: 5 } }
        })
        expect(mockCreate).not.toBeCalled()
    })

    it('aggregates items with the same name in a single batch', async () => {
        mockFindFirst.mockResolvedValue(null)
        const batch = [
            { ...validItem, name: 'Banana', quantity: 2 },
            { ...validItem, name: 'Banana', quantity: 3 },
        ]
        await addInventoryItems(batch)

        // Should only call findFirst once for 'Banana' because they are aggregated
        expect(mockFindFirst).toHaveBeenCalledOnce()
        expect(mockFindFirst).toHaveBeenCalledWith({ where: { name: 'Banana' } })
        
        // Should call create once with combined quantity 5
        expect(mockCreate).toHaveBeenCalledOnce()
        expect(mockCreate.mock.calls[0][0].data.quantity).toBe(5)
    })

    it('applies defaults for unit and minThreshold when omitted', async () => {
        mockFindFirst.mockResolvedValue(null)
        await addInventoryItems([{
            name: 'Rice',
            category: 'Pantry',
            quantity: 1,
            confidenceScore: 0.8,
        }])

        const callData = mockCreate.mock.calls[0][0].data
        expect(callData.unit).toBe('units')
        expect(callData.minThreshold).toBe(0)
    })

    it('accepts expiresAt as a Date', async () => {
        mockFindFirst.mockResolvedValue(null)
        const expiry = new Date('2026-06-01')
        await addInventoryItems([{ ...validItem, expiresAt: expiry }])

        const callData = mockCreate.mock.calls[0][0].data
        expect(callData.expiresAt).toEqual(expiry)
    })

    it('rejects an empty array', async () => {
        await expect(addInventoryItems([])).rejects.toThrow(ZodError)
        expect(mockCreate).not.toHaveBeenCalled()
        expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('rejects a batch larger than 50 items', async () => {
        const oversizedBatch = Array.from({ length: 51 }, (_, i) => ({
            ...validItem,
            name: `Item ${i}`,
        }))

        await expect(addInventoryItems(oversizedBatch)).rejects.toThrow(ZodError)
        expect(mockCreate).not.toHaveBeenCalled()
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
        mockFindFirst.mockResolvedValue(null)
        const maxBatch = Array.from({ length: 50 }, (_, i) => ({
            ...validItem,
            name: `Item ${i}`,
        }))

        await addInventoryItems(maxBatch)
        expect(mockCreate).toHaveBeenCalledTimes(50)
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

describe('consumeMeal', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    const ingredients = [
        { name: 'Apples', quantity: 2 },
        { name: 'Rice', quantity: 1 },
    ]

    it('decrements quantity for existing items', async () => {
        mockFindFirst
            .mockResolvedValueOnce({ id: 'apple-id', name: 'Apples', quantity: 5 })
            .mockResolvedValueOnce({ id: 'rice-id', name: 'Rice', quantity: 10 })

        const { consumeMeal } = await import('@/app/actions/inventory')
        await consumeMeal(ingredients)

        expect(mockUpdate).toHaveBeenCalledTimes(2)
        expect(mockUpdate).toHaveBeenCalledWith({
            where: { id: 'apple-id' },
            data: { quantity: 3 }
        })
        expect(mockUpdate).toHaveBeenCalledWith({
            where: { id: 'rice-id' },
            data: { quantity: 9 }
        })
    })

    it('deletes item if quantity reaches zero', async () => {
        mockFindFirst.mockResolvedValue({ id: 'apple-id', name: 'Apples', quantity: 2 })

        const { consumeMeal } = await import('@/app/actions/inventory')
        await consumeMeal([{ name: 'Apples', quantity: 2 }])

        expect(mockDelete).toHaveBeenCalledWith({
            where: { id: 'apple-id' }
        })
        expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('handles items not found gracefully', async () => {
        mockFindFirst.mockResolvedValue(null)

        const { consumeMeal } = await import('@/app/actions/inventory')
        await consumeMeal(ingredients)

        expect(mockUpdate).not.toHaveBeenCalled()
        expect(mockDelete).not.toHaveBeenCalled()
    })
})
