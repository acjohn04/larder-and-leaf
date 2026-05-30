'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS } from '../constants/navigation'
import { useDictionary } from './DictionaryProvider'
import AddItemModal from './AddItemModal'

export default function MobileNav() {
    const pathname = usePathname()
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const dict = useDictionary()

    return (
        <>
            <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pt-3 pb-8 md:hidden bg-glass border-t border-surface-container rounded-t-3xl shadow-ambient-lg">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link 
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center rounded-2xl px-6 py-2 active:scale-90 transition-all ${
                                isActive 
                                ? 'bg-primary/10 text-primary' 
                                : 'text-outline-variant hover:text-primary'
                            }`}
                        >
                            <span className="material-symbols-outlined" data-icon={item.icon} aria-hidden="true">{item.icon}</span>
                            <span className="text-[10px] uppercase tracking-widest mt-1 font-bold">{dict.nav[item.nameKey]}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Floating Add Item button — visible only on mobile, positioned above the bottom nav */}
            <button
                onClick={() => setIsAddModalOpen(true)}
                className="fixed bottom-24 right-6 z-50 md:hidden w-14 h-14 bg-primary text-surface-container-lowest rounded-full shadow-ambient-lg shadow-primary/30 flex items-center justify-center active:scale-90 transition-all hover:shadow-primary/40"
                aria-label={dict.sidebar.addItem}
            >
                <span className="material-symbols-outlined text-2xl" aria-hidden="true">add</span>
            </button>

            <AddItemModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />
        </>
    )
}
