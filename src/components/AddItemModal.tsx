'use client'

import { useState } from 'react'
import { addInventoryItems } from '@/app/actions/inventory'
import { useDictionary } from './DictionaryProvider'

export default function AddItemModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [name, setName] = useState('')
    const [category, setCategory] = useState('pantry')
    const [quantity, setQuantity] = useState(1)
    const [unit, setUnit] = useState('units')
    const [minThreshold, setMinThreshold] = useState(0.2) // Default to 0.2 for 1 unit
    const [isSaving, setIsSaving] = useState(false)
    const dict = useDictionary()

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            await addInventoryItems([{
                name,
                category,
                quantity,
                unit,
                confidenceScore: 1.0, // Manual entry is 100% confident
                minThreshold
            }])
            setName('')
            setCategory('pantry')
            setQuantity(1)
            setUnit('units')
            setMinThreshold(0.2)
            onClose()
        } catch (error) {
            console.error('Failed to add item:', error)
            alert(dict.addItemModal.errorMessage)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface-container-lowest w-full max-w-md rounded-[2.5rem] shadow-ambient-lg p-8 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold font-display text-on-surface">{dict.addItemModal.title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                        <span className="material-symbols-outlined text-on-surface-variant">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">{dict.addItemModal.labelName}</label>
                        <input 
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={dict.addItemModal.placeholderName}
                            className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">{dict.addItemModal.labelQuantity}</label>
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
                            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">{dict.addItemModal.labelUnit}</label>
                            <input 
                                required
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                placeholder={dict.addItemModal.placeholderUnit}
                                className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">{dict.addItemModal.labelCategory}</label>
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
                        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Min Threshold (Low Stock Alert)</label>
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
                        <p className="text-[10px] text-on-surface-variant/70 ml-2 italic">Defaulted to 20% of quantity.</p>
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
                                <span className="material-symbols-outlined">add_task</span>
                                {dict.addItemModal.submit}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
