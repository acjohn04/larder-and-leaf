'use client'

import { useState } from 'react'
import { joinHousehold, regenerateInviteCode } from '@/app/actions/household'
import { updateUserPrompts } from '@/app/actions/user'
import { useDictionary } from '@/components/DictionaryProvider'

interface SettingsClientProps {
    householdName: string;
    inviteCode: string;
    members: { name: string | null; email: string | null; image: string | null }[];
    initialIntakePrompt: string;
    initialMealGeneratorPrompt: string;
}

export default function SettingsClient({ householdName, inviteCode: initialInviteCode, members, initialIntakePrompt, initialMealGeneratorPrompt }: SettingsClientProps) {
    const [inviteCode, setInviteCode] = useState(initialInviteCode)
    const [joinCode, setJoinCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const [intakePrompt, setIntakePrompt] = useState(initialIntakePrompt)
    const [mealGeneratorPrompt, setMealGeneratorPrompt] = useState(initialMealGeneratorPrompt)
    const [isSavingPrompts, setIsSavingPrompts] = useState(false)
    const dict = useDictionary()

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(inviteCode)
            setSuccess('Copied to clipboard!')
            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            console.error('Failed to copy', err)
        }
    }

    const handleRegenerate = async () => {
        if (!confirm("Are you sure? Anyone using the old code will no longer be able to join.")) return;
        setLoading(true)
        setError(null)
        try {
            const res = await regenerateInviteCode()
            setInviteCode(res.newCode!)
            setSuccess('Generated new invite code!')
            setTimeout(() => setSuccess(null), 3000)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!joinCode.trim()) return
        
        setLoading(true)
        setError(null)
        setSuccess(null)
        try {
            await joinHousehold(joinCode.trim())
            setSuccess('Successfully joined household!')
            setJoinCode('')
            setTimeout(() => setSuccess(null), 3000)
            // Page will likely refresh due to revalidatePath
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to join household')
        } finally {
            setLoading(false)
        }
    }

    const handleSavePrompts = async () => {
        setIsSavingPrompts(true)
        setError(null)
        setSuccess(null)
        try {
            await updateUserPrompts({ intakePrompt, mealGeneratorPrompt })
            setSuccess(dict.settings.promptsSaved)
            setTimeout(() => setSuccess(null), 3000)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : dict.errors.savePromptsFailed)
        } finally {
            setIsSavingPrompts(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold tracking-tight text-primary font-display">{dict.settings.title}</h1>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-200">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm border border-green-200">
                    {success}
                </div>
            )}

            <div className="bg-surface-container-low border border-ghost rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                    <h2 className="text-xl font-semibold text-primary">{householdName}</h2>
                    <p className="text-sm text-on-surface-variant mt-1">
                        {dict.settings.share}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-surface p-4 rounded-2xl border border-ghost">
                    <div className="flex-1">
                        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">{dict.settings.inviteCode}</p>
                        <code className="text-lg font-mono font-bold text-primary select-all">{inviteCode}</code>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button 
                            onClick={handleCopy}
                            className="flex-1 sm:flex-none px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
                        >
                            {dict.settings.copyCode}
                        </button>
                        <button 
                            onClick={handleRegenerate}
                            disabled={loading}
                            className="px-4 py-2 bg-surface-container-high text-on-surface rounded-xl text-sm font-semibold hover:bg-surface-container-highest transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            {dict.settings.reset}
                        </button>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Members ({members.length})</h3>
                    <div className="flex flex-col gap-3">
                        {members.map((m, i) => (
                            <div key={i} className="flex items-center gap-3">
                                {m.image ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={m.image} alt={m.name || 'User'} className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                                        {m.name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-semibold text-on-surface">{m.name}</p>
                                    <p className="text-xs text-on-surface-variant">{m.email}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-surface-container-low border border-ghost rounded-3xl p-6 shadow-sm space-y-4">
                <div>
                    <h2 className="text-xl font-semibold text-primary">{dict.settings.joinHousehold}</h2>
                    <p className="text-sm text-on-surface-variant mt-1">
                        {dict.settings.joinWarning}
                    </p>
                </div>

                <form onSubmit={handleJoin} className="flex gap-3">
                    <input 
                        type="text" 
                        placeholder={dict.settings.enterInviteCode} 
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        className="flex-1 px-4 py-2 rounded-xl border border-ghost bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
                        required
                    />
                    <button 
                        type="submit"
                        disabled={loading || !joinCode.trim()}
                        className="px-6 py-2 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        {dict.settings.join}
                    </button>
                </form>
            </div>

            <div className="bg-surface-container-low border border-ghost rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                    <h2 className="text-xl font-semibold text-primary">{dict.settings.personalization}</h2>
                    <p className="text-sm text-on-surface-variant mt-1">
                        {dict.settings.personalizationDescription}
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                            {dict.settings.intakePrompt}
                        </label>
                        <textarea
                            value={intakePrompt}
                            onChange={(e) => setIntakePrompt(e.target.value)}
                            placeholder={dict.settings.intakePromptPlaceholder}
                            className="w-full px-4 py-3 rounded-xl border border-ghost bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface resize-y min-h-[100px]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                            {dict.settings.mealGeneratorPrompt}
                        </label>
                        <textarea
                            value={mealGeneratorPrompt}
                            onChange={(e) => setMealGeneratorPrompt(e.target.value)}
                            placeholder={dict.settings.mealGeneratorPromptPlaceholder}
                            className="w-full px-4 py-3 rounded-xl border border-ghost bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface resize-y min-h-[100px]"
                        />
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleSavePrompts}
                            disabled={isSavingPrompts}
                            className="px-6 py-2 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            {isSavingPrompts ? dict.settings.saving : dict.settings.savePrompts}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
