import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ClientDashboard } from "@/components/client/client-dashboard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: recentCalls } = await supabase
    .from("calls")
    .select(`
      *,
      expert:expert_profiles(
        *,
        profile:profiles(full_name)
      )
    `)
    .eq("client_id", user.id)
    .eq("status", "ended")
    .order("ended_at", { ascending: false })
    .limit(5);

  return (
    <ClientDashboard
      profile={profile}
      recentCalls={recentCalls ?? []}
    />
  );
}
