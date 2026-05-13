import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { Suspense } from 'react';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import TopNav from '../components/TopNav';
import { getDictionary } from '@/dictionaries';
import { DictionaryProvider } from '@/components/DictionaryProvider';
import AuthSessionProvider from '@/components/AuthSessionProvider';

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const vietnam = Be_Vietnam_Pro({
  weight: ["400", "500", "600", "700"],
  variable: "--font-vietnam",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Larder & Leaf",
  description: "The Digital Market Stand",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dict = await getDictionary();

  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${vietnam.variable} h-full antialiased`}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <style>{`.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }`}</style>
      </head>
      <body className="min-h-full flex flex-col font-body bg-surface text-on-surface">
        <AuthSessionProvider>
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
        </AuthSessionProvider>
      </body>
    </html>
  );
}
