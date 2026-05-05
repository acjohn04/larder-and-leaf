import Link from 'next/link';
import { getInventory } from './actions/inventory';
import DeleteButton from '../components/DeleteButton';
import CategoryFilter from '../components/CategoryFilter';
import { getDictionary } from '@/dictionaries';
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

    // Compute stat card values.
    // "Expiring soon" = items whose expiresAt falls within the next 3 days
    // (but not already expired). "Low stock" = items at or below their
    // user-defined minThreshold.
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    const expiringSoonCount = filteredInventory.filter(item =>
        item.expiresAt &&
        new Date(item.expiresAt) <= threeDaysFromNow &&
        new Date(item.expiresAt) >= now
    ).length;

    const lowStockCount = filteredInventory.filter(item =>
        item.minThreshold > 0 && item.quantity <= item.minThreshold
    ).length;

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
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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
                    <span className="material-symbols-outlined text-error text-3xl">notification_important</span>
                    <div>
                        <p className="text-4xl font-bold text-error">{expiringSoonCount}</p>
                        <p className="text-sm font-medium text-error/70 uppercase tracking-widest">{dict.dashboard.expiringSoon}</p>
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
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
                    {filteredInventory.map((item) => {
                        const isExpiring = item.expiresAt && new Date(item.expiresAt) <= threeDaysFromNow;
                        const isLowStock = item.minThreshold > 0 && item.quantity <= item.minThreshold;

                        return (
                            <div key={item.id} className={`bg-surface-container-low p-5 rounded-2xl border transition-all group ${isExpiring ? 'border-error/30 bg-error/[0.02]' : 'border-outline-variant/10'} hover:shadow-ambient-md`}>
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
                                    <DeleteButton id={item.id} name={item.name} />
                                </div>
                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/5">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-lg font-bold ${isLowStock ? 'text-error' : 'text-primary'}`}>{item.quantity}</span>
                                        <span className="text-xs text-on-surface-variant font-medium lowercase">{item.unit}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </section>
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
