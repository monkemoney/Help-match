"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/layout/mobile-shell";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { formatILS } from "@/lib/utils";
import { IncomingRequestModal } from "@/components/expert/incoming-request-modal";
import type { HelpRequest } from "@/types";

const expertNavItems = [
  { href: "/expert/dashboard", icon: "🏠", label: "בית" },
  { href: "/expert/earnings", icon: "💰", label: "הכנסות" },
  { href: "/history", icon: "📜", label: "שיחות" },
  { href: "/profile", icon: "👤", label: "פרופיל" },
];

export default function ExpertDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);
  const [expertProfile, setExpertProfile] = useState<{
    status: string;
    payout_balance: number;
    rating: number;
  } | null>(null);
  const [available, setAvailable] = useState(false);
  const [incomingRequest, setIncomingRequest] = useState<HelpRequest | null>(null);
  const [recentCalls, setRecentCalls] = useState<
    { id: string; client_name: string; duration: string; earned: number; rating: number }[]
  >([]);
  const [todayEarned, setTodayEarned] = useState(0);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }

      supabase.from("profiles").select("full_name").eq("id", user.id).single()
        .then(({ data }) => data && setProfile(data));

      supabase.from("expert_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (!data) { router.push("/expert/setup"); return; }
          setExpertProfile(data);
          setAvailable(data.status === "online");
        });

      // Subscribe to incoming requests
      const channel = supabase
        .channel("expert-requests")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "help_requests",
            filter: `status=eq.pending`,
          },
          (payload) => {
            setIncomingRequest(payload.new as HelpRequest);
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    });
  }, [router]);

  async function toggleAvailability() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newStatus = available ? "offline" : "online";
    await supabase
      .from("expert_profiles")
      .update({ status: newStatus })
      .eq("user_id", user.id);
    setAvailable(!available);
  }

  const firstName = profile?.full_name?.split(" ")[0] ?? "מומחה";

  return (
    <MobileShell>
      <header className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] flex-shrink-0">
        <span className="text-lg font-bold">היי {firstName} 👋</span>
        <button className="text-2xl">🔔</button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {/* Availability toggle */}
        <button
          onClick={toggleAvailability}
          className={`w-full flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 ${
            available
              ? "border-[var(--accent)] bg-[rgba(0,255,136,0.05)]"
              : "border-[var(--border)] bg-[var(--bg-card)]"
          }`}
        >
          <div className="flex-1 text-right">
            <div className="font-bold mb-0.5">
              {available ? "זמין לשיחות" : "לא זמין"}
            </div>
            <div className="text-xs text-[var(--text-tertiary)]">
              {available ? "תקבל בקשות חדשות" : "לא תקבל בקשות"}
            </div>
          </div>
          <div
            className={`w-14 h-8 rounded-full relative transition-all duration-300 flex-shrink-0 ${
              available ? "bg-[var(--accent)]" : "bg-[var(--surface)]"
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 rounded-full transition-all duration-300 ${
                available ? "right-1 bg-black" : "left-1 bg-white"
              }`}
            />
          </div>
        </button>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: formatILS(todayEarned), label: "היום", color: "var(--accent)" },
            { value: formatILS(expertProfile?.payout_balance ?? 0), label: "השבוע" },
            { value: `⭐ ${(expertProfile?.rating ?? 4.9).toFixed(1)}`, label: "דירוג" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-3 text-center"
            >
              <div
                className="text-lg font-black"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
              <div className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider mt-0.5">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Payout */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold">בר-פדיון</span>
            <span className="text-2xl font-black text-[var(--accent)]">
              {formatILS(expertProfile?.payout_balance ?? 0)}
            </span>
          </div>
          <Button>💸 בקש פדיון</Button>
          <p className="text-center text-xs text-[var(--text-tertiary)] mt-2">
            פדיון מינ׳ 100 ₪ • זמן תהליך 1-3 ימי עסקים
          </p>
        </div>

        {/* Recent calls */}
        {recentCalls.length === 0 && (
          <div className="text-center py-8 text-[var(--text-tertiary)]">
            <div className="text-4xl mb-3">💡</div>
            <p className="font-semibold">אין שיחות עדיין</p>
            <p className="text-sm mt-1">הפעל זמינות ותקבל בקשות</p>
          </div>
        )}
      </div>

      <BottomNav items={expertNavItems} />

      {/* Incoming request modal */}
      {incomingRequest && (
        <IncomingRequestModal
          request={incomingRequest}
          onDismiss={() => setIncomingRequest(null)}
          onAccepted={(callId) => router.push(`/call/${callId}`)}
        />
      )}
    </MobileShell>
  );
}
