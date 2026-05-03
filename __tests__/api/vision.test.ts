import { describe, it, expect, vi, beforeEach } from 'vitest'

// --- Mocks ---

const mockGenerateContent = vi.fn()

vi.mock('@/lib/gemini', () => ({
    genAI: {
        getGenerativeModel: () => ({
            generateContent: mockGenerateContent,
        }),
    },
}))

import { POST } from '@/app/api/vision/route'

// --- Helpers ---

function createMockFile(
    content: string | ArrayBuffer,
    name: string,
    type: string,
): File {
    return new File([content], name, { type })
}

function createOversizedFile(sizeInBytes: number, name: string, type: string): File {
    const buffer = new ArrayBuffer(sizeInBytes)
    return new File([buffer], name, { type })
}

function createRequest(file?: File): Request {
    const formData = new FormData()
    if (file) {
        formData.append('image', file)
    }
    // URL is required by the Request constructor but unused by the route handler
    return new Request('http://test/api/vision', {
        method: 'POST',
        body: formData,
    })
}

// --- Tests ---

describe('POST /api/vision', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('input validation', () => {
        it('returns 400 when no image is provided', async () => {
            const req = createRequest()
            const res = await POST(req)
            const body = await res.json()

            expect(res.status).toBe(400)
            expect(body.error).toBe('No image provided')
        })

        it('returns 413 when file exceeds 10 MB', async () => {
            const buffer = new ArrayBuffer(11 * 1024 * 1024)
            const file = new File([buffer], 'huge.jpg', { type: 'image/jpeg' })

            // Bypass FormData serialization which can alter file size
            const mockFormData = new FormData()
            mockFormData.get = vi.fn().mockReturnValue(file)

            const req = {
                formData: vi.fn().mockResolvedValue(mockFormData),
            } as unknown as Request

            const res = await POST(req)
            const body = await res.json()

            expect(res.status).toBe(413)
            expect(body.error).toContain('10 MB')
        })

        it('returns 415 for an invalid MIME type', async () => {
            const file = createMockFile('x', 'doc.pdf', 'application/pdf')
            const req = createRequest(file)
            const res = await POST(req)
            const body = await res.json()

            expect(res.status).toBe(415)
            expect(body.error).toContain('Invalid file type')
        })

        it('returns 415 for a text file', async () => {
            const file = createMockFile('hello', 'notes.txt', 'text/plain')
            const req = createRequest(file)
            const res = await POST(req)
            const _body = await res.json()

            expect(res.status).toBe(415)
        })

        it('accepts image/jpeg', async () => {
            mockGenerateContent.mockResolvedValueOnce({
                response: { text: () => '[]' },
            })

            const file = createMockFile('fake-image', 'photo.jpg', 'image/jpeg')
            const req = createRequest(file)
            const res = await POST(req)

            expect(res.status).toBe(200)
        })

        it('accepts image/png', async () => {
            mockGenerateContent.mockResolvedValueOnce({
                response: { text: () => '[]' },
            })

            const file = createMockFile('fake-image', 'photo.png', 'image/png')
            const req = createRequest(file)
            const res = await POST(req)

            expect(res.status).toBe(200)
        })

        it('accepts image/webp', async () => {
            mockGenerateContent.mockResolvedValueOnce({
                response: { text: () => '[]' },
            })

            const file = createMockFile('fake-image', 'photo.webp', 'image/webp')
            const req = createRequest(file)
            const res = await POST(req)

            expect(res.status).toBe(200)
        })

        it('accepts a file exactly at the 10 MB limit', async () => {
            mockGenerateContent.mockResolvedValueOnce({
                response: { text: () => '[]' },
            })

            const file = createOversizedFile(10 * 1024 * 1024, 'exact.jpg', 'image/jpeg')
            const req = createRequest(file)
            const res = await POST(req)

            expect(res.status).toBe(200)
        })
    })

    describe('error handling', () => {
        it('returns generic error message when Gemini fails', async () => {
            mockGenerateContent.mockRejectedValue(new Error('API key invalid: sk-1234...'))

            const file = createMockFile('fake-image', 'photo.jpg', 'image/jpeg')
            const req = createRequest(file)
            const res = await POST(req)
            const body = await res.json()

            expect(res.status).toBe(500)
            expect(body.error).toBe('Failed to process image. Please try again.')
            // Must NOT leak the internal error message
            expect(body.error).not.toContain('API key')
        })

        it('returns generic error when Gemini returns unparseable JSON', async () => {
            mockGenerateContent.mockResolvedValueOnce({
                response: { text: () => 'not valid json {{{' },
            })

            const file = createMockFile('fake-image', 'photo.jpg', 'image/jpeg')
            const req = createRequest(file)
            const res = await POST(req)
            const body = await res.json()

            expect(res.status).toBe(500)
            expect(body.error).toBe('Failed to process image. Please try again.')
        })
    })

    describe('successful processing', () => {
        it('returns parsed items from Gemini', async () => {
            const mockItems = [
                { uid: '123', name: 'Apple', category: 'Produce' },
            ]
            mockGenerateContent.mockResolvedValueOnce({
                response: { text: () => JSON.stringify(mockItems) },
            })

            const file = createMockFile('fake-image', 'photo.jpg', 'image/jpeg')
            const req = createRequest(file)
            const res = await POST(req)
            const body = await res.json()

            expect(res.status).toBe(200)
            expect(body.items).toEqual(mockItems)
        })
    })
})
