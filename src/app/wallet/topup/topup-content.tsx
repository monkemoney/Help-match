"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";

const AMOUNTS = [5000, 10000, 20000]; // agorot

export function TopupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAmount = Number(searchParams.get("amount")) || 10000;
  const [selectedAmount, setSelectedAmount] = useState(initialAmount);
  const [loading, setLoading] = useState(false);

  const shekel = (a: number) => `${a / 100}`;

  async function handlePayment() {
    setLoading(true);
    // TODO: Create Stripe checkout session via /api/stripe/checkout
    setLoading(false);
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
        <div className="grid grid-cols-3 gap-2 mb-8">
          {AMOUNTS.map((a) => (
            <button
              key={a}
              onClick={() => setSelectedAmount(a)}
              className={`py-3 rounded-xl font-bold transition-all ${
                selectedAmount === a
                  ? "bg-[var(--accent)] text-black"
                  : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)]"
              }`}
            >
              {shekel(a)}
            </button>
          ))}
        </div>

        {/* Payment method */}
        <div className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-widest mb-3">
          אמצעי תשלום
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--accent)] rounded-2xl p-4 flex items-center gap-3 mb-2">
          <span className="text-2xl">💳</span>
          <div className="flex-1">
            <div className="font-bold text-sm">Visa •••• 4242</div>
            <div className="text-xs text-[var(--text-tertiary)]">בתוקף עד 09/27</div>
          </div>
          <span className="text-[var(--accent)] font-bold">✓</span>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 flex items-center gap-3 mb-8 cursor-pointer">
          <span className="text-2xl text-[var(--text-tertiary)]">+</span>
          <span className="font-semibold text-[var(--text-secondary)] text-sm">
            הוסף אמצעי תשלום
          </span>
        </div>

        <Button size="lg" loading={loading} onClick={handlePayment}>
          שלם {shekel(selectedAmount)} ₪ 🔒
        </Button>
        <p className="text-center text-xs text-[var(--text-tertiary)] mt-3">
          תשלום מאובטח דרך Stripe
        </p>
      </div>
    </MobileShell>
  );
}
