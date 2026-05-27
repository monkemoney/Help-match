"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MobileShell } from "@/components/layout/mobile-shell";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types";

const roles: { id: UserRole; emoji: string; title: string; desc: string }[] = [
  {
    id: "client",
    emoji: "🆘",
    title: "אני צריך עזרה",
    desc: "קבל ייעוץ מיידי ממומחים זמינים",
  },
  {
    id: "expert",
    emoji: "💡",
    title: "אני רוצה להיות מומחה",
    desc: "תרוויח כסף מהידע שלך",
  },
  {
    id: "both",
    emoji: "⚡",
    title: "שניהם",
    desc: "לפעמים שואל, לפעמים עונה",
  },
];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRole) return;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: selectedRole,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <MobileShell>
      <div className="flex-1 flex flex-col px-6 py-12">
        <button
          onClick={() => (step === 2 ? setStep(1) : router.push("/"))}
          className="text-[var(--text-tertiary)] text-2xl mb-10 text-right"
        >
          ◀
        </button>

        {step === 1 ? (
          <>
            <h1 className="text-3xl font-black mb-2">איך נעזור?</h1>
            <p className="text-[var(--text-secondary)] mb-8">
              בחר מה אתה רוצה לעשות. אפשר לשנות אחר כך.
            </p>

            <div className="flex flex-col gap-3 flex-1">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`text-right p-5 rounded-2xl border transition-all duration-200 ${
                    selectedRole === role.id
                      ? "border-[var(--accent)] bg-[rgba(0,255,136,0.05)]"
                      : "border-[var(--border)] bg-[var(--bg-card)]"
                  }`}
                >
                  <div className="text-3xl mb-2">{role.emoji}</div>
                  <div className="font-bold mb-1">{role.title}</div>
                  <div className="text-sm text-[var(--text-tertiary)]">
                    {role.desc}
                  </div>
                </button>
              ))}
            </div>

            <Button
              size="lg"
              className="mt-6"
              disabled={!selectedRole}
              onClick={() => setStep(2)}
            >
              המשך
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-black mb-2">פרטים אחרונים</h1>
            <p className="text-[var(--text-secondary)] mb-8">
              ניצור לך חשבון עכשיו
            </p>

            <form onSubmit={handleSignup} className="flex flex-col gap-4 flex-1">
              <Input
                label="שם מלא"
                type="text"
                placeholder="ישראל ישראלי"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                label="אימייל"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                dir="ltr"
              />
              <Input
                label="סיסמה"
                type="password"
                placeholder="לפחות 8 תווים"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                dir="ltr"
              />

              {error && (
                <p className="text-sm text-[var(--danger)] text-center">
                  {error}
                </p>
              )}

              <div className="mt-auto flex flex-col gap-3">
                <Button type="submit" size="lg" loading={loading}>
                  🚀 צור חשבון
                </Button>
                <p className="text-center text-xs text-[var(--text-tertiary)]">
                  בהרשמה אתה מסכים ל
                  <Link href="/terms" className="text-[var(--accent)]">
                    תנאי השימוש
                  </Link>
                </p>
                <p className="text-center text-sm text-[var(--text-secondary)]">
                  יש לך כבר חשבון?{" "}
                  <Link
                    href="/login"
                    className="text-[var(--accent)] font-semibold"
                  >
                    התחבר
                  </Link>
                </p>
              </div>
            </form>
          </>
        )}
      </div>
    </MobileShell>
  );
}
