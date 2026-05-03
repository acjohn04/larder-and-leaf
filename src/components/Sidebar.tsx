'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS } from '../constants/navigation'
import { useDictionary } from './DictionaryProvider'
import AddItemModal from './AddItemModal'

export default function Sidebar() {
    const pathname = usePathname()
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const dict = useDictionary()

    return (
        <aside className="hidden md:flex flex-col p-4 space-y-2 h-[calc(100vh-64px)] w-64 bg-surface fixed left-0">
            <div className="px-4 py-6">
                <h2 className="text-lg font-black text-primary font-display">{dict.sidebar.heading}</h2>
            </div>
            
            {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href
                return (
                    <Link 
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 hover:translate-x-1 ${
                            isActive 
                            ? 'bg-surface-container-lowest text-primary shadow-sm' 
                            : 'text-on-surface-variant hover:text-primary'
                        }`}
                    >
                        <span className="material-symbols-outlined" data-icon={item.icon}>{item.icon}</span>
                        <span className="text-sm font-medium">{dict.nav[item.nameKey]}</span>
                    </Link>
                )
            })}

            <div className="mt-auto p-4">
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full py-4 bg-primary text-surface-container-lowest rounded-full font-bold shadow-ambient-md shadow-primary/20 hover:shadow-primary/30 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined" data-icon="add_circle" aria-hidden="true">add_circle</span>
                    {dict.sidebar.addItem}
                </button>
            </div>

            <AddItemModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
            />
        </aside>
    )
}
