"use client";

import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";

export default function TopupFailedPage() {
  const router = useRouter();

  return (
    <MobileShell>
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[rgba(255,68,102,0.15)] border border-[var(--danger)] flex items-center justify-center text-4xl">
          ✕
        </div>
        <div>
          <h1 className="text-2xl font-black mb-2">התשלום נכשל</h1>
          <p className="text-[var(--text-secondary)] text-sm">
            לא בוצע חיוב. נסה שנית או פנה לתמיכה.
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <Button size="lg" onClick={() => router.replace("/wallet/topup")}>
            נסה שנית
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => router.replace("/dashboard")}
          >
            חזור לדשבורד
          </Button>
        </div>
      </div>
    </MobileShell>
  );
}
