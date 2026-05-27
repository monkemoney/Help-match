"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/layout/mobile-shell";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

interface ProfileViewProps {
  profile: Profile | null;
  email: string;
}

const clientNavItems = [
  { href: "/dashboard", icon: "🏠", label: "בית" },
  { href: "/wallet", icon: "💰", label: "ארנק" },
  { href: "/history", icon: "📜", label: "היסטוריה" },
  { href: "/profile", icon: "👤", label: "פרופיל" },
];

const menuItems = [
  { icon: "📜", label: "תנאי שימוש", href: "/terms" },
  { icon: "🔒", label: "מדיניות פרטיות", href: "/privacy" },
  { icon: "💬", label: "תמיכה", href: "/support" },
];

export function ProfileView({ profile, email }: ProfileViewProps) {
  const router = useRouter();
  const name = profile?.full_name ?? "משתמש";

  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("he-IL", {
        month: "long",
        year: "numeric",
      })
    : "";

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <MobileShell>
      <header className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] flex-shrink-0">
        <span className="font-bold">פרופיל</span>
        <button className="text-[var(--accent)] text-sm font-semibold">ערוך</button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {/* Profile header */}
        <div className="text-center">
          <Avatar name={name} size="xl" className="mx-auto mb-3" />
          <h2 className="text-2xl font-black">{name}</h2>
          {joinDate && (
            <p className="text-[var(--text-tertiary)] text-sm mt-1">
              חבר מאז {joinDate}
            </p>
          )}
        </div>

        {/* Account details */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3.5 border-b border-[var(--border)]">
            <span className="text-sm">📧 אימייל</span>
            <span className="text-[var(--text-tertiary)] text-sm" dir="ltr">
              {email}
            </span>
          </div>
          <div className="flex justify-between items-center px-4 py-3.5 border-b border-[var(--border)]">
            <span className="text-sm">📱 טלפון</span>
            <span className="text-[var(--accent)] text-sm font-semibold">
              ✓ מאומת
            </span>
          </div>
          <div className="flex justify-between items-center px-4 py-3.5">
            <span className="text-sm">🔔 התראות</span>
            <div
              className="w-11 h-6 bg-[var(--accent)] rounded-full relative cursor-pointer"
            >
              <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-black rounded-full" />
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden">
          {menuItems.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex justify-between items-center px-4 py-3.5 transition-colors hover:bg-[var(--surface)] ${
                i < menuItems.length - 1 ? "border-b border-[var(--border)]" : ""
              }`}
            >
              <span className="text-sm">{item.icon} {item.label}</span>
              <span className="text-[var(--text-tertiary)]">◂</span>
            </Link>
          ))}
        </div>

        <Button variant="danger" onClick={handleLogout}>
          התנתק
        </Button>
      </div>

      <BottomNav items={clientNavItems} />
    </MobileShell>
  );
}
