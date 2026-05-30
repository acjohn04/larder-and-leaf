'use client'

import { useState } from 'react'
import { useIsClient } from '@/lib/hooks'
import { createPortal } from 'react-dom'
import { updateInventoryItem } from '@/app/actions/inventory'
import { useDictionary } from './DictionaryProvider'
import type { InventoryItem } from '@prisma/client'

export default function EditItemModal({ isOpen, onClose, item }: { isOpen: boolean, onClose: () => void, item: InventoryItem }) {
    const [name, setName] = useState(item.name)
    const [category, setCategory] = useState(item.category)
    const [quantity, setQuantity] = useState(item.quantity)
    const [unit, setUnit] = useState(item.unit)
    const [minThreshold, setMinThreshold] = useState(item.minThreshold)
    const [expiresAt, setExpiresAt] = useState(
        item.expiresAt ? new Date(item.expiresAt).toISOString().split('T')[0] : ''
    )
    const [isSaving, setIsSaving] = useState(false)
    const isClient = useIsClient()
    const dict = useDictionary()

    if (!isClient || !isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            await updateInventoryItem({
                id: item.id,
                name,
                category,
                quantity,
                unit,
                minThreshold,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
            })
            onClose()
        } catch (error) {
            console.error('Failed to update item:', error)
            alert(dict.editItemModal.errorMessage)
        } finally {
            setIsSaving(false)
        }
    }

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface-container-lowest w-full max-w-md rounded-[2.5rem] shadow-ambient-lg p-8 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold font-display text-on-surface">{dict.editItemModal.title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                        <span className="material-symbols-outlined text-on-surface-variant">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">{dict.editItemModal.labelName}</label>
                        <input 
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">{dict.editItemModal.labelQuantity}</label>
                            <input 
                                required
                                type="number"
                                min="0"
                                step="0.1"
                                value={quantity}
                                onChange={(e) => setQuantity(parseFloat(e.target.value))}
                                className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">{dict.editItemModal.labelUnit}</label>
                            <input 
                                required
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">{dict.editItemModal.labelCategory}</label>
                        <select 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium appearance-none"
                        >
                            <option value="produce">{dict.categories.produce}</option>
                            <option value="pantry">{dict.categories.pantry}</option>
                            <option value="dairy_eggs">{dict.categories.dairy_eggs}</option>
                            <option value="meat_seafood">{dict.categories.meat_seafood}</option>
                            <option value="bakery">{dict.categories.bakery}</option>
                            <option value="frozen">{dict.categories.frozen}</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">{dict.editItemModal.labelExpiry}</label>
                        <input 
                            type="date"
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                            className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">{dict.editItemModal.labelMinThreshold}</label>
                        <div className="relative">
                            <input 
                                type="number"
                                min="0"
                                step="0.1"
                                value={minThreshold}
                                onChange={(e) => setMinThreshold(parseFloat(e.target.value) || 0)}
                                className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium pr-16"
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant/50 pointer-events-none uppercase tracking-tighter">
                                {unit}
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={isSaving}
                        className="w-full py-4 bg-primary text-surface-container-lowest rounded-full font-bold shadow-ambient-md shadow-primary/20 hover:shadow-primary/30 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <span className="material-symbols-outlined animate-spin">sync</span>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">check_circle</span>
                                {dict.editItemModal.submit}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>,
        document.body
    )
}
