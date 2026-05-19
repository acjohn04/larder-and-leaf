"use client";

import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center px-4 w-full h-full">
      <span className="material-symbols-outlined text-6xl text-error opacity-80">
        error
      </span>
      <div className="space-y-2">
        <h2 className="text-3xl font-display font-semibold text-on-surface">Something went wrong</h2>
        <p className="text-on-surface-variant max-w-md">
          We encountered an unexpected error. Please try again.
        </p>
      </div>
      <button
        onClick={() => reset()}
        className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-medium hover:opacity-90 transition-opacity shadow-ambient-sm"
      >
        Try again
      </button>
    </div>
  );
}
