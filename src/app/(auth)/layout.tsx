import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from "next/font/google";
import "../globals.css";

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
  title: "Sign In — Larder & Leaf",
  description: "Sign in to access your digital pantry.",
};

/**
 * Minimal layout for the auth pages — no sidebar, no TopNav, no MobileNav.
 * This gives the login page a clean, focused look.
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <main className="flex-1 flex items-center justify-center p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
