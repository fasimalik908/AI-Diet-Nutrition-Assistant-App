import type { Metadata } from "next";
import { SignupForm } from "@/components/shared/signup-form";

export const metadata: Metadata = { title: "Create Account" };

export default function SignupPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-surface overflow-hidden">
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-secondary-container/20 blur-[150px] rounded-full" />
      </div>
      <SignupForm />
    </div>
  );
}
