'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth, requireAuth } from '@/lib/auth'

const JoinHouseholdSchema = z.object({
    inviteCode: z.string().min(1, "Invite code is required").max(100),
})

export async function getHouseholdDetails() {
    const householdId = await requireAuth()

    return prisma.household.findUnique({
        where: { id: householdId },
        include: {
            users: {
                select: { id: true, name: true, email: true, image: true }
            }
        }
    })
}

export async function joinHousehold(rawCode: string) {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const { inviteCode } = JoinHouseholdSchema.parse({ inviteCode: rawCode })

    const targetHousehold = await prisma.household.findUnique({
        where: { inviteCode }
    })

    if (!targetHousehold) {
        throw new Error("Invalid invite code")
    }

    // Update the user's household
    await prisma.user.update({
        where: { id: session.user.id },
        data: { householdId: targetHousehold.id }
    })

    revalidatePath('/')
    revalidatePath('/settings')
    
    return { success: true }
}

export async function regenerateInviteCode() {
    const householdId = await requireAuth()

    // Using cuid() natively in Prisma requires a schema default, 
    // but in code we can use crypto or just let the database handle it if we want.
    // Instead of importing cuid, we can generate a random string, or just use crypto.randomUUID
    const newCode = crypto.randomUUID()

    await prisma.household.update({
        where: { id: householdId },
        data: { inviteCode: newCode }
    })

    revalidatePath('/settings')
    
    return { success: true, newCode }
}
