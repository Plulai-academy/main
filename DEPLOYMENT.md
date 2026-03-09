# Plulai — Production Deployment Guide

## Prerequisites
- Supabase project (free tier works)
- OpenRouter account + API key
- Vercel account (recommended) or any Node.js host
- Stripe account (for payments)
- Resend account (for emails)

---

## 1. Supabase Setup

1. Create project at https://supabase.com
2. Go to **SQL Editor** and run migrations in order:
   ```
   supabase/migrations/001_schema.sql
   supabase/migrations/002_...
   ...through...
   supabase/migrations/014_lesson_feedback.sql
   ```
3. In **Authentication → URL Configuration**, add:
   - Site URL: `https://yourdomain.com`
   - Redirect URLs: `https://yourdomain.com/auth/callback`
4. Copy your **Project URL** and **anon key** from Settings → API

---

## 2. OpenRouter Setup

1. Sign up at https://openrouter.ai
2. Create an API key at https://openrouter.ai/keys
3. Add credits (free tier available — no credit card for free models)
4. The app auto-selects the best available free model. To pin one:
   ```
   OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free
   ```
   Browse models at: https://openrouter.ai/models?q=free

---

## 3. Stripe Setup (optional — skip to disable payments)

1. Create account at https://stripe.com
2. Create two products in the Dashboard:
   - **Plulai Monthly** — recurring, set your price
   - **Plulai Yearly** — recurring, set your price
3. Copy the **Price IDs** (start with `price_...`)
4. Create a webhook endpoint pointing to `https://yourdomain.com/api/stripe/webhook`
   - Events to listen for: `checkout.session.completed`, `invoice.payment_succeeded`,
     `customer.subscription.deleted`, `customer.subscription.updated`

---

## 4. Resend Setup (optional — skip to disable emails)

1. Sign up at https://resend.com (100 emails/day free)
2. Verify your sending domain
3. Create an API key

---

## 5. Vercel Deployment

```bash
npm i -g vercel
vercel
```

Add all environment variables in **Vercel Dashboard → Settings → Environment Variables**:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `OPENROUTER_API_KEY` | Your OpenRouter API key |
| `OPENROUTER_MODEL` | (optional) pin a model |
| `STRIPE_SECRET_KEY` | Your Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Your Stripe webhook secret |
| `STRIPE_PRICE_MONTHLY` | Stripe monthly price ID |
| `STRIPE_PRICE_YEARLY` | Stripe yearly price ID |
| `RESEND_API_KEY` | Your Resend API key |
| `NEXT_PUBLIC_APP_URL` | `https://yourdomain.com` |
| `CRON_SECRET` | Random 32-char hex string |
| `ADMIN_SECRET` | Random 24-char hex string |

---

## 6. Cron Jobs (Vercel)

Add to `vercel.json` (already included):
- Streak alerts: daily at 8 PM UAE time
- Trial expiry: daily at 9 AM
- Weekly report: Sundays at 7 AM

---

## 7. Post-deploy checklist

- [ ] Run all SQL migrations in Supabase
- [ ] Test signup → onboarding → dashboard flow
- [ ] Test AI Coach responds (check OpenRouter key is set)
- [ ] Visit `/admin` with your ADMIN_SECRET to verify admin works
- [ ] Test Stripe checkout with test card `4242 4242 4242 4242`
- [ ] Verify Stripe webhook receives events
- [ ] Test parent dashboard link via `/api/parent/token`

---

## Troubleshooting

**AI Coach shows error**: Check `OPENROUTER_API_KEY` is set and valid. Visit `/api/chat` in browser — you'll see `Unauthorized` (correct) not a config error.

**Dashboard shows zeros**: Run migration `012_fix_missing_progress_rows.sql` again.

**Auth redirect loop**: Confirm Supabase redirect URLs include your production domain.

**Stripe webhook failing**: Confirm `STRIPE_WEBHOOK_SECRET` matches the webhook signing secret in Stripe Dashboard.
