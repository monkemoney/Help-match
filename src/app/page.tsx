import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MobileShell } from "@/components/layout/mobile-shell";

export default function LandingPage() {
  return (
    <MobileShell>
      <div
        className="flex-1 flex flex-col px-6 py-12"
        style={{
          backgroundImage:
            "radial-gradient(at 20% 30%, rgba(0,255,136,0.08) 0%, transparent 50%), radial-gradient(at 80% 70%, rgba(0,170,255,0.05) 0%, transparent 50%)",
        }}
      >
        {/* Logo */}
        <div className="mb-auto pt-8">
          <div
            className="text-3xl font-black tracking-tight mb-2"
            style={{
              background: "linear-gradient(120deg, var(--accent), var(--info))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            HelpLine
          </div>
          <h1 className="text-4xl font-black leading-tight tracking-tight mt-8 mb-4">
            תקוע ב-AI?
            <br />
            מומחה אחד
            <br />
            תוך 3 דקות.
          </h1>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
            לחיצת כפתור → שיחת קול עם מומחה ישראלי שמכיר את הכלי בו אתה
            משתמש.
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-6 my-10">
          <div className="text-center">
            <div className="text-2xl font-black text-[var(--accent)]">3 דק</div>
            <div className="text-xs text-[var(--text-tertiary)] mt-1">ממוצע המתנה</div>
          </div>
          <div className="w-px bg-[var(--border)]" />
          <div className="text-center">
            <div className="text-2xl font-black text-[var(--accent)]">8+ ₪</div>
            <div className="text-xs text-[var(--text-tertiary)] mt-1">מ-₪/דקה</div>
          </div>
          <div className="w-px bg-[var(--border)]" />
          <div className="text-center">
            <div className="text-2xl font-black text-[var(--accent)]">100%</div>
            <div className="text-xs text-[var(--text-tertiary)] mt-1">ישראלים</div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <Link href="/signup" className="block">
            <Button size="lg" className="text-lg font-black">
              התחל עכשיו — בחינם
            </Button>
          </Link>
          <Link href="/login" className="block">
            <Button variant="secondary" size="lg">
              יש לי כבר חשבון
            </Button>
          </Link>
        </div>
      </div>
    </MobileShell>
  );
}
