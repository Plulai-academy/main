# 💳 Stripe Payment Setup Guide for Plulai

## Step 1 — Create a Stripe account
Go to https://stripe.com and sign up (free).
Start in TEST mode (the toggle in the top-left of the dashboard).

---

## Step 2 — Create Products & Prices

In the Stripe Dashboard → **Products** → **Add Product**:

### Product 1: Plulai Monthly
- Name: `Plulai Monthly`
- Pricing: `$79.00` / month (recurring)
- Copy the **Price ID** → looks like `price_1ABC...`
- Paste into `.env.local` as `STRIPE_PRICE_MONTHLY`

### Product 2: Plulai Yearly
- Name: `Plulai Yearly`
- Pricing: `$663.00` / year (recurring)
- Copy the **Price ID**
- Paste into `.env.local` as `STRIPE_PRICE_YEARLY`

---

## Step 3 — Get your API Keys

Dashboard → **Developers** → **API Keys**:
- Copy **Secret key** (`sk_test_...`) → `STRIPE_SECRET_KEY`
- (The publishable key is NOT needed for server-side checkout)

---

## Step 4 — Set up Webhook

Dashboard → **Developers** → **Webhooks** → **Add endpoint**:

- **Endpoint URL**: `https://YOUR_DOMAIN.com/api/stripe/webhook`
  - For local testing: use the Stripe CLI (see Step 4b)
- **Events to listen for**:
  - `checkout.session.completed`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
  - `customer.subscription.deleted`

After creating: copy the **Signing secret** (`whsec_...`) → `STRIPE_WEBHOOK_SECRET`

### Step 4b — Local testing with Stripe CLI
```bash
# Install Stripe CLI (Mac)
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to your local server
stripe listen --forward-to https://plulai.com/api/stripe/webhook

# This prints a local webhook secret — use it for local dev only
```

---

## Step 5 — Test the flow

1. Go to `/pricing`
2. Click "Get Started" on Monthly or Yearly
3. Use test card: `4242 4242 4242 4242` (any expiry/CVC)
4. Complete checkout
5. Check your Supabase `profiles` table — `subscription` should now be `'pro'`

### Test cards:
| Card number        | Result          |
|--------------------|-----------------|
| 4242 4242 4242 4242 | ✅ Success      |
| 4000 0000 0000 0002 | ❌ Declined     |
| 4000 0025 0000 3155 | 🔐 3D Secure    |

---

## Step 6 — Go Live

1. Switch Stripe to **Live mode**
2. Get live API keys (start with `sk_live_...`)
3. Create a live webhook endpoint
4. Update `.env.local` (or Vercel env vars) with live keys
5. Create live products at the same prices

---

## Subscription flow summary

```
User clicks "Get Started"
  → POST /api/stripe/checkout
  → Creates Stripe Checkout Session
  → Redirects to Stripe-hosted payment page
  → User pays
  → Stripe sends webhook to /api/stripe/webhook
  → Webhook updates profiles.subscription = 'pro'
  → profiles.subscription_ends_at = next billing date
  → User redirected to /dashboard?subscribed=true
```

## Cancellations

Stripe handles this automatically:
- User cancels → `customer.subscription.deleted` webhook fires
- Webhook sets `subscription = 'free'` in DB
- User loses pro access on next request (checkUserAccess returns false)

## UAE/GCC notes
- Stripe supports UAE cards, Saudi Mada, and most GCC payment methods
- Enable **Cartes Bancaires** for French market
- Consider enabling **BNPL** (Tabby/Tamara) for UAE — very popular in GCC
