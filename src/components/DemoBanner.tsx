import { getDictionary } from '@/dictionaries'

export default async function DemoBanner() {
  const dict = await getDictionary()

  return (
    <div className="bg-[#fbbf24] text-[#78350f] px-4 py-1.5 text-center text-xs md:text-sm font-bold uppercase tracking-widest shadow-[var(--shadow-ambient-sm)] z-50 relative flex items-center justify-center gap-4">
       <span>{dict.demoBanner.title}</span>
       <span className="hidden sm:inline opacity-50">•</span>
       <span className="hidden sm:inline">{dict.demoBanner.description}</span>
       <span className="hidden sm:inline opacity-50">•</span>
       <span className="hidden sm:inline">{dict.demoBanner.title}</span>
    </div>
  );
}
