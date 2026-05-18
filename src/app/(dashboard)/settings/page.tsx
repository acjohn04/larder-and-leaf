import { getHouseholdDetails } from '@/app/actions/household'
import SettingsClient from './SettingsClient'
import { redirect } from 'next/navigation'

export const metadata = {
    title: 'Settings - Larder & Leaf',
}

export default async function SettingsPage() {
    const household = await getHouseholdDetails()

    if (!household) {
        // This shouldn't happen unless they somehow bypass requireAuth on the layout or if the db is corrupt.
        // It's safer to redirect to home where requireAuth usually handles creation.
        redirect('/')
    }

    return (
        <SettingsClient 
            householdName={household.name} 
            inviteCode={household.inviteCode} 
            members={household.users} 
        />
    )
}
