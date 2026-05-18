import { Suspense } from 'react';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import TopNav from '@/components/TopNav';
import { getDictionary } from '@/dictionaries';
import { DictionaryProvider } from '@/components/DictionaryProvider';

/**
 * Dashboard layout — wraps all authenticated pages with the
 * Sidebar, TopNav, and MobileNav chrome.
 */
export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dict = await getDictionary();

  return (
    <DictionaryProvider dictionary={dict}>
      <Suspense fallback={<div className="h-16 border-b border-zinc-200/20" />}>
        <TopNav />
      </Suspense>

      <div className="flex pt-16 min-h-screen max-w-screen-2xl mx-auto w-full">
          <Sidebar />

          {/* Main Content Canvas */}
          <main className="flex-1 md:ml-64 p-6 lg:p-10 w-full pb-24 md:pb-10">
              {children}
          </main>
      </div>

      <MobileNav />
    </DictionaryProvider>
  );
}
