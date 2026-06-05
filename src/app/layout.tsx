import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from '@/components/AuthSessionProvider';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import DemoBanner from '@/components/DemoBanner';

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
  description: "The Intelligent Pantry",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${vietnam.variable} h-full antialiased`}
    >
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <style>{`.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }`}</style>
      </head>
      <body className="min-h-full flex flex-col font-body bg-surface text-on-surface">
        {isDemoMode && <DemoBanner />}
        <AuthSessionProvider>
          <ServiceWorkerRegister />
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}
