'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

const UpdateUserPromptsSchema = z.object({
    intakePrompt: z.string().max(1000).optional().nullable(),
    mealGeneratorPrompt: z.string().max(1000).optional().nullable(),
})

export async function updateUserPrompts(rawData: { intakePrompt?: string | null, mealGeneratorPrompt?: string | null }) {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const { intakePrompt, mealGeneratorPrompt } = UpdateUserPromptsSchema.parse(rawData)

    await prisma.user.update({
        where: { id: session.user.id },
        data: {
            intakePrompt,
            mealGeneratorPrompt
        }
    })

    revalidatePath('/settings')
    
    return { success: true }
}
