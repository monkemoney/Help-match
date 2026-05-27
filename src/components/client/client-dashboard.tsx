"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { MobileShell } from "@/components/layout/mobile-shell";
import { formatILS } from "@/lib/utils";
import type { Profile, Call } from "@/types";

interface ClientDashboardProps {
  profile: Profile | null;
  recentCalls: Call[];
}

const clientNavItems = [
  { href: "/dashboard", icon: "🏠", label: "בית" },
  { href: "/wallet", icon: "💰", label: "ארנק" },
  { href: "/history", icon: "📜", label: "היסטוריה" },
  { href: "/profile", icon: "👤", label: "פרופיל" },
];

export function ClientDashboard({ profile, recentCalls }: ClientDashboardProps) {
  const firstName = profile?.full_name?.split(" ")[0] ?? "שלום";
  const balance = profile?.wallet_balance ?? 0;

  return (
    <MobileShell>
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] flex-shrink-0">
        <span className="text-lg font-bold">שלום, {firstName} 👋</span>
        <button className="text-2xl">🔔</button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {/* Wallet Card */}
        <div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, var(--accent) 0%, var(--info) 100%)",
          }}
        >
          <div
            className="absolute -top-12 -left-6 w-48 h-48 rounded-full opacity-30"
            style={{
              background: "radial-gradient(circle, white 0%, transparent 70%)",
            }}
          />
          <div className="relative z-10">
            <div className="text-black/70 text-sm font-semibold mb-1">
              יתרת ארנק
            </div>
            <div className="text-black text-5xl font-black tracking-tight mb-4">
              {formatILS(balance)}
            </div>
            <div className="flex gap-2">
              <Link href="/wallet/topup" className="flex-1">
                <button className="w-full bg-black/20 text-black border border-black/10 py-2.5 rounded-xl font-bold text-sm">
                  + הטענה
                </button>
              </Link>
              <Link href="/wallet" className="flex-1">
                <button className="w-full bg-black/20 text-black border border-black/10 py-2.5 rounded-xl font-bold text-sm">
                  היסטוריה
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Hero CTA */}
        <div
          className="rounded-2xl p-6 border border-[var(--border)] text-center relative overflow-hidden"
          style={{ background: "var(--bg-card)" }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(at 50% 0%, rgba(0,255,136,0.08) 0%, transparent 60%)",
            }}
          />
          <div className="relative">
            <h3 className="text-2xl font-black mb-2">צריך עזרה עכשיו?</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-4">
              3 דקות בממוצע למציאת מומחה זמין
            </p>
            <Link href="/request/new">
              <Button size="lg" className="text-lg font-black">
                🆘 בקש עזרה
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: recentCalls.length.toString(), label: "שיחות" },
            { value: "2:34", label: "המתנה" },
            { value: "4.8", label: "דירוג" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-3 text-center"
            >
              <div className="text-xl font-black">{stat.value}</div>
              <div className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider mt-0.5">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Calls */}
        {recentCalls.length > 0 && (
          <div>
            <div className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-widest mb-3">
              שיחות אחרונות
            </div>
            <div className="space-y-2">
              {recentCalls.map((call) => {
                const expertName =
                  // @ts-expect-error nested select
                  call.expert?.profile?.full_name ?? "מומחה";
                return (
                  <div
                    key={call.id}
                    className="flex items-center gap-3 p-3 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)]"
                  >
                    <Avatar name={expertName} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{expertName}</div>
                      <div className="text-xs text-[var(--text-tertiary)] truncate">
                        לפני {/* TODO: relative date */}
                      </div>
                    </div>
                    <div className="text-[var(--accent)] font-bold text-sm">
                      {formatILS(call.total_charged)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {recentCalls.length === 0 && (
          <div className="text-center py-8 text-[var(--text-tertiary)]">
            <div className="text-4xl mb-3">🎯</div>
            <p className="font-semibold">עדיין אין שיחות</p>
            <p className="text-sm mt-1">בקש עזרה ותתחיל!</p>
          </div>
        )}
      </div>

      <BottomNav items={clientNavItems} />
    </MobileShell>
  );
}
