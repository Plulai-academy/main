// app/api/parent/token/route.ts
// Generates a secure token for parent dashboard access.
// Stores token in DB and optionally emails it. Always returns the link.
import { NextRequest, NextResponse } from 'next/server'
import { requireEnv } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import crypto from 'crypto'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  // Fail fast if service role key missing
  try { requireEnv('SUPABASE_SERVICE_ROLE_KEY') }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Fetch all fields needed — avatar + preferred_language used in email template
    const { data: profile } = await supabase
      .from('profiles')
      .select('parent_email, display_name, avatar, preferred_language')
      .eq('id', user.id)
      .single()

    if (!profile?.parent_email) {
      return NextResponse.json(
        { error: 'No parent email set. Add one in Settings first.' },
        { status: 400 }
      )
    }

    // Generate a cryptographically secure token
    const token     = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    // Store token via admin client (bypasses RLS)
    const supabaseAdmin = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: upsertErr } = await supabaseAdmin
      .from('parent_tokens')
      .upsert({ user_id: user.id, token, expires_at: expiresAt }, { onConflict: 'user_id' })

    if (upsertErr) {
      console.error('[parent/token] upsert error:', upsertErr)
      return NextResponse.json({ error: 'Failed to save token: ' + upsertErr.message }, { status: 500 })
    }

    const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? 'https://plulai.com'
    const magicLink = `${appUrl}/parent/${token}`

    // Try to email the link — skip gracefully if Resend not configured
    const isDev = !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith('re_your_')

    if (!isDev) {
      try {
        const { sendEmail }            = await import('@/lib/email/sender')
        const { parentMagicLinkEmail } = await import('@/lib/email/templates')

        const lang = (profile.preferred_language ?? 'en') as 'en' | 'ar' | 'fr'
        const { subject, html } = parentMagicLinkEmail({
          parentEmail:  profile.parent_email,
          childName:    profile.display_name ?? 'Your child',
          childAvatar:  profile.avatar ?? '🧑‍🚀',
          magicLink,
          expiresHours: 168,
          lang,
        })

        await sendEmail({
          to:   profile.parent_email,
          subject,
          html,
          tags: [{ name: 'type', value: 'parent_magic_link' }],
        })
      } catch (emailErr: any) {
        // Email failure doesn't break the flow — link still works
        console.error('[parent/token] email error:', emailErr.message)
      }
    }

    return NextResponse.json({
      success:   true,
      magicLink, // Always return link so user can share it manually too
      message:   isDev
        ? 'Link generated! (Dev mode — add RESEND_API_KEY to also email it)'
        : `Link generated and emailed to ${profile.parent_email}`,
    })

  } catch (err: any) {
    console.error('[parent/token] unexpected error:', err)
    return NextResponse.json(
      { error: err.message ?? 'Something went wrong' },
      { status: 500 }
    )
  }
}
