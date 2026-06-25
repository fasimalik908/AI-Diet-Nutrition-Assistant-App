import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

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

  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      <Sidebar userEmail={user.email} userName={user.user_metadata?.name} />
      <MobileNav />
      <main className="md:ml-64 h-screen pb-16 md:pb-0">
        <div className="h-full max-w-6xl mx-auto p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
