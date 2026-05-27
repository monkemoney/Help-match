"use client";

import Link from "next/link";
import { MobileShell } from "@/components/layout/mobile-shell";
import { BottomNav } from "@/components/layout/bottom-nav";
import { formatILS } from "@/lib/utils";
import type { WalletTransaction } from "@/types";

interface WalletViewProps {
  balance: number;
  transactions: WalletTransaction[];
}

const clientNavItems = [
  { href: "/dashboard", icon: "🏠", label: "בית" },
  { href: "/wallet", icon: "💰", label: "ארנק" },
  { href: "/history", icon: "📜", label: "היסטוריה" },
  { href: "/profile", icon: "👤", label: "פרופיל" },
];

const TOPUP_AMOUNTS = [
  { agorot: 5000, label: "50 ₪", note: "~4 דק׳" },
  { agorot: 10000, label: "100 ₪", note: "~8 דק׳", popular: true },
  { agorot: 20000, label: "200 ₪", note: "+10% בונוס", bonus: true },
];

export function WalletView({ balance, transactions }: WalletViewProps) {
  return (
    <MobileShell>
      <header className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] flex-shrink-0">
        <Link href="/dashboard" className="text-[var(--text-tertiary)] text-xl">
          ◀
        </Link>
        <span className="font-bold">ארנק</span>
        <span />
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {/* Balance card */}
        <div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, var(--accent) 0%, var(--info) 100%)",
          }}
        >
          <div className="text-black/70 text-sm font-semibold mb-1">יתרה</div>
          <div className="text-black text-5xl font-black tracking-tight mb-4">
            {formatILS(balance)}
          </div>
          <Link href="/wallet/topup">
            <button className="bg-black/20 text-black border border-black/10 py-2.5 px-5 rounded-xl font-bold text-sm">
              + הטענה מהירה
            </button>
          </Link>
        </div>

        {/* Topup packages */}
        <div>
          <div className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-widest mb-3">
            חבילות הטענה
          </div>
          <div className="grid grid-cols-3 gap-2">
            {TOPUP_AMOUNTS.map((pkg) => (
              <Link key={pkg.agorot} href={`/wallet/topup?amount=${pkg.agorot}`}>
                <button
                  className={`w-full text-center p-4 rounded-xl border transition-all relative ${
                    pkg.popular
                      ? "border-[var(--accent)] bg-[var(--bg-card)]"
                      : "border-[var(--border)] bg-[var(--bg-card)]"
                  }`}
                >
                  {pkg.popular && (
                    <div
                      className="absolute -top-2.5 right-2 bg-[var(--accent)] text-black text-[10px] font-black px-2 py-0.5 rounded"
                    >
                      פופולרי
                    </div>
                  )}
                  <div className="text-xl font-black">{pkg.label}</div>
                  <div
                    className={`text-xs mt-0.5 ${
                      pkg.bonus ? "text-[var(--accent)]" : "text-[var(--text-tertiary)]"
                    }`}
                  >
                    {pkg.note}
                  </div>
                </button>
              </Link>
            ))}
          </div>
        </div>

        {/* Transactions */}
        <div>
          <div className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-widest mb-3">
            תנועות אחרונות
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-tertiary)]">
              <div className="text-3xl mb-2">💳</div>
              <p>אין תנועות עדיין</p>
            </div>
          ) : (
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden">
              {transactions.map((tx, i) => (
                <div
                  key={tx.id}
                  className={`flex items-center justify-between px-4 py-3 ${
                    i < transactions.length - 1
                      ? "border-b border-[var(--border)]"
                      : ""
                  }`}
                >
                  <div>
                    <div className="font-semibold text-sm">{tx.description}</div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                      {new Date(tx.created_at).toLocaleDateString("he-IL")}
                    </div>
                  </div>
                  <div
                    className="font-bold"
                    style={{
                      color: tx.amount > 0 ? "var(--accent)" : "var(--danger)",
                    }}
                  >
                    {tx.amount > 0 ? "+" : ""}
                    {formatILS(Math.abs(tx.amount))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav items={clientNavItems} />
    </MobileShell>
  );
}
