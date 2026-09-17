"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard, MessageCircle, Camera,
  ChefHat, LogOut, Leaf, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/food-analysis", label: "Food Tracker", icon: Camera },
  { href: "/chat", label: "AI Coach", icon: MessageCircle },
  { href: "/recipe-generator", label: "Recipes", icon: ChefHat },
  { href: "/profile", label: "Profile", icon: User },
];

interface SidebarProps {
  userName?: string;
  userEmail?: string;
}

export function Sidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast({ title: "Logged out", description: "See you next time!" });
    router.push("/auth/login");
  }

  const initials = userName
    ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-primary flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-on-primary/10">
        <div className="p-2 bg-on-primary/15 rounded-xl">
          <Leaf className="h-5 w-5 text-on-primary" />
        </div>
        <div>
          <p className="font-bold text-on-primary leading-tight">NutriVision AI</p>
          <p className="text-xs text-secondary-container">Vitality & Precision</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-secondary-container hover:bg-on-primary/10 hover:text-on-primary"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-on-primary/10 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-on-primary/10">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="text-xs font-bold bg-surface-container-lowest text-primary border-0">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-on-primary truncate">{userName || "User"}</p>
            <p className="text-xs text-secondary-container truncate">{userEmail || ""}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 text-secondary-container hover:text-on-primary hover:bg-on-primary/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
