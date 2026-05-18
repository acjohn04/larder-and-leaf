import type { Metadata } from "next";

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
    <main className="flex-1 flex items-center justify-center p-6 min-h-screen">
      {children}
    </main>
  );
}
