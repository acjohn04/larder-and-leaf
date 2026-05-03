'use client'

import { useDictionary } from './DictionaryProvider'
import Image from 'next/image'

export default function TopNav() {
    const dict = useDictionary()

    return (
        <header className="fixed top-0 w-full z-50 bg-glass border-b border-zinc-200/20">
            <div className="flex justify-between items-center px-6 h-16 max-w-screen-2xl mx-auto">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <Image src="/logo.png" alt="Logo" width={28} height={28} className="rounded-md" />
                        <span className="text-xl font-bold tracking-tight text-primary font-display">{dict.topNav.brand}</span>
                    </div>
                </div>
            </div>
        </header>
    )
}
