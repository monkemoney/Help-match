"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitReview() {
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("calls")
      .update({ client_rating: rating, client_review: review })
      .eq("id", id);
    router.replace("/dashboard");
  }

  return (
    <MobileShell>
      <div className="flex-1 flex flex-col items-center px-6 py-10 text-center">
        {/* Success icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl text-black mb-6"
          style={{
            background: "linear-gradient(135deg, var(--accent), var(--info))",
          }}
        >
          ✓
        </div>

        <h2 className="text-2xl font-black mb-2">השיחה הסתיימה</h2>
        <p className="text-[var(--text-secondary)] mb-8">
          איך הייתה השיחה עם המומחה?
        </p>

        {/* Summary */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 w-full mb-8 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">משך</span>
            <span className="font-bold">-- דק׳</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">תעריף</span>
            <span className="font-bold">-- ₪/דק</span>
          </div>
          <hr className="border-[var(--border)]" />
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">סה״כ</span>
            <span className="font-bold text-[var(--accent)]">-- ₪</span>
          </div>
        </div>

        {/* Star rating */}
        <div className="flex gap-3 mb-6" dir="ltr">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => setRating(s)}
              className="text-4xl transition-all duration-200"
              style={{ color: s <= rating ? "var(--warning)" : "var(--surface)" }}
            >
              ★
            </button>
          ))}
        </div>

        <Textarea
          placeholder="ספר לאחרים על החוויה (אופציונלי)"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="h-24 mb-6 text-right"
        />

        <Button
          size="lg"
          loading={loading}
          disabled={rating === 0}
          onClick={submitReview}
          className="mb-3"
        >
          שלח דירוג
        </Button>
        <button
          onClick={() => router.replace("/dashboard")}
          className="text-sm text-[var(--text-tertiary)]"
        >
          דווח על בעיה
        </button>
      </div>
    </MobileShell>
  );
}
