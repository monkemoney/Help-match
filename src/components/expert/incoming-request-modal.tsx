"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { formatILS } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { HelpRequest } from "@/types";

interface IncomingRequestModalProps {
  request: HelpRequest;
  onDismiss: () => void;
  onAccepted: (callId: string) => void;
}

const TIMEOUT_SECONDS = 30;

export function IncomingRequestModal({
  request,
  onDismiss,
  onAccepted,
}: IncomingRequestModalProps) {
  const [timeLeft, setTimeLeft] = useState(TIMEOUT_SECONDS);
  const [loading, setLoading] = useState(false);
  const clientName = request.client?.full_name ?? "לקוח";
  // Expert earns 80%
  const estimatedEarning = Math.round(
    (request.max_rate_per_minute * 0.8 * 8) / 100
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onDismiss]);

  async function acceptRequest() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .rpc("claim_request", { request_id: request.id, expert_user_id: user.id });

    if (error || !data) {
      setLoading(false);
      onDismiss();
      return;
    }

    onAccepted(data.call_id);
  }

  const progressPct = (timeLeft / TIMEOUT_SECONDS) * 100;

  return (
    <div className="absolute inset-0 bg-[var(--bg)] flex flex-col z-50">
      <div className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="text-center mb-5">
          <span
            className="inline-block bg-[var(--accent)] text-black px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-3"
            style={{ animation: "shake 0.6s ease-in-out infinite alternate" }}
          >
            🔥 בקשה חדשה
          </span>
          <h2 className="text-2xl font-black">לקוח צריך עזרה</h2>
        </div>

        {/* Countdown bar */}
        <div className="h-1 bg-[var(--border)] rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-[var(--accent)] transition-all duration-1000"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-center text-xs text-[var(--text-tertiary)] mb-4">
          {timeLeft} שניות לתפוס את הבקשה
        </p>

        {/* Client card */}
        <div className="flex items-center gap-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 mb-4">
          <Avatar name={clientName} size="md" />
          <div>
            <div className="font-bold">{clientName}</div>
            <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
              לקוח חוזר • ⭐ 4.8
            </div>
          </div>
        </div>

        {/* Problem */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 mb-4 flex-1">
          <div className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-widest mb-2">
            תיאור הבעיה
          </div>
          <p className="text-sm leading-relaxed">
            &ldquo;{request.description}&rdquo;
          </p>
          {request.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {request.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-[rgba(0,255,136,0.1)] text-[var(--accent)] px-2.5 py-1 rounded-lg text-xs font-semibold"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Earnings */}
        <div
          className="flex justify-between items-center rounded-2xl p-4 mb-4 border"
          style={{
            background: "linear-gradient(135deg, rgba(0,255,136,0.08), rgba(0,170,255,0.04))",
            borderColor: "rgba(0,255,136,0.3)",
          }}
        >
          <div>
            <div className="text-sm text-[var(--text-secondary)]">תרוויח</div>
            <div className="text-xs text-[var(--text-tertiary)]">
              {formatILS(request.max_rate_per_minute)}/דק × 80%
            </div>
          </div>
          <div className="text-2xl font-black text-[var(--accent)]">
            ~{estimatedEarning} ₪{" "}
            <span className="text-sm text-[var(--text-tertiary)] font-normal">
              בממוצע
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-[1fr_2fr] gap-3">
          <Button variant="secondary" onClick={onDismiss}>
            דלג
          </Button>
          <Button loading={loading} onClick={acceptRequest}>
            ✅ קח
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-2px) scale(1.02); }
        }
      `}</style>
    </div>
  );
}
