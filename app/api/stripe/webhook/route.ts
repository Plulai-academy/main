// app/api/stripe/webhook/route.ts
// Stripe sends events here when payments succeed, fail, or subscriptions change.
// Set webhook URL in Stripe Dashboard: https://dashboard.stripe.com/webhooks
// Endpoint: https://yourapp.com/api/stripe/webhook
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { requireEnv } from '@/lib/env'

export async function POST(req: NextRequest) {
  try {
    requireEnv('STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'SUPABASE_SERVICE_ROLE_KEY')
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {

      // ── Payment succeeded → activate subscription ──────────────
      case 'checkout.session.completed': {
        const session  = event.data.object as Stripe.Checkout.Session
        const userId   = session.metadata?.supabase_user_id
        const plan     = session.metadata?.plan ?? 'monthly'
        const subId    = session.subscription as string

        if (!userId) break

        const sub = await stripe.subscriptions.retrieve(subId)
        const currentPeriodEnd = new Date(sub.current_period_end * 1000).toISOString()

        await supabaseAdmin.from('profiles').update({
          subscription:              'pro',
          stripe_subscription_id:    subId,
          subscribed_at:             new Date().toISOString(),
          subscription_ends_at:      currentPeriodEnd,
          updated_at:                new Date().toISOString(),
        }).eq('id', userId)

        // Award a subscriber badge if it exists
        await supabaseAdmin.from('user_badges')
          .upsert({ user_id: userId, badge_id: 'early-bird' }, { onConflict: 'user_id,badge_id' })

        console.info(`✅ Subscription activated for user ${userId}`)
        break
      }

      // ── Subscription renewed ───────────────────────────────────
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any
        const subId   = invoice.subscription as string
        if (!subId) break

        const sub    = await stripe.subscriptions.retrieve(subId)
        const userId = sub.metadata?.supabase_user_id
        if (!userId) break

        const currentPeriodEnd = new Date(sub.current_period_end * 1000).toISOString()
        await supabaseAdmin.from('profiles').update({
          subscription:           'pro',
          subscription_ends_at:   currentPeriodEnd,
          updated_at:             new Date().toISOString(),
        }).eq('id', userId)

        console.info(`✅ Subscription renewed for user ${userId}`)
        break
      }

      // ── Subscription cancelled ─────────────────────────────────
      case 'customer.subscription.deleted': {
        const sub    = event.data.object as any
        const userId = sub.metadata?.supabase_user_id
        if (!userId) break

        await supabaseAdmin.from('profiles').update({
          subscription:           'free',
          stripe_subscription_id: null,
          subscription_ends_at:   new Date().toISOString(),
          updated_at:             new Date().toISOString(),
        }).eq('id', userId)

        console.info(`⚠️ Subscription cancelled for user ${userId}`)
        break
      }

      // ── Subscription updated (plan change/upgrade) ────────────────
      case 'customer.subscription.updated': {
        const sub    = event.data.object as any
        const userId = sub.metadata?.supabase_user_id
        if (!userId) break

        const currentPeriodEnd = new Date(sub.current_period_end * 1000).toISOString()
        const isActive = sub.status === 'active' || sub.status === 'trialing'

        await supabaseAdmin.from('profiles').update({
          subscription:           isActive ? 'pro' : 'free',
          subscription_ends_at:   currentPeriodEnd,
          updated_at:             new Date().toISOString(),
        }).eq('id', userId)
        break
      }

      // ── Payment failed ─────────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as any
        const subId   = invoice.subscription as string
        if (!subId) break
        const sub    = await stripe.subscriptions.retrieve(subId)
        const userId = sub.metadata?.supabase_user_id
        if (!userId) break
        // Don't downgrade immediately — Stripe retries for a few days
        console.info(`⚠️ Payment failed for user ${userId} — will retry`)
        break
      }
    }
  } catch (err) {
    console.error('[stripe/webhook] Handler error:', err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

// App Router: body parsing is already disabled for raw body access via req.text()
// No need for the Pages Router `config.api.bodyParser = false` export
export const runtime = 'nodejs' // Stripe SDK requires Node.js runtime
