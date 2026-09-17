"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Leaf, Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SignupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Passwords do not match" });
      return;
    }
    if (password.length < 8) {
      toast({ variant: "destructive", title: "Password too short", description: "Min. 8 characters required." });
      return;
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      toast({ variant: "destructive", title: "Weak password", description: "Use at least one letter and one number." });
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      // Supabase returns a fake-success user (no error) for an email that's
      // already registered, to avoid leaking which emails exist. An empty
      // `identities` array on the returned user is the tell.
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        toast({
          variant: "destructive",
          title: "Account already exists",
          description: "This email is already registered. Try logging in instead.",
        });
        return;
      }

      toast({ title: "Account created!", description: "Let's set up your profile." });
      router.push("/profile-setup");
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: err instanceof Error ? err.message : "Could not create account",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="p-3 bg-primary rounded-2xl mb-4 shadow-lg shadow-primary/20">
          <Leaf className="h-7 w-7 text-on-primary" />
        </div>
        <h1 className="text-2xl font-semibold text-on-surface tracking-tight">Create account</h1>
        <p className="text-on-surface-variant text-sm mt-1 text-center">Start your personalized nutrition journey</p>
      </div>

      {/* Card */}
      <div className="w-full bg-surface-container-lowest/95 backdrop-blur-sm border border-outline-variant/50 p-8 rounded-2xl shadow-sm">
        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-on-surface-variant px-1">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-on-surface-variant pointer-events-none" />
              <Input
                type="email" placeholder="name@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                required disabled={loading}
                className="pl-10 border-outline-variant focus-visible:ring-primary-container focus:border-primary rounded-lg h-12"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-on-surface-variant px-1">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-on-surface-variant pointer-events-none" />
              <Input
                type={showPassword ? "text" : "password"} placeholder="Min. 8 characters, 1 letter + 1 number"
                value={password} onChange={(e) => setPassword(e.target.value)}
                required disabled={loading}
                className="pl-10 pr-10 border-outline-variant focus-visible:ring-primary-container focus:border-primary rounded-lg h-12"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors">
                {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-on-surface-variant px-1">Confirm password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-on-surface-variant pointer-events-none" />
              <Input
                type="password" placeholder="Repeat password"
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                required disabled={loading}
                className="pl-10 border-outline-variant focus-visible:ring-primary-container focus:border-primary rounded-lg h-12"
              />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-medium text-base rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 group">
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</>
            ) : (
              <><span>Get Started</span><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-on-surface-variant">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary font-bold hover:text-on-primary-container transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
