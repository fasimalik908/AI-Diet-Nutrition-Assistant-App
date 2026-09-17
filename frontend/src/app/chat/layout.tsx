import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export const metadata: Metadata = { title: "AI Coach" };

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="h-screen overflow-hidden bg-surface">
      <Sidebar userEmail={user.email} userName={profile?.name || user.user_metadata?.name} />
      <MobileNav />
      <main className="md:ml-64 h-screen pb-24 md:pb-0">
        <div className="h-full max-w-6xl mx-auto p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
