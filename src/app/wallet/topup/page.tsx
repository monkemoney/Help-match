import { Suspense } from "react";
import { TopupContent } from "./topup-content";
import { MobileShell } from "@/components/layout/mobile-shell";

export default function TopupPage() {
  return (
    <Suspense
      fallback={
        <MobileShell>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        </MobileShell>
      }
    >
      <TopupContent />
    </Suspense>
  );
}
