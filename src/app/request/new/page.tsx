"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MobileShell } from "@/components/layout/mobile-shell";
import { createClient } from "@/lib/supabase/client";

const COMMUNITIES = [
  { id: "ai-vibe-coding", emoji: "🤖", name: "AI & Vibe Coding", count: 23, active: true },
  { id: "shopify", emoji: "🛒", name: "Shopify", count: 0, active: false },
  { id: "figma", emoji: "🎨", name: "Figma & Design", count: 0, active: false },
  { id: "notion", emoji: "📊", name: "Notion & Productivity", count: 0, active: false },
];

const COMMON_TAGS = ["Cursor", "Claude", "Supabase", "Next.js", "Vercel", "ChatGPT", "Bolt", "Lovable"];

export default function NewRequestPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [community, setCommunity] = useState("ai-vibe-coding");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [maxRate, setMaxRate] = useState(1200); // agorot — 12 ₪/min
  const [loading, setLoading] = useState(false);

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const expertCount = Math.max(0, 14 - Math.floor((maxRate - 1200) / 100));
  const estimatedCost = maxRate * 10; // 10 minutes estimate

  async function submitRequest() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data, error } = await supabase
      .from("help_requests")
      .insert({
        client_id: user.id,
        community_id: community,
        description,
        tags,
        max_rate_per_minute: maxRate,
        status: "pending",
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (error || !data) {
      setLoading(false);
      return;
    }

    router.push(`/request/${data.id}`);
  }

  const shekel = (agorot: number) => `${Math.round(agorot / 100)} ₪`;

  return (
    <MobileShell>
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] flex-shrink-0">
        <button
          onClick={() => (step > 1 ? setStep(step - 1) : router.back())}
          className="text-[var(--text-tertiary)] text-xl"
        >
          ◀
        </button>
        <span className="font-bold">בקשת עזרה</span>
        <span className="text-sm text-[var(--text-tertiary)]">{step}/3</span>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {/* Stepper */}
        <div className="flex gap-1.5 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{
                background:
                  s <= step ? "var(--accent)" : "var(--border)",
              }}
            />
          ))}
        </div>

        {/* Step 1: Community */}
        {step === 1 && (
          <div>
            <p className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-widest mb-4">
              שלב 1: בחירת קהילה
            </p>
            <h2 className="text-2xl font-black mb-2">באיזה תחום נצטרך עזרה?</h2>
            <p className="text-[var(--text-secondary)] text-sm mb-6">
              נחפש מומחים זמינים בקהילה הרלוונטית
            </p>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {COMMUNITIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => c.active && setCommunity(c.id)}
                  className={`text-right p-4 rounded-2xl border transition-all duration-200 ${
                    !c.active ? "opacity-50 cursor-not-allowed" : ""
                  } ${
                    community === c.id
                      ? "border-[var(--accent)] bg-[rgba(0,255,136,0.05)]"
                      : "border-[var(--border)] bg-[var(--bg-card)]"
                  }`}
                >
                  <div className="text-3xl mb-2">{c.emoji}</div>
                  <div className="font-bold text-sm mb-1">{c.name}</div>
                  <div className="text-xs text-[var(--text-tertiary)]">
                    {c.active ? `${c.count} מומחים זמינים` : "בקרוב"}
                  </div>
                </button>
              ))}
            </div>

            <Button size="lg" onClick={() => setStep(2)}>
              המשך
            </Button>
          </div>
        )}

        {/* Step 2: Problem Description */}
        {step === 2 && (
          <div>
            <p className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-widest mb-4">
              שלב 2: תיאור הבעיה
            </p>
            <h2 className="text-2xl font-black mb-2">מה הבעיה?</h2>
            <p className="text-[var(--text-secondary)] text-sm mb-6">
              המומחה יראה את התיאור לפני שיחליט. ככל שתפרט יותר — תקבל מומחה
              מתאים יותר.
            </p>

            <Textarea
              placeholder="לדוגמה: אני מנסה להגדיר Authentication ב-Supabase עם Next.js App Router. ה-middleware לא תופס cookies נכון אחרי login..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-44 mb-1"
            />
            <div className="flex justify-between text-xs mb-6">
              <span className="text-[var(--text-tertiary)]">דרוש: 50-500 תווים</span>
              <span
                className={
                  description.length >= 50
                    ? "text-[var(--accent)]"
                    : "text-[var(--text-tertiary)]"
                }
              >
                {description.length}/500
              </span>
            </div>

            <div className="mb-8">
              <div className="text-sm font-semibold mb-3">טאגים (אופציונלי)</div>
              <div className="flex flex-wrap gap-2">
                {COMMON_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                      tags.includes(tag)
                        ? "bg-[rgba(0,255,136,0.1)] text-[var(--accent)] border border-[var(--accent)]"
                        : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)]"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <Button
              size="lg"
              onClick={() => setStep(3)}
              disabled={description.length < 50}
            >
              המשך לתמחור
            </Button>
          </div>
        )}

        {/* Step 3: Pricing */}
        {step === 3 && (
          <div>
            <p className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-widest mb-4">
              שלב 3: תמחור מקסימלי
            </p>
            <h2 className="text-2xl font-black mb-2">כמה אתה מוכן לשלם?</h2>
            <p className="text-[var(--text-secondary)] text-sm mb-6">
              תמחיר מקסימלי לדקה. רק מומחים בטווח הזה יקבלו את הבקשה.
            </p>

            <div className="text-center my-8">
              <div
                className="text-6xl font-black tracking-tight"
                style={{ color: "var(--accent)" }}
              >
                {shekel(maxRate)}
              </div>
              <div className="text-[var(--text-secondary)] text-sm mt-1">
                לדקה
              </div>
            </div>

            <input
              type="range"
              min={500}
              max={3000}
              step={100}
              value={maxRate}
              onChange={(e) => setMaxRate(Number(e.target.value))}
              className="w-full accent-[var(--accent)] mb-2"
            />
            <div className="flex justify-between text-xs text-[var(--text-tertiary)] mb-6">
              <span>5 ₪</span>
              <span>30 ₪</span>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 space-y-3 mb-8 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">מומחים זמינים בטווח</span>
                <span className="font-bold text-[var(--accent)]">{expertCount} מומחים</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">צפי לשיחה של 10 דק׳</span>
                <span className="font-bold">{shekel(estimatedCost)}</span>
              </div>
            </div>

            <Button size="lg" loading={loading} onClick={submitRequest}>
              🚀 שלח בקשה
            </Button>
          </div>
        )}
      </div>
    </MobileShell>
  );
}
