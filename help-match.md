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
| Payments | Cardcom (ממשק JSON v11) |
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
│   │       ├── topup-content.tsx   # בוחר סכום → redirect ל-Cardcom
│   │       ├── success/page.tsx    # חזרה מ-Cardcom — הצלחה
│   │       └── failed/page.tsx     # חזרה מ-Cardcom — כישלון
│   ├── api/
│   │   ├── livekit/token/route.ts  # JWT generation (POST, auth required)
│   │   └── cardcom/
│   │       ├── create-page/route.ts # יצירת עמוד תשלום Cardcom
│   │       └── webhook/route.ts     # קבלת אישור תשלום + credit_wallet
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
│       ├── server.ts               # Server client (async cookies)
│       └── admin.ts                # Service-role client (webhook/server ops)
└── types/index.ts                  # TypeScript types
supabase/
├── schema.sql                      # כל הסכמה + RLS + RPC
└── cardcom_additions.sql           # reference_id→text + credit_wallet RPC
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

### RPC — `credit_wallet`
נקרא מ-webhook של Cardcom (דרך service role):
```sql
-- update profiles set wallet_balance = wallet_balance + p_amount
-- insert into wallet_transactions (topup)
-- אטומי — שתי הפעולות ביחד
```
נמצא ב-`supabase/cardcom_additions.sql` (רץ אחרי schema.sql).  
שינוי קריטי באותו קובץ: `reference_id` שונה מ-`uuid` ל-`text` (Cardcom שולח מספר עסקה, לא UUID).

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

## env vars — מצב נוכחי

```env
# מוגדר (Render + .env.local)
NEXT_PUBLIC_SUPABASE_URL=https://ojamdeadscwjvmqlukai.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_qAaMyshXz2YLJwh2XCkwFA_yfRj7SZ0
SUPABASE_SERVICE_ROLE_KEY=<מוגדר — ב-.env.local ובRender>

NEXT_PUBLIC_LIVEKIT_URL=wss://help-match-n94xxhku.livekit.cloud
LIVEKIT_API_KEY=APIqLx6CksZcHbV
LIVEKIT_API_SECRET=helpmatch-1czqvb

NEXT_PUBLIC_BASE_URL=https://www.jaselp.com
CARDCOM_TERMINAL=1000
CARDCOM_API_NAME=CardTest1994          # Test — להחליף ב-Production
CARDCOM_API_PASSWORD=Terminaltest2026  # Test — להחליף ב-Production

# עדיין חסר
# ONESIGNAL_APP_ID=
# ONESIGNAL_API_KEY=
```

---

## מה עוד צריך לבנות (Post-MVP)

- [x] LiveKit — token API + full in-call UI
- [x] Cardcom — create-page + webhook + success/failed pages
- [x] Billing engine — client-side timer + low-balance auto-end
- [ ] OneSignal — Push notifications למומחה על בקשה חדשה
- [ ] Cardcom Production — להחליף TerminalNumber, ApiName, ApiPassword לאחר אישור
- [ ] KYC — upload אמיתי של מסמכים (Supabase Storage)
- [ ] Expert public profile page
- [ ] Dispute / Refund flow
- [ ] Admin panel
- [ ] Onboarding tutorial (3-4 שלבים)
- [ ] Notification preferences

---

## LiveKit

| פרט | ערך |
|---|---|
| Project | help-match |
| URL | `wss://help-match-n94xxhku.livekit.cloud` |
| API Key | `APIqLx6CksZcHbV` |

- Token מיוצר server-side ב-`/api/livekit/token` (POST, auth required)
- TTL: 4 שעות
- Grants: `roomJoin`, `canPublish`, `canSubscribe`, `canPublishData`
- Room name: `call-{callId}`
- בדיקת הרשאה: ורות שהמשתמש הוא `client_id` או `expert_id` של השיחה

---

## Cardcom — ממשק תשלום

**Terminal: 1000** | API: `https://secure.cardcom.solutions/api/v11/`

### Flow
```
/wallet/topup → בחירת סכום
  → POST /api/cardcom/create-page
      body: { amountAgorot }
      Cardcom body: { TerminalNumber, Amount (שקלים!), ReturnValue: userId, ... }
  → redirect לעמוד Cardcom
  → לאחר תשלום: Cardcom שולח POST ל /api/cardcom/webhook
      webhook: { LowProfileId }
      → GetLpResult לאימות
      → credit_wallet RPC (atomic: update balance + insert transaction)
  → Cardcom מפנה ל /wallet/topup/success או /wallet/topup/failed
```

### נקודות קריטיות
- Cardcom מצפה לסכום ב-**שקלים** (לא אגורות) — `amountAgorot / 100`
- `ReturnValue` = userId — מוחזר ב-GetLpResult לזיהוי המשתמש ב-webhook
- `GetLpResult` דורש `ApiName` + `ApiPassword` (בלעדיהם — שגיאה "user blocked")
- Idempotency: בדיקת `reference_id` לפני credit — מונע כפל זיכוי
- Webhook רץ ללא cookies → חייב `createAdminClient()` (service role)

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
