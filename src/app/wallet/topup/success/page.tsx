"use client";

import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";

export default function TopupSuccessPage() {
  const router = useRouter();

  return (
    <MobileShell>
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[rgba(0,255,136,0.15)] border border-[var(--accent)] flex items-center justify-center text-4xl">
          ✓
        </div>
        <div>
          <h1 className="text-2xl font-black mb-2">התשלום עבר בהצלחה!</h1>
          <p className="text-[var(--text-secondary)] text-sm">
            הארנק שלך נטען. היתרה החדשה תופיע בדשבורד.
          </p>
        </div>
        <Button size="lg" onClick={() => router.replace("/dashboard")}>
          חזור לדשבורד
        </Button>
      </div>
    </MobileShell>
  );
}
