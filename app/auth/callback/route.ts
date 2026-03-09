// app/auth/callback/route.ts
// Handles both PKCE (email confirmation) and implicit (magic link) flows.
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code          = searchParams.get('code')
  const token_hash    = searchParams.get('token_hash')
  const type          = searchParams.get('type')         // 'email', 'recovery', etc.
  const next          = searchParams.get('next') || '/dashboard'
  const error         = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  // Supabase sent an explicit error
  if (error) {
    const msg = encodeURIComponent(error_description ?? error)
    return NextResponse.redirect(`${origin}/auth/login?error=${msg}`)
  }

  const supabase = createClient()

  // ── PKCE flow: email confirmation / OAuth ─────────────────
  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (!exchangeError) {
      // New signup → go to onboarding; existing login → go to next
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_done')
          .eq('id', user.id)
          .single()
        const dest = (!profile?.onboarding_done) ? '/onboarding' : next
        return NextResponse.redirect(`${origin}${dest}`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('[callback] exchangeCodeForSession error:', exchangeError.message)
  }

  // ── Token hash flow: email OTP / magic link ───────────────
  if (token_hash && type) {
    const { error: verifyError } = await supabase.auth.verifyOtp({ token_hash, type: type as any })
    if (!verifyError) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('[callback] verifyOtp error:', verifyError.message)
  }

  // Nothing worked
  return NextResponse.redirect(`${origin}/auth/login?error=Could+not+sign+you+in.+Try+again+or+contact+support.`)
}
