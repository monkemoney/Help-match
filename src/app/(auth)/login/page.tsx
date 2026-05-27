"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MobileShell } from "@/components/layout/mobile-shell";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("אימייל או סיסמה שגויים");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <MobileShell>
      <div className="flex-1 flex flex-col px-6 py-12">
        <Link
          href="/"
          className="text-[var(--text-tertiary)] text-2xl mb-10 block"
        >
          ◀
        </Link>

        <div
          className="text-2xl font-black tracking-tight mb-1"
          style={{
            background: "linear-gradient(120deg, var(--accent), var(--info))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          HelpLine
        </div>
        <h1 className="text-3xl font-black mb-2 mt-6">ברוך שובך</h1>
        <p className="text-[var(--text-secondary)] mb-10">
          התחבר לחשבון שלך
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4 flex-1">
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
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            dir="ltr"
          />

          {error && (
            <p className="text-sm text-[var(--danger)] text-center">{error}</p>
          )}

          <div className="mt-auto flex flex-col gap-3">
            <Button type="submit" size="lg" loading={loading}>
              התחברות
            </Button>
            <p className="text-center text-sm text-[var(--text-secondary)]">
              אין לך חשבון?{" "}
              <Link
                href="/signup"
                className="text-[var(--accent)] font-semibold"
              >
                הרשם בחינם
              </Link>
            </p>
          </div>
        </form>
      </div>
    </MobileShell>
  );
}
