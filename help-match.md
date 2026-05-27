# HelpLine — Project Reference

## תיאור המוצר

שוק לייב של מומחים ישראלים. לקוח מבקש עזרה → מומחה זמין מגיב תוך 3 דקות → שיחת קול/וידאו → תשלום לפי דקה מתוך ארנק.

קהילת MVP: **AI & Vibe Coding** (Cursor, Claude, Next.js, Supabase וכד׳).

---

## קישורים ומפתחות

| שירות | פרט |
|---|---|
| GitHub | https://github.com/monkemoney/Help-match.git |
| Render Service ID | `srv-d8bi3uuq1p3s73ci4mgg` |
| Supabase URL | `https://ojamdeadscwjvmqlukai.supabase.co` |
| Supabase Anon Key | (ב-.env.local) |
| Supabase Mgmt Token | (ב-memory של Claude — לא לשמור ב-repo) |
| Supabase Project ID | `ojamdeadscwjvmqlukai` |
| דומיין | `www.jaselp.com` |
| Local path | `/Users/apple/help-match` |

---

## Stack טכני

| שכבה | טכנולוגיה |
|---|---|
| Framework | Next.js 16.2.6 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + CSS Variables |
| UI | shadcn/ui (Radix) |
| Font | Heebo (Google Fonts) — תמיכה מלאה בעברית |
| Auth + DB + Realtime | Supabase |
| Video/Audio | LiveKit (`@livekit/components-react`) |
| Payments | Stripe |
| Push Notifications | OneSignal (מתוכנן) |
| Deployment | Render |
| State | Zustand |
| Forms | React Hook Form + Zod |

---

## Breaking Changes — Next.js 16

> חשוב לדעת לפני כל כתיבת קוד:

- `middleware.ts` → שונה ל-**`proxy.ts`**, הפונקציה: `export function proxy()`
- `params` ב-page/layout → **Promise** — חייב `await params`
- `searchParams` → **Promise** — חייב `await searchParams`
- `cookies()` → **async** — חייב `await cookies()`
- `useSearchParams()` → חייב **Suspense boundary**

---

## מבנה הפרויקט

```
src/
├── app/
│   ├── page.tsx                    # Landing
│   ├── layout.tsx                  # Root layout (RTL, Heebo)
│   ├── globals.css                 # CSS variables + Tailwind
│   ├── proxy.ts                    # Auth guard (במקום middleware)
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx         # 2-step: role → פרטים
│   ├── auth/callback/route.ts      # Supabase OAuth callback
│   ├── dashboard/page.tsx          # Client dashboard (SSR)
│   ├── request/
│   │   ├── new/page.tsx            # 3-step: קהילה → בעיה → תמחור
│   │   └── [id]/page.tsx           # Waiting + Realtime → claimed
│   ├── call/
│   │   └── [id]/
│   │       ├── page.tsx            # In-call UI + low balance warning
│   │       └── review/page.tsx     # Post-call rating
│   ├── expert/
│   │   ├── setup/page.tsx          # KYC + profile (2-step)
│   │   └── dashboard/page.tsx      # Expert dashboard + availability
│   ├── wallet/
│   │   ├── page.tsx
│   │   └── topup/
│   │       ├── page.tsx            # Suspense wrapper
│   │       └── topup-content.tsx   # useSearchParams client component
│   ├── history/page.tsx
│   └── profile/page.tsx
├── components/
│   ├── ui/                         # button, input, textarea, avatar
│   ├── layout/                     # mobile-shell, bottom-nav
│   ├── client/                     # client-dashboard, wallet-view
│   ├── expert/                     # incoming-request-modal
│   └── shared/                     # profile-view
├── lib/
│   ├── utils.ts                    # cn(), formatILS(), formatDuration()
│   └── supabase/
│       ├── client.ts               # Browser client
│       └── server.ts               # Server client (async cookies)
└── types/index.ts                  # TypeScript types
supabase/schema.sql                 # כל הסכמה + RLS + RPC
render.yaml                         # Render deployment config
```

---

## עיצוב — CSS Variables

```css
--bg: #0a0a0f
--bg-elevated: #14141c
--bg-card: #1a1a26
--surface: #232331
--border: #2a2a3a
--text-primary: #f5f5f7
--text-secondary: #a0a0b0
--text-tertiary: #6b6b80
--accent: #00ff88        /* ירוק electric — CTA ראשי */
--accent-dim: #00cc6a
--warning: #ffaa00
--danger: #ff4466
--info: #00aaff
```

כל ה-UI בנוי **Mobile-first**, רוחב מקסימלי 430px, `dir="rtl"` על `<html>`.

---

## מסד הנתונים — טבלאות

| טבלה | תיאור |
|---|---|
| `profiles` | משתמש (client/expert/both), `wallet_balance` באגורות |
| `communities` | AI & Vibe Coding (פעיל), Shopify/Figma/Notion (בקרוב) |
| `expert_profiles` | תמחור, כישורים, status, rating, payout_balance |
| `help_requests` | status: pending → claimed → in_call → completed |
| `calls` | LiveKit room, duration, total_charged, expert_earned |
| `wallet_transactions` | כל תנועת ארנק (topup/call_charge/refund/bonus/payout) |

