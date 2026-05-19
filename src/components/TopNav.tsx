'use client'

import { useDictionary } from './DictionaryProvider'
import Image from 'next/image'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export default function TopNav() {
    const dict = useDictionary()
    const { data: session } = useSession()

    const user = session?.user
    const hasAvatar = !!user?.image

    return (
        <header className="fixed top-0 w-full z-50 bg-glass border-b border-zinc-200/20">
            <div className="flex justify-between items-center px-6 h-16 max-w-screen-2xl mx-auto">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <Image src="/logo.png" alt="Logo" width={28} height={28} className="rounded-md" />
                        <span className="text-xl font-bold tracking-tight text-primary font-display">{dict.topNav.brand}</span>
                    </div>
                </div>

                {!isDemoMode && (
                    <div className="flex items-center gap-3">
                        {/* User info pill */}
                        {user && (
                            <div className="flex items-center gap-2.5 bg-surface-container-low px-3 py-1.5 rounded-full border border-ghost shadow-sm">
                                {hasAvatar ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                        src={user.image!}
                                        alt={user.name ?? 'User avatar'}
                                        className="w-6 h-6 rounded-full object-cover"
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[11px] font-bold select-none">
                                        {user.name?.[0]?.toUpperCase() ?? '?'}
                                    </div>
                                )}
                                <span className="text-sm font-medium text-on-surface-variant max-w-[120px] truncate">
                                    {user.name ?? user.email}
                                </span>
                            </div>
                        )}

                        {/* Settings button */}
                        <Link
                            href="/settings"
                            className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-full border border-ghost shadow-sm"
                        >
                            <span className="material-symbols-outlined text-[18px]">settings</span>
                            Settings
                        </Link>

                        {/* Sign out button */}
                        <button
                            onClick={() => signOut()}
                            className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-full border border-ghost shadow-sm"
                        >
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        </header>
    )
}
