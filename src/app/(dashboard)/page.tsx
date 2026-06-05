import Link from 'next/link';
import { getInventory } from '@/app/actions/inventory';
import CategoryFilter from '@/components/CategoryFilter';
import DashboardGrid from '@/components/DashboardGrid';
import { getDictionary } from '@/dictionaries';
import { isExpired, isExpiringSoon, isLowStock } from '@/lib/inventory';
import { InventoryItem } from '@prisma/client';

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; category?: string }>;
}) {
    const { q, category } = await searchParams;
    const inventory = (await getInventory()) as InventoryItem[];
    const dict = await getDictionary();

    // Two-pass filter pipeline: search query (substring) → category (exact match).
    // Both are driven by URL search params set by CategoryFilter.
    const searchFiltered = q
        ? inventory.filter(item =>
            item.name.toLowerCase().includes(q.toLowerCase()) ||
            item.category.toLowerCase().includes(q.toLowerCase())
        )
        : inventory;

    const filteredInventory = category
        ? searchFiltered.filter(item => item.category.toLowerCase() === category.toLowerCase())
        : searchFiltered;

    // Compute stat card values using the shared helpers from @/lib/inventory
    // so that badge logic and counts always agree.
    const now = new Date();

    const expiredCount = filteredInventory.filter(item => isExpired(item, now)).length;
    const expiringSoonCount = filteredInventory.filter(item => isExpiringSoon(item, now)).length;
    const lowStockCount = filteredInventory.filter(item => isLowStock(item)).length;

    return (
        <div>
            {/* Hero Header Section */}
            <section className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-extrabold text-on-surface tracking-tight mb-2 font-display">
                        {dict.dashboard.title}
                    </h1>
                    <p className="text-on-surface-variant text-lg max-w-xl">
                        {dict.dashboard.subtitle}
                    </p>
                </div>
                <Link href="/intake" className="bg-primary text-surface-container-lowest px-8 py-4 rounded-full font-bold flex items-center gap-3 shadow-ambient-md shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all w-fit">
                    <span className="material-symbols-outlined" data-icon="receipt_long">receipt_long</span>
                    {dict.dashboard.addReceipt}
                </Link>
            </section>

            {/* Quick Stats Bento Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                <div className="bg-surface-container-low p-6 rounded-3xl flex flex-col justify-between min-h-[160px]">
                    <span className="material-symbols-outlined text-primary text-3xl">eco</span>
                    <div>
                        <p className="text-4xl font-bold text-primary">{filteredInventory.length}</p>
                        <p className="text-sm font-medium text-primary/70 uppercase tracking-widest">
                            {q ? dict.dashboard.searchResults : dict.dashboard.totalItems}
                        </p>
                    </div>
                </div>
                <div className="bg-error/10 p-6 rounded-3xl flex flex-col justify-between min-h-[160px]">
                    <span className="material-symbols-outlined text-error text-3xl">event_busy</span>
                    <div>
                        <p className="text-4xl font-bold text-error">{expiredCount}</p>
                        <p className="text-sm font-medium text-error/70 uppercase tracking-widest">{dict.dashboard.expiredItems}</p>
                    </div>
                </div>
                <div className="bg-error/5 p-6 rounded-3xl flex flex-col justify-between min-h-[160px]">
                    <span className="material-symbols-outlined text-error/70 text-3xl">notification_important</span>
                    <div>
                        <p className="text-4xl font-bold text-error/70">{expiringSoonCount}</p>
                        <p className="text-sm font-medium text-error/50 uppercase tracking-widest">{dict.dashboard.expiringSoon}</p>
                    </div>
                </div>
                <div className="bg-surface-container p-6 rounded-3xl flex flex-col justify-between min-h-[160px]">
                    <span className="material-symbols-outlined text-on-primary-container text-3xl">shopping_cart</span>
                    <div>
                        <p className="text-4xl font-bold text-on-primary-container">{lowStockCount}</p>
                        <p className="text-sm font-medium text-on-primary-container/70 uppercase tracking-widest">{dict.dashboard.lowStock}</p>
                    </div>
                </div>
            </section>

            {/* Filters */}
            <CategoryFilter />

            {/* Inventory Content */}
            {filteredInventory.length > 0 ? (
                <DashboardGrid items={filteredInventory} now={now.toISOString()} />
            ) : (
                <section className="mb-12 flex flex-col items-center justify-center text-center py-24 bg-surface-container-low rounded-[3rem] border-ghost">
                    <span className="material-symbols-outlined text-outline-variant text-5xl mb-4">inventory_2</span>
                    <h2 className="text-2xl font-bold font-display mb-2">{dict.dashboard.emptyTitle}</h2>
                    <p className="text-on-surface-variant max-w-sm mb-6">{dict.dashboard.emptyDescription}</p>
                    <Link href="/intake" className="bg-surface-container-lowest text-primary px-6 py-3 rounded-full font-bold shadow-ambient-md border-ghost active:scale-95 transition-all">
                        {dict.dashboard.startScanning}
                    </Link>
                </section>
            )}
        </div>
    );
}
