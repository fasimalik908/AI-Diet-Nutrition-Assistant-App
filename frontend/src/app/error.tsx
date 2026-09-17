"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-surface overflow-hidden">
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-tertiary-container/10 blur-[150px] rounded-full" />
      </div>

      <div className="w-full max-w-md text-center">
        <div className="inline-flex p-3 bg-error-container rounded-2xl mb-6">
          <AlertTriangle className="h-7 w-7 text-on-error-container" />
        </div>
        <h1 className="text-2xl font-semibold text-on-surface">Something went wrong</h1>
        <p className="text-on-surface-variant text-sm mt-2">
          An unexpected error occurred. You can try again, or head back to your dashboard.
        </p>
        <div className="flex gap-3 justify-center mt-8">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-3 bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <RotateCw className="h-4 w-4" /> Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-3 border border-outline-variant text-on-surface-variant hover:bg-surface-container-low font-medium rounded-lg transition-all"
          >
            <Home className="h-4 w-4" /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
