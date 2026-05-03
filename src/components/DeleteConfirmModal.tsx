'use client'

import { useDictionary } from './DictionaryProvider'

export default function DeleteConfirmModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    itemName 
}: { 
    isOpen: boolean, 
    onClose: () => void, 
    onConfirm: () => void,
    itemName?: string
}) {
    const dict = useDictionary()

    if (!isOpen) return null

    const displayName = itemName || dict.deleteModal.fallbackName

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface-container-lowest w-full max-w-sm rounded-[2.5rem] shadow-ambient-lg p-8 animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center">
                    <div className="h-16 w-16 bg-error/10 rounded-2xl flex items-center justify-center text-error mb-6">
                        <span className="material-symbols-outlined text-4xl">delete_forever</span>
                    </div>
                    
                    <h2 className="text-2xl font-bold font-display text-on-surface mb-2">{dict.deleteModal.title}</h2>
                    <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
                        {dict.deleteModal.description.replace('{itemName}', displayName)}
                    </p>

                    <div className="flex flex-col w-full gap-3">
                        <button 
                            onClick={onConfirm}
                            className="w-full py-4 bg-error text-on-error rounded-2xl font-bold shadow-ambient-md shadow-error/20 active:scale-95 transition-all"
                        >
                            {dict.deleteModal.confirm}
                        </button>
                        <button 
                            onClick={onClose}
                            className="w-full py-4 bg-surface-container-high text-on-surface rounded-2xl font-bold active:scale-95 transition-all"
                        >
                            {dict.deleteModal.cancel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
