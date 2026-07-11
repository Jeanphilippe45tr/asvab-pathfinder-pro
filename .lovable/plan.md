
# ASVAB Prep Website — Build Plan

A professional ASVAB (Armed Services Vocational Aptitude Battery) preparation website with public marketing pages, a legitimacy-building pre-signup quiz, tiered subscription plans with simulated checkout, a gated member area, and a full admin console.

## 1. Public site (unauthenticated)

- **Home** — hero, what ASVAB is, why it matters, feature highlights, testimonials, CTA.
- **About** — mission, methodology, team.
- **ASVAB Info** — sections/subtests explained (Arithmetic Reasoning, Word Knowledge, Paragraph Comprehension, Math Knowledge, General Science, Electronics, Auto & Shop, Mechanical Comprehension, Assembling Objects).
- **Pricing** — 3 plans (Basic / Standard / Premium) with prices editable by admin.
- **Contact** — form + email/location/phone (editable by admin).
- **Try a Sample Quiz** (pre-signup tutorial):
  - 10 questions, per-question timer, 7 min total countdown.
  - Shows score + "Create your account to continue" CTA.
  - Legitimizes the site before signup.

## 2. Auth

- Email/password signup + login (Lovable Cloud).
- On signup: profile row created, `status='active'`, `subscription_status='none'`, `approved=false`.
- Password reset page.

## 3. Subscription & simulated payment

- User picks a plan → "Checkout" page → **Simulated Pay** button (no real gateway).
- Creates an `orders` row: `pending` → auto-mark `paid` on simulated success.
- User's `subscription_status='paid'` but `approved=false` until admin approves.
- User sees "Awaiting admin approval" state on dashboard.

## 4. Member dashboard (auth + approved)

- Overview: current plan, progress, next steps.
- Practice tests (by subtest), full-length practice ASVAB, study library gated by plan tier.
- Score history, profile settings.
- Locked content shows upgrade prompt if plan tier insufficient.

## 5. Admin panel

Login: `gonzila@gmail.com` / `gonzilla237` (seeded; admin role in `user_roles`).

- **Dashboard**: KPIs (users, paid, unpaid, pending approvals, revenue sim).
- **Users**: table with filters (all / paid / unpaid / active / inactive / banned); actions: approve, ban/unban, activate/deactivate, delete.
- **Orders**: all orders with status filters; mark paid/refunded.
- **Plans & Pricing**: edit name, price, features, tier of each plan; add/remove plans.
- **Site Content**: edit email, phone, address, About page, Contact page copy, hero text via a `site_settings` key/value table.
- **Quiz Manager**: manage the pre-signup tutorial questions and per-question time.
- **Practice Content**: manage practice questions per subtest.

## 6. Data model (Lovable Cloud / Postgres)

```
profiles            (id, email, full_name, status, banned, created_at)
user_roles          (user_id, role: 'admin'|'user')          -- separate table, has_role() SECURITY DEFINER
plans               (id, name, tier, price_cents, features[], active)
subscriptions       (id, user_id, plan_id, status, approved, approved_by, approved_at, created_at)
orders              (id, user_id, plan_id, amount_cents, status, created_at)
site_settings       (key, value)                              -- email, phone, address, about_html, contact_html
tutorial_questions  (id, prompt, choices[], correct_index, time_seconds, order)
practice_questions  (id, subtest, prompt, choices[], correct_index, explanation, min_tier)
quiz_attempts       (id, user_id nullable, score, total, taken_at)   -- pre-signup allowed
```

RLS: users read/write own rows; admin bypass via `has_role(auth.uid(),'admin')`. GRANTs added for each table.

## 7. Routes

```
/                          home
/about
/asvab                     ASVAB info
/pricing
/contact
/tutorial                  pre-signup 7-min quiz
/auth                      login/signup
/reset-password
/checkout/$planId          simulated payment
/_authenticated/
  dashboard
  practice / practice/$subtest
  full-test
  library
  account
/_authenticated/_admin/
  overview
  users
  orders
  plans
  content
  tutorial-questions
  practice-questions
```

## 8. Design

- Professional, military-inspired but modern: deep navy + steel gray + gold accent, crisp sans-serif, clean cards, subtle depth. Semantic tokens in `src/styles.css` (oklch).
- No purple/generic AI look.

## 9. Technical notes

- TanStack Start + Lovable Cloud (Supabase under the hood).
- Server functions for admin actions with `requireSupabaseAuth` + `has_role` check.
- Seed admin user via migration + insert.
- Simulated payment = server fn that flips order/subscription status; no Stripe/Paddle.
- Publishable-key server client for public reads (pricing, tutorial questions, site settings).

## What you'll test after v1

1. Take the pre-signup tutorial.
2. Sign up as a normal user, pick plan, simulate pay.
3. Log in as admin (`gonzila@gmail.com` / `gonzilla237`), approve the user, edit prices, edit contact info.
4. Log back as user → see unlocked dashboard.

Reply "go" (or with any tweaks) and I'll build it.