### כספים — כללי ברזל
- **כל הסכומים ב-DB הם אגורות (integer)**. 100 ₪ = 10,000 אגורות.
- `formatILS(agorot)` — פונקציה ב-`lib/utils.ts`
- תמיד integers, **אף פעם floats**
- מומחה מקבל **80%** מהתמחור (`expert_earned = total_charged * 0.8`)
- בונוס הצטרפות: 5,000 אגורות (50 ₪) לכל משתמש חדש

### RPC קריטי — `claim_request`
פונקציה Postgres שמונעת race condition:
```sql
-- נעילת שורה: FOR UPDATE SKIP LOCKED
-- בדיקת תמחור vs budget
-- יצירת call + עדכון request status אטומי
```

### RLS
- לקוח רואה רק את הבקשות שלו
- מומחה רואה בקשות `pending` בקהילה שלו בלבד
- Realtime על: `help_requests`, `calls`, `expert_profiles`

---

## Flow — לקוח

```
/ (landing)
  → /signup (role + פרטים)
  → /dashboard
  → /request/new (3 שלבים)
      1. קהילה
      2. תיאור בעיה (50-500 תווים) + טאגים
      3. תמחור מקסימלי (slider 5-30 ₪/דק)
  → /request/[id] (waiting — Supabase Realtime)
      כשstatus → "claimed": אוטומטי לעמוד Expert Found
      כשstatus → "in_call": redirect ל /call/[id]
  → /call/[id]
      - Timer + מונה עלות בזמן אמת
      - אזהרת יתרה נמוכה (< 10 ₪ = 1,000 אגורות)
      - Confirm dialog לפני סיום
  → /call/[id]/review (דירוג 1-5 כוכבים)
```

---

## Flow — מומחה

```
/signup → /expert/setup
    שלב 1: קהילה + כישורים + תמחור + מינ׳ חיוב
    שלב 2: KYC (ת.ז. + סלפי)
  → /expert/dashboard
      - Toggle זמינות (online/offline)
      - Realtime subscription לבקשות pending
      - Payout balance + בקשת פדיון (מינ׳ 100 ₪)
  → IncomingRequestModal (30 שניות Countdown)
      "קח" → POST claim_request RPC
  → /call/[id] (צד מומחה — רואה +earnings)
```

---

## Supabase Realtime

```typescript
// לקוח — מחכה לשינוי סטטוס הבקשה
supabase.channel(`request:${id}`)
  .on('postgres_changes', {
    event: 'UPDATE', schema: 'public', table: 'help_requests',
    filter: `id=eq.${id}`
  }, (payload) => {
    if (payload.new.status === 'in_call') router.push(`/call/${call_id}`)
  })

// מומחה — מחכה לבקשות חדשות
supabase.channel('expert-requests')
  .on('postgres_changes', {
    event: 'INSERT', schema: 'public', table: 'help_requests',
    filter: `status=eq.pending`
  }, ...)
```

---

## Supabase — הגדרות Auth

```
site_url: https://www.jaselp.com
redirect_allow_list:
  - https://www.jaselp.com/**
  - https://jaselp.com/**
  - http://localhost:3000/**
```

---

## env vars נדרשים

```env
# מוגדר
NEXT_PUBLIC_SUPABASE_URL=https://ojamdeadscwjvmqlukai.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_qAaMyshXz2YLJwh2XCkwFA_yfRj7SZ0

# להוסיף
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
```

---

## מה עוד צריך לבנות (Post-MVP)

- [ ] LiveKit — חיבור אמיתי (כרגע placeholder UI)
- [ ] Stripe — `/api/stripe/checkout` route + webhook לעדכון ארנק
- [ ] OneSignal — Push notifications למומחה על בקשה חדשה
- [ ] API route ל-LiveKit token generation
- [ ] Billing engine — server-side חישוב עלות בזמן אמת
- [ ] KYC — upload אמיתי של מסמכים (Supabase Storage)
- [ ] Expert public profile page
- [ ] Dispute / Refund flow
- [ ] Admin panel
- [ ] Onboarding tutorial (3-4 שלבים)
- [ ] Notification preferences

---

## Deployment

### Render
```yaml
# render.yaml מוגדר בריפו
buildCommand: npm run build
startCommand: npm start
```

**צעדים ידניים ב-Render dashboard:**
1. חבר GitHub repo `monkemoney/Help-match` לשירות `srv-d8bi3uuq1p3s73ci4mgg`
2. Settings → Custom Domains → הוסף `www.jaselp.com`
3. הוסף את כל ה-env vars

### GitHub Push
```bash
# הטוקן נשמר ב-memory — אל תשמור ב-git config
git remote set-url origin https://<TOKEN>@github.com/monkemoney/Help-match.git
git push
git remote set-url origin https://github.com/monkemoney/Help-match.git
```
