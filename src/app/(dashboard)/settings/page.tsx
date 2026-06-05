import { getHouseholdDetails } from '@/app/actions/household'
import SettingsClient from './SettingsClient'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const metadata = {
    title: 'Settings - Larder & Leaf',
}

export default async function SettingsPage() {
    const session = await auth()
    if (!session?.user?.id) {
        redirect('/')
    }

    const [household, user] = await Promise.all([
        getHouseholdDetails(),
        prisma.user.findUnique({ where: { id: session.user.id } })
    ])

    if (!household || !user) {
        redirect('/')
    }

    return (
        <SettingsClient 
            householdName={household.name} 
            inviteCode={household.inviteCode} 
            members={household.users} 
            initialIntakePrompt={user.intakePrompt || ''}
            initialMealGeneratorPrompt={user.mealGeneratorPrompt || ''}
        />
    )
}
