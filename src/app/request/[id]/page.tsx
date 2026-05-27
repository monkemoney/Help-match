"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/avatar";
import { formatILS } from "@/lib/utils";
import type { HelpRequest } from "@/types";

export default function RequestPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [request, setRequest] = useState<HelpRequest | null>(null);
  const [waitSeconds, setWaitSeconds] = useState(0);
  const [viewedCount, setViewedCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();

    // Initial fetch
    supabase
      .from("help_requests")
      .select(`*, client:profiles!client_id(*), expert:expert_profiles(*, profile:profiles(*))`)
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data) setRequest(data as HelpRequest);
        if ((data as HelpRequest)?.status === "in_call") {
          router.replace(`/call/${(data as HelpRequest).call_id}`);
        }
      });

    // Realtime subscription
    const channel = supabase
      .channel(`request:${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "help_requests",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          const updated = payload.new as HelpRequest;
          setRequest(updated);
          if (updated.status === "in_call" && updated.call_id) {
            router.replace(`/call/${updated.call_id}`);
          }
          if (updated.status === "cancelled" || updated.status === "expired") {
            router.replace("/dashboard");
          }
        }
      )
      .subscribe();

    // Wait timer
    const timer = setInterval(() => setWaitSeconds((s) => s + 1), 1000);

    // Simulate viewed count increasing
    const viewTimer = setInterval(() => {
      setViewedCount((v) => Math.min(v + 1, 8));
    }, 8000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(timer);
      clearInterval(viewTimer);
    };
  }, [id, router]);

  async function cancelRequest() {
    const supabase = createClient();
    await supabase
      .from("help_requests")
      .update({ status: "cancelled" })
      .eq("id", id);
    router.replace("/dashboard");
  }

  const formatWait = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // Expert found state
  if (request?.status === "claimed" && request.expert) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const expertName = (request.expert as any).profile?.full_name ?? "מומחה";
    const rate = request.expert.rate_per_minute;

    return (
      <MobileShell>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
          {/* Avatar with check */}
          <div className="relative mb-6">
            <Avatar name={expertName} size="xl" />
            <div className="absolute -bottom-1 -left-1 w-8 h-8 bg-[var(--accent)] border-4 border-[var(--bg)] rounded-full flex items-center justify-center text-black font-bold">
              ✓
            </div>
          </div>

          <div className="text-[var(--accent)] text-xs font-bold uppercase tracking-widest mb-2">
            נמצא מומחה!
          </div>
          <h2 className="text-3xl font-black mb-1">{expertName}</h2>
          <p className="text-[var(--text-secondary)] mb-1">
            ⭐ {request.expert.rating.toFixed(1)} • {request.expert.total_calls} שיחות
          </p>

          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 w-full mt-6 mb-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">תמחיר</span>
              <span className="font-bold">{formatILS(rate)}/דקה</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">מינ׳ חיוב</span>
              <span className="font-bold">
                {request.expert.min_call_minutes} דקות (
                {formatILS(rate * request.expert.min_call_minutes)})
              </span>
            </div>
          </div>

          <div className="bg-[rgba(0,170,255,0.1)] border border-[var(--info)] rounded-xl p-3 w-full mb-8 text-sm">
            ⏱ <strong>המומחה מתחבר תוך שניות</strong>
            <br />
            <span className="text-[var(--text-secondary)] text-xs">
              השיחה תתחיל אוטומטית כשהוא מצטרף
            </span>
          </div>

          <Button variant="secondary" onClick={cancelRequest} className="mt-auto">
            ביטול
          </Button>
        </div>
      </MobileShell>
    );
  }

  // Waiting state
  return (
    <MobileShell>
      <header className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] flex-shrink-0">
        <button
          onClick={cancelRequest}
          className="text-[var(--danger)] font-semibold"
        >
          ✕ ביטול
        </button>
        <span className="font-bold">מחפש מומחה...</span>
        <span />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 text-center">
        {/* Pulse animation */}
        <div className="relative w-32 h-32 flex items-center justify-center mb-8">
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{ background: "rgba(0,255,136,0.1)", animationDuration: "2s" }}
          />
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              background: "rgba(0,255,136,0.07)",
              animationDuration: "2s",
              animationDelay: "1s",
            }}
          />
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl relative z-10"
            style={{ background: "var(--accent)", color: "#000" }}
          >
            🔍
          </div>
        </div>

        <h2 className="text-2xl font-black mb-2">מחפש מומחה זמין</h2>
        <p className="text-[var(--text-secondary)] text-sm mb-8 max-w-xs">
          בממוצע 2-3 דקות. נשלח לך התראה ברגע שמומחה מגיב.
        </p>

        {/* Stats card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 w-full space-y-3 mb-8 text-sm">
          <div className="flex justify-between">
            <span>📤 בקשה נשלחה ל-</span>
            <span className="font-bold text-[var(--accent)]">
              {request?.max_rate_per_minute ? "14" : "..."} מומחים
            </span>
          </div>
          <div className="flex justify-between">
            <span>👀 צפו בבקשה</span>
            <span className="font-bold text-[var(--accent)]">{viewedCount} מומחים</span>
          </div>
          <div className="flex justify-between">
            <span>⏱ זמן המתנה</span>
            <span className="font-bold text-[var(--accent)]">{formatWait(waitSeconds)}</span>
          </div>
        </div>

        <p className="text-xs text-[var(--text-tertiary)] max-w-xs">
          אתה לא מחויב עד שמומחה לוקח את הבקשה ונכנס איתך לשיחה.
        </p>
      </div>
    </MobileShell>
  );
}
