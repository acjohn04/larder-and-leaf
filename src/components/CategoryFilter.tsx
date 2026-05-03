'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useEffect, useRef } from 'react'
import { useDictionary } from './DictionaryProvider'

const CATEGORY_FILTERS = [
    { key: 'all', labelKey: 'filterAll' as const, value: '' },
    { key: 'produce', labelKey: 'filterProduce' as const, value: 'Produce' },
    { key: 'dairy', labelKey: 'filterDairy' as const, value: 'Dairy & Eggs' },
    { key: 'pantry', labelKey: 'filterPantry' as const, value: 'Pantry' },
    { key: 'meat', labelKey: 'filterMeat' as const, value: 'Meat & Seafood' },
] as const

export default function CategoryFilter() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const dict = useDictionary()

    const activeCategory = searchParams.get('category') || ''
    const [query, setQuery] = useState(searchParams.get('q') || '')
    const isInitialMount = useRef(true)

    // Debounced search: waits 300ms after the user stops typing, then
    // writes ?q= to the URL so the dashboard server component re-filters.
    // Preserves existing category params. Skips the initial mount to
    // prevent a redundant router.replace on first render.
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false
            return
        }

        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString())
            if (query) {
                params.set('q', query)
            } else {
                params.delete('q')
            }
            router.replace(`/?${params.toString()}`)
        }, 300)

        return () => clearTimeout(timer)
    }, [query, router, searchParams])

    const handleFilter = useCallback((categoryValue: string) => {
        const params = new URLSearchParams(searchParams.toString())

        if (categoryValue) {
            params.set('category', categoryValue)
        } else {
            params.delete('category')
        }

        router.replace(`/?${params.toString()}`)
    }, [router, searchParams])

    return (
        <nav className="flex flex-wrap items-center justify-between gap-3 mb-8">
            {/* Category filter buttons */}
            <div className="flex flex-wrap items-center gap-3">
                {CATEGORY_FILTERS.map((filter) => {
                    const isActive = activeCategory === filter.value
                    return (
                        <button
                            key={filter.key}
                            onClick={() => handleFilter(filter.value)}
                            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                                isActive
                                    ? 'bg-primary text-surface-container-lowest shadow-ambient-sm shadow-primary/15 scale-[1.02]'
                                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container hover:shadow-ambient-sm active:scale-95'
                            }`}
                        >
                            {dict.dashboard[filter.labelKey]}
                        </button>
                    )
                })}
            </div>

            {/* Search input */}
            <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-lg" aria-hidden="true">search</span>
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Escape') setQuery('') }}
                    className={`pl-10 ${query ? 'pr-9' : 'pr-4'} py-2 bg-surface-container-low border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 w-64 outline-none`}
                    placeholder={dict.dashboard.searchPlaceholder}
                    aria-label={dict.dashboard.searchPlaceholder}
                    type="text"
                />
                {query && (
                    <button
                        onClick={() => setQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface transition-colors cursor-pointer p-0.5 rounded-full"
                        aria-label="Clear search"
                        type="button"
                    >
                        <span className="material-symbols-outlined text-base">close</span>
                    </button>
                )}
            </div>
        </nav>
    )
}
