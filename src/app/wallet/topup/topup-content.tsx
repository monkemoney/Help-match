"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";

const AMOUNTS = [5000, 10000, 20000, 50000]; // agorot

export function TopupContent() {
  const router = useRouter();
  const [selectedAmount, setSelectedAmount] = useState(10000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shekel = (a: number) => `${a / 100}`;

  async function handlePayment() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/cardcom/create-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountAgorot: selectedAmount }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        setError(data.error ?? "שגיאה ביצירת עמוד תשלום");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("שגיאת רשת — נסה שנית");
      setLoading(false);
    }
  }

  return (
    <MobileShell>
      <header className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] flex-shrink-0">
        <button onClick={() => router.back()} className="text-[var(--text-tertiary)] text-xl">
          ◀
        </button>
        <span className="font-bold">הטענת ארנק</span>
        <span />
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {/* Amount display */}
        <div className="text-center mb-8">
          <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-widest font-bold mb-2">
            סכום להטענה
          </div>
          <div className="text-6xl font-black tracking-tight">
            {shekel(selectedAmount)}
            <span className="text-3xl text-[var(--text-secondary)]"> ₪</span>
          </div>
        </div>

        {/* Quick amounts */}
        <div className="grid grid-cols-4 gap-2 mb-8">
          {AMOUNTS.map((a) => (
            <button
              key={a}
              onClick={() => setSelectedAmount(a)}
              className={`py-3 rounded-xl font-bold transition-all text-sm ${
                selectedAmount === a
                  ? "bg-[var(--accent)] text-black"
                  : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)]"
              }`}
            >
              {shekel(a)} ₪
            </button>
          ))}
        </div>

        {/* Payment method info */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 flex items-center gap-3 mb-8">
          <span className="text-2xl">🔒</span>
          <div className="flex-1">
            <div className="font-bold text-sm">תשלום מאובטח בכרטיס אשראי</div>
            <div className="text-xs text-[var(--text-tertiary)]">מופעל על ידי Cardcom</div>
          </div>
        </div>

        {error && (
          <div className="bg-[rgba(255,68,102,0.1)] border border-[var(--danger)] rounded-xl p-3 text-center text-sm text-[var(--danger)] mb-4">
            {error}
          </div>
        )}

        <Button size="lg" loading={loading} onClick={handlePayment}>
          שלם {shekel(selectedAmount)} ₪ 🔒
        </Button>
        <p className="text-center text-xs text-[var(--text-tertiary)] mt-3">
          מועבר לדף תשלום מאובטח של Cardcom
        </p>
      </div>
    </MobileShell>
  );
}
