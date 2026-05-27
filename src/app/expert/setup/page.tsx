"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const COMMUNITIES = [
  { id: "ai-vibe-coding", emoji: "🤖", name: "AI & Vibe Coding", meta: "312 לקוחות פעילים" },
];

const SKILLS = ["Cursor", "Claude Code", "Next.js", "Supabase", "Vercel", "ChatGPT", "Bolt", "Lovable", "GitHub Copilot"];

const MIN_CALL_OPTIONS = [3, 5];

export default function ExpertSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [community, setCommunity] = useState("ai-vibe-coding");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [rateAgorot, setRateAgorot] = useState(1100); // 11 ₪/min
  const [minMinutes, setMinMinutes] = useState(3);
  const [loading, setLoading] = useState(false);

  const toggleSkill = (skill: string) =>
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );

  async function saveProfile() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    await supabase.from("expert_profiles").upsert({
      user_id: user.id,
      community_id: community,
      skills: selectedSkills,
      rate_per_minute: rateAgorot,
      min_call_minutes: minMinutes,
      status: "offline",
      rating: 5.0,
      total_calls: 0,
      is_kyc_verified: false,
      payout_balance: 0,
    });

    setStep(2); // KYC step
    setLoading(false);
  }

  return (
    <MobileShell>
      <header className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] flex-shrink-0">
        <button
          onClick={() => step > 1 ? setStep(step - 1) : router.back()}
          className="text-[var(--text-tertiary)] text-xl"
        >
          ◀
        </button>
        <span className="font-bold">{step === 1 ? "הגדרת פרופיל" : "אימות זהות"}</span>
        <span className="text-sm text-[var(--text-tertiary)]">{step}/2</span>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {step === 1 && (
          <div className="space-y-6">
            {/* Community */}
            <div>
              <label className="text-sm font-semibold block mb-3">בחר קהילה</label>
              {COMMUNITIES.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setCommunity(c.id)}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    community === c.id
                      ? "border-[var(--accent)] bg-[rgba(0,255,136,0.05)]"
                      : "border-[var(--border)] bg-[var(--bg-card)]"
                  }`}
                >
                  <span className="text-2xl">{c.emoji}</span>
                  <div className="flex-1">
                    <div className="font-bold text-sm">{c.name}</div>
                    <div className="text-xs text-[var(--text-tertiary)]">{c.meta}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div>
              <label className="text-sm font-semibold block mb-3">כישורים ספציפיים</label>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                      selectedSkills.includes(skill)
                        ? "bg-[rgba(0,255,136,0.1)] text-[var(--accent)] border-[var(--accent)]"
                        : "bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)]"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Rate */}
            <div>
              <label className="text-sm font-semibold block mb-3">תמחור לדקה</label>
              <div className="text-center my-4">
                <div className="text-4xl font-black text-[var(--accent)]">
                  {rateAgorot / 100} ₪
                </div>
              </div>
              <input
                type="range"
                min={500}
                max={3000}
                step={100}
                value={rateAgorot}
                onChange={(e) => setRateAgorot(Number(e.target.value))}
                className="w-full accent-[var(--accent)]"
              />
              <div className="flex justify-between text-xs text-[var(--text-tertiary)] mt-1">
                <span>5 ₪ (מינ׳)</span>
                <span>30 ₪ (פרימיום)</span>
              </div>
            </div>

            {/* Min billing */}
            <div>
              <label className="text-sm font-semibold block mb-3">חיוב מינימום</label>
              <div className="grid grid-cols-2 gap-2">
                {MIN_CALL_OPTIONS.map((min) => (
                  <button
                    key={min}
                    onClick={() => setMinMinutes(min)}
                    className={`py-3 rounded-xl font-bold border transition-all ${
                      minMinutes === min
                        ? "border-[var(--accent)] bg-[rgba(0,255,136,0.05)] text-[var(--accent)]"
                        : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)]"
                    }`}
                  >
                    {min} דקות
                  </button>
                ))}
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mt-2">
                שיחות קצרות יותר יחויבו במינימום הזה
              </p>
            </div>

            <Button size="lg" loading={loading} onClick={saveProfile}>
              המשך ל-KYC
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black mb-2">אנחנו צריכים לוודא שאתה אתה</h2>
            <p className="text-[var(--text-secondary)] text-sm mb-6">
              חד פעמי - לוקח דקה. כל הלקוחות יראו שאתה מאומת.
            </p>

            {/* ID 1 */}
            <div className="flex items-center gap-3 bg-[var(--bg-card)] border border-[var(--accent)] rounded-xl p-4">
              <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center font-bold text-black">
                ✓
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm">תעודת זהות (צד 1)</div>
                <div className="text-xs text-[var(--accent)]">הועלה בהצלחה</div>
              </div>
            </div>

            {/* ID 2 */}
            <div className="flex items-center gap-3 bg-[var(--bg-card)] border border-[var(--accent)] rounded-xl p-4">
              <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center font-bold text-black">
                ✓
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm">תעודת זהות (ספח)</div>
                <div className="text-xs text-[var(--accent)]">הועלה בהצלחה</div>
              </div>
            </div>

            {/* Selfie */}
            <div className="bg-[var(--bg-card)] border border-dashed border-[var(--border)] rounded-xl p-8 text-center">
              <div className="text-5xl mb-3">🤳</div>
              <div className="font-bold mb-1">סלפי לאימות</div>
              <div className="text-xs text-[var(--text-tertiary)] mb-4">
                תמונה שלך מחזיק את התעודה
              </div>
              <Button>📷 פתח מצלמה</Button>
            </div>

            <div className="bg-[rgba(0,170,255,0.08)] border border-[var(--info)] rounded-xl p-4 text-sm text-[var(--text-secondary)]">
              🔒 <strong className="text-[var(--text-primary)]">פרטיותך מוגנת:</strong> המסמכים
              מאוחסנים מוצפנים ונמחקים אוטומטית 7 ימים אחרי אישור.
            </div>

            <Button
              size="lg"
              onClick={() => router.push("/expert/dashboard")}
            >
              סיים הגדרה
            </Button>
          </div>
        )}
      </div>
    </MobileShell>
  );
}
