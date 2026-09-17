import Link from "next/link";
import { Leaf, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-surface overflow-hidden">
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-secondary-container/20 blur-[150px] rounded-full" />
      </div>

      <div className="w-full max-w-md text-center">
        <div className="inline-flex p-3 bg-primary rounded-2xl mb-6 shadow-lg shadow-primary/20">
          <Leaf className="h-7 w-7 text-on-primary" />
        </div>
        <p className="text-6xl font-bold text-primary tracking-tight">404</p>
        <h1 className="text-2xl font-semibold text-on-surface mt-3">Page not found</h1>
        <p className="text-on-surface-variant text-sm mt-2">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <Home className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
