"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { profileAPI } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Leaf, Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      try {
        await profileAPI.get();
        router.push("/dashboard");
        router.refresh();
      } catch {
        router.push("/profile-setup");
        router.refresh();
      }
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: err instanceof Error ? err.message : "Invalid credentials",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      toast({ variant: "destructive", title: "Enter your email first", description: "Type your email above, then tap Forgot password." });
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      toast({ variant: "destructive", title: "Could not send reset email", description: error.message });
    } else {
      toast({ title: "Check your email", description: `Password reset link sent to ${email}.` });
    }
  }

  async function handleOAuth(provider: "google" | "facebook") {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
    if (error) {
      toast({ variant: "destructive", title: `${provider === "google" ? "Google" : "Facebook"} sign-in unavailable`, description: error.message });
    }
  }

  return (
    <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="p-3 bg-primary rounded-2xl mb-4 shadow-lg shadow-primary/20">
          <Leaf className="h-7 w-7 text-on-primary" />
        </div>
        <h1 className="text-2xl font-semibold text-on-surface tracking-tight">Welcome back</h1>
        <p className="text-on-surface-variant text-sm mt-1 text-center">Sign in to continue your nutrition journey</p>
      </div>

      {/* Card */}
      <div className="w-full bg-surface-container-lowest/95 backdrop-blur-sm border border-outline-variant/50 p-8 rounded-2xl shadow-sm">
        <form onSubmit={handleLogin} className="space-y-5">
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
            <div className="flex justify-between items-center px-1">
              <Label className="text-sm font-medium text-on-surface-variant">Password</Label>
              <button type="button" onClick={handleForgotPassword}
                className="text-xs font-semibold text-primary hover:underline transition-all">
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-on-surface-variant pointer-events-none" />
              <Input
                type={showPassword ? "text" : "password"} placeholder="••••••••"
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

          <label className="flex items-center gap-2 px-1 cursor-pointer select-none">
            <input
              type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary-container"
            />
            <span className="text-xs font-medium text-on-surface-variant">Keep me signed in</span>
          </label>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-medium text-base rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 group">
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>
            ) : (
              <><span>Sign In</span><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>
            )}
          </button>
        </form>

        {/* Social login */}
        <div className="relative py-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-outline-variant" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-surface-container-lowest px-4 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
              or continue with
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button type="button" onClick={() => handleOAuth("google")}
            className="flex items-center justify-center gap-2 py-2.5 px-4 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors active:bg-surface-container">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-xs font-medium text-on-surface">Google</span>
          </button>
          <button type="button" onClick={() => handleOAuth("facebook")}
            className="flex items-center justify-center gap-2 py-2.5 px-4 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors active:bg-surface-container">
            <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
            <span className="text-xs font-medium text-on-surface">Facebook</span>
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-on-surface-variant">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-primary font-bold hover:text-on-primary-container transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
