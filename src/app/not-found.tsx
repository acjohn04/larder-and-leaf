import Link from 'next/link';
import { getDictionary } from '@/dictionaries';

export default async function NotFound() {
  const dict = await getDictionary();
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center px-4 w-full h-full">
      <span className="material-symbols-outlined text-6xl text-primary opacity-80">
        storefront
      </span>
      <div className="space-y-2">
        <h2 className="text-3xl font-display font-semibold text-on-surface">{dict.notFound.title}</h2>
        <p className="text-on-surface-variant max-w-md">
          {dict.notFound.description}
        </p>
      </div>
      <Link 
        href="/"
        className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-medium hover:opacity-90 transition-opacity shadow-ambient-sm"
      >
        {dict.notFound.returnToDashboard}
      </Link>
    </div>
  );
}
