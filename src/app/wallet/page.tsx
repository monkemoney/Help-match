import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WalletView } from "@/components/client/wallet-view";

export default async function WalletPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: transactions }] = await Promise.all([
    supabase.from("profiles").select("wallet_balance, full_name").eq("id", user.id).single(),
    supabase
      .from("wallet_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <WalletView
      balance={profile?.wallet_balance ?? 0}
      transactions={transactions ?? []}
    />
  );
}
