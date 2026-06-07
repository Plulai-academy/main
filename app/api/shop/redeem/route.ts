// app/api/shop/redeem/route.ts
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redeemItem, getShopItems } from '@/lib/supabase/wallet'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = 'hello@plulai.com'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { itemId, shippingInfo, notes } = await req.json()
    if (!itemId) return NextResponse.json({ error: 'Missing itemId' }, { status: 400 })

    // Get item details
    const items = await getShopItems()
    const item = items.find(i => i.id === itemId)
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

    // Get user profile for email
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    const userName = profile?.full_name ?? user.email ?? 'A student'
    const userEmail = profile?.email ?? user.email ?? ''

    // Process redemption (atomic)
    const { redemptionId, newBalance } = await redeemItem(
      user.id, item, shippingInfo, notes
    )

    // ── Send admin notification email ─────────────────────────
    const isPhysical = item.category === 'physical'
    const shippingHtml = isPhysical && shippingInfo
      ? `
        <h3>📦 Shipping Information</h3>
        <table style="border-collapse:collapse;width:100%">
          ${Object.entries(shippingInfo).map(([k,v]) =>
            `<tr><td style="padding:6px;font-weight:bold;color:#666">${k}</td><td style="padding:6px">${v}</td></tr>`
          ).join('')}
        </table>
      ` : ''

    await resend.emails.send({
      from: 'Plulai Wallet <wallet@plulai.com>',
      to: [ADMIN_EMAIL],
      subject: `🛍️ New Redemption: ${item.name} — ${userName}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#1CB0F6;padding:24px;border-radius:12px 12px 0 0">
            <h1 style="color:#fff;margin:0">🪙 New Shop Redemption</h1>
          </div>
          <div style="background:#f9f9f9;padding:24px;border-radius:0 0 12px 12px;border:1px solid #eee">
            <h2 style="color:#333">${item.emoji} ${item.name}</h2>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px;color:#666;font-weight:bold">Student</td><td style="padding:8px">${userName}</td></tr>
              <tr><td style="padding:8px;color:#666;font-weight:bold">Email</td><td style="padding:8px"><a href="mailto:${userEmail}">${userEmail}</a></td></tr>
              <tr><td style="padding:8px;color:#666;font-weight:bold">Item</td><td style="padding:8px">${item.name}</td></tr>
              <tr><td style="padding:8px;color:#666;font-weight:bold">Category</td><td style="padding:8px">${item.category}</td></tr>
              <tr><td style="padding:8px;color:#666;font-weight:bold">Coins Spent</td><td style="padding:8px">🪙 ${item.price_coins.toLocaleString()}</td></tr>
              <tr><td style="padding:8px;color:#666;font-weight:bold">Redemption ID</td><td style="padding:8px;font-family:monospace;font-size:12px">${redemptionId}</td></tr>
              ${notes ? `<tr><td style="padding:8px;color:#666;font-weight:bold">Note from student</td><td style="padding:8px;font-style:italic">"${notes}"</td></tr>` : ''}
            </table>
            ${shippingHtml}
            <div style="margin-top:24px;padding:16px;background:#fff3cd;border-radius:8px;border-left:4px solid #FAA918">
              <strong>⚡ Action required:</strong> Fulfill this ${item.category} item for ${userName}.
            </div>
          </div>
        </div>
      `,
    })

    // ── Send confirmation email to student ────────────────────
    await resend.emails.send({
      from: 'Plulai Wallet <wallet@plulai.com>',
      to: [userEmail],
      subject: `🪙 Redemption confirmed: ${item.name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#1CB0F6;padding:24px;border-radius:12px 12px 0 0">
            <h1 style="color:#fff;margin:0">🛍️ Redemption Confirmed!</h1>
          </div>
          <div style="background:#f9f9f9;padding:24px;border-radius:0 0 12px 12px;border:1px solid #eee">
            <p>Hey ${userName.split(' ')[0]}! 🎉</p>
            <p>Your redemption for <strong>${item.emoji} ${item.name}</strong> has been received.</p>
            <div style="background:#fff;border:2px solid #1CB0F6;border-radius:12px;padding:16px;margin:16px 0">
              <p style="margin:0;color:#666;font-size:14px">Coins spent</p>
              <p style="margin:4px 0 0;font-size:28px;font-weight:bold;color:#1CB0F6">🪙 ${item.price_coins.toLocaleString()}</p>
            </div>
            <p style="color:#666">
              ${item.category === 'digital' || item.category === 'subscription'
                ? '⚡ Digital items are typically delivered within 24 hours to this email.'
                : '📦 Physical items are shipped within 3-5 business days.'}
            </p>
            <p style="color:#666">Questions? Reply to this email or contact <a href="mailto:hello@plulai.com">hello@plulai.com</a></p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true, redemptionId, newBalance })
  } catch (err: any) {
    console.error('Redeem error:', err)
    const msg = err?.message ?? 'Internal error'
    const status = msg.includes('Insufficient') ? 400 : msg.includes('out of stock') ? 409 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}