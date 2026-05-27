"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatILS, formatDuration } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Call } from "@/types";

const LOW_BALANCE_THRESHOLD_AGOROT = 1000; // 10 ₪

export default function CallPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [call, setCall] = useState<Call | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [charged, setCharged] = useState(0);
  const [balance, setBalance] = useState(0);
  const [lowBalance, setLowBalance] = useState(false);
  const [muted, setMuted] = useState(false);
  const [screenShare, setScreenShare] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [ending, setEnding] = useState(false);
  const rateRef = useRef(0);

  useEffect(() => {
    const supabase = createClient();

    supabase
      .from("calls")
      .select(`*, request:help_requests(max_rate_per_minute)`)
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (!data) return;
        setCall(data as Call);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rateRef.current = (data as any).request?.max_rate_per_minute ?? 1000;
      });

    supabase
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (!user) return;
        supabase
          .from("profiles")
          .select("wallet_balance")
          .eq("id", user.id)
          .single()
          .then(({ data }) => {
            if (data) setBalance(data.wallet_balance);
          });
      });

    const timer = setInterval(() => {
      setElapsed((s) => {
        const next = s + 1;
        const cost = Math.floor((next / 60) * rateRef.current);
        setCharged(cost);
        setBalance((b) => {
          const remaining = b - rateRef.current / 60;
          setLowBalance(remaining < LOW_BALANCE_THRESHOLD_AGOROT);
          return b;
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [id]);

  async function endCall() {
    setEnding(true);
    const supabase = createClient();
    await supabase
      .from("calls")
      .update({ status: "ended", ended_at: new Date().toISOString() })
      .eq("id", id);
    router.replace(`/call/${id}/review`);
  }

  const expertName = "מומחה";
  const isClient = true;

  return (
    <div className="min-h-svh bg-black flex flex-col max-w-[430px] mx-auto">
      {/* Video area */}
      <div className="flex-1 relative bg-gradient-to-br from-[#1a2030] to-[#0a1018] flex items-center justify-center overflow-hidden">
        {/* Remote video placeholder */}
        <div className="flex flex-col items-center gap-3">
          <Avatar name={expertName} size="xl" />
          <span className="text-white text-xl font-bold">{expertName}</span>
          {screenShare && (
            <span className="text-[var(--accent)] text-sm flex items-center gap-1">
              🖥️ משתף מסך
            </span>
          )}
        </div>

        {/* PiP - self view */}
        <div className="absolute top-4 left-4 w-24 h-32 bg-[#2a3040] rounded-xl border border-white/10 flex items-center justify-center text-[var(--text-tertiary)] text-xs">
          אתה
        </div>

        {/* Info bar */}
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-lg rounded-2xl px-3 py-2 flex items-center gap-3">
          <div
            className="w-2 h-2 rounded-full bg-[var(--danger)]"
            style={{ animation: "blink 1.5s infinite" }}
          />
          <span
            className="text-white font-bold"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {formatDuration(elapsed)}
          </span>
          <span
            className="text-sm font-bold"
            style={{
              color: lowBalance ? "var(--warning)" : "var(--accent)",
            }}
          >
            {isClient ? formatILS(charged) : `+${formatILS(charged)}`}
          </span>
        </div>

        {/* Low balance warning */}
        {lowBalance && (
          <div className="absolute bottom-20 inset-x-4 bg-[rgba(255,170,0,0.15)] border border-[var(--warning)] backdrop-blur-lg rounded-xl p-3 text-center">
            <p className="text-[var(--warning)] text-sm font-bold mb-2">
              ⚠️ היתרה נמוכה — השיחה תסתיים אוטומטית בקרוב
            </p>
            <button
              onClick={() => router.push("/wallet/topup?return=" + encodeURIComponent(`/call/${id}`))}
              className="bg-[var(--warning)] text-black px-4 py-2 rounded-lg font-bold text-sm"
            >
              + הטען עכשיו
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black/90 backdrop-blur-xl px-6 py-4 pb-8 flex items-center justify-around gap-3">
        <button
          onClick={() => setMuted((m) => !m)}
          className={`w-13 h-13 rounded-full flex items-center justify-center text-2xl transition-all ${
            muted ? "bg-[var(--accent)] text-black" : "bg-white/10 text-white"
          }`}
          style={{ width: 52, height: 52 }}
        >
          {muted ? "🔇" : "🎤"}
        </button>

        <button
          className="bg-white/10 text-white rounded-full flex items-center justify-center text-2xl"
          style={{ width: 52, height: 52 }}
        >
          📹
        </button>

        <button
          onClick={() => setScreenShare((s) => !s)}
          className={`rounded-full flex items-center justify-center text-2xl transition-all ${
            screenShare ? "bg-[var(--accent)] text-black" : "bg-white/10 text-white"
          }`}
          style={{ width: 52, height: 52 }}
        >
          🖥️
        </button>

        <button
          className="bg-white/10 text-white rounded-full flex items-center justify-center text-2xl"
          style={{ width: 52, height: 52 }}
        >
          💬
        </button>

        {/* End call */}
        <button
          onClick={() => setShowEndConfirm(true)}
          className="rounded-full bg-[var(--danger)] text-white flex items-center justify-center text-2xl"
          style={{ width: 64, height: 64 }}
        >
          📞
        </button>
      </div>

      {/* End confirm dialog */}
      {showEndConfirm && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-xs text-center">
            <h3 className="text-xl font-black mb-2">לסיים את השיחה?</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-6">
              תחויב על {formatDuration(elapsed)} דקות
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowEndConfirm(false)}
              >
                ביטול
              </Button>
              <Button variant="danger" loading={ending} onClick={endCall}>
                סיים
              </Button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes blink {
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
