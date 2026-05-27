import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MobileShell } from "@/components/layout/mobile-shell";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Avatar } from "@/components/ui/avatar";
import { formatILS, formatDuration } from "@/lib/utils";

const clientNavItems = [
  { href: "/dashboard", icon: "🏠", label: "בית" },
  { href: "/wallet", icon: "💰", label: "ארנק" },
  { href: "/history", icon: "📜", label: "היסטוריה" },
  { href: "/profile", icon: "👤", label: "פרופיל" },
];

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: calls } = await supabase
    .from("calls")
    .select(`
      *,
      expert:expert_profiles(
        rate_per_minute,
        profile:profiles(full_name)
      )
    `)
    .eq("client_id", user.id)
    .order("started_at", { ascending: false })
    .limit(50);

  return (
    <MobileShell>
      <header className="flex items-center px-5 py-4 border-b border-[var(--border)] flex-shrink-0">
        <span className="font-bold text-lg">היסטוריה</span>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {(!calls || calls.length === 0) ? (
          <div className="text-center py-16 text-[var(--text-tertiary)]">
            <div className="text-5xl mb-4">📜</div>
            <p className="font-semibold text-lg">אין שיחות עדיין</p>
            <p className="text-sm mt-2">
              <Link href="/request/new" className="text-[var(--accent)]">
                בקש עזרה עכשיו
              </Link>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {calls.map((call) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const expertName = (call as any).expert?.profile?.full_name ?? "מומחה";
              const duration = call.duration_seconds
                ? formatDuration(call.duration_seconds)
                : "--:--";

              return (
                <div
                  key={call.id}
                  className="flex items-center gap-3 p-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)]"
                >
                  <Avatar name={expertName} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{expertName}</div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                      {duration} •{" "}
                      {call.client_rating ? `⭐ ${call.client_rating}` : "ללא דירוג"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[var(--accent)] text-sm">
                      {formatILS(call.total_charged)}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)]">
                      {call.started_at
                        ? new Date(call.started_at).toLocaleDateString("he-IL")
                        : ""}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav items={clientNavItems} />
    </MobileShell>
  );
}
