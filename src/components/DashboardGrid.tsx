'use client'

import { useState } from 'react'
import DeleteButton from './DeleteButton'
import EditItemModal from './EditItemModal'
import { useDictionary } from './DictionaryProvider'
import type { InventoryItem } from '@prisma/client'

export default function DashboardGrid({ items, now }: { items: InventoryItem[], now: string }) {
    const [editItem, setEditItem] = useState<InventoryItem | null>(null)
    const dict = useDictionary()

    const nowDate = new Date(now)
    const threeDaysFromNow = new Date(now)
    threeDaysFromNow.setDate(nowDate.getDate() + 3)

    return (
        <>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
                {items.map((item) => {
                    // Bug fix: use the same window as the stat card count —
                    // only items in [now, now+3days] are "expiring soon",
                    // not items already past their expiration.
                    const isExpiring = item.expiresAt &&
                        new Date(item.expiresAt) <= threeDaysFromNow &&
                        new Date(item.expiresAt) >= nowDate
                    const isLowStock = item.minThreshold > 0 && item.quantity <= item.minThreshold

                    return (
                        <div
                            key={item.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setEditItem(item)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setEditItem(item) }}
                            className={`bg-surface-container-low p-5 rounded-2xl border transition-all group cursor-pointer ${isExpiring ? 'border-error/30 bg-error/[0.02]' : 'border-outline-variant/10'} hover:shadow-ambient-md`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-on-surface leading-tight">{item.name}</h3>
                                        {isExpiring && (
                                            <span className="bg-error text-on-error text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter">{dict.dashboard.expiring}</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mt-1">
                                        {dict.categories[item.category.toLowerCase() as keyof typeof dict.categories] || item.category}
                                    </p>
                                </div>
                                <div onClick={(e) => e.stopPropagation()}>
                                    <DeleteButton id={item.id} name={item.name} />
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/5">
                                <div className="flex items-center gap-2">
                                    <span className={`text-lg font-bold ${isLowStock ? 'text-error' : 'text-primary'}`}>{item.quantity}</span>
                                    <span className="text-xs text-on-surface-variant font-medium lowercase">{item.unit}</span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </section>

            {editItem && (
                <EditItemModal
                    isOpen={true}
                    item={editItem}
                    onClose={() => setEditItem(null)}
                />
            )}
        </>
    )
}
