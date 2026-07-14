// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

async function writePhoneIfMissing(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  userMetadata: Record<string, any>
) {
  try {
    const phone = userMetadata?.phone as string | undefined
    if (!phone?.trim()) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('phone')
      .eq('id', userId)
      .single()

    if (!profile?.phone) {
      await supabase
        .from('profiles')
        .update({ phone: phone.trim(), updated_at: new Date().toISOString() })
        .eq('id', userId)
    }
  } catch {
    // Non-blocking — never let this break the auth flow
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code              = searchParams.get('code')
  const token_hash        = searchParams.get('token_hash')
  const type              = searchParams.get('type')
  const next              = searchParams.get('next') || '/dashboard'
  const error             = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  if (error) {
    const msg = encodeURIComponent(error_description ?? error)
    return NextResponse.redirect(`${origin}/auth/login?error=${msg}`)
  }

  // ✅ Await the client if your createClient is async
  const supabase = await createClient()

  // ── PKCE flow: email confirmation / OAuth ─────────────────
  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (!exchangeError) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // ✅ Pass metadata directly — no second getUser() call needed
        await writePhoneIfMissing(supabase, user.id, user.user_metadata)

        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_done')
          .eq('id', user.id)
          .single()

        const dest = !profile?.onboarding_done ? '/onboarding' : next
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
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await writePhoneIfMissing(supabase, user.id, user.user_metadata)
        await redeemPendingClassCodeIfNeeded(supabase, user.id, user.user_metadata)

      }
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('[callback] verifyOtp error:', verifyError.message)
  }

  // Nothing worked
  return NextResponse.redirect(`${origin}/auth/login?error=Could+not+sign+you+in.+Try+again+or+contact+support.`)
}

async function redeemPendingClassCodeIfNeeded(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  userMetadata: Record<string, any>
) {
  try {
    const code = userMetadata?.pending_class_code as string | undefined
    if (!code) return

    // Already enrolled somewhere? Don't double-redeem on repeat callback hits.
    const { data: existingEnrollment } = await supabase
      .from('class_enrollments')
      .select('id')
      .eq('student_id', userId)
      .eq('status', 'active')
      .maybeSingle()

    if (existingEnrollment) return

    const { data: joinCode } = await supabase
      .from('class_join_codes')
      .select('id, class_id, expires_at, max_uses, use_count, is_active')
      .eq('code', code)
      .single()

    if (!joinCode || !joinCode.is_active) return
    if (joinCode.expires_at && new Date(joinCode.expires_at) < new Date()) return
    if (joinCode.max_uses != null && joinCode.use_count >= joinCode.max_uses) return

    const { data: classRow } = await supabase
      .from('classes')
      .select('id, school_id')
      .eq('id', joinCode.class_id)
      .single()

    if (!classRow) return

    await supabase.from('class_enrollments').insert({
      class_id: classRow.id,
      student_id: userId,
      status: 'active',
      enrolled_at: new Date().toISOString(),
    })

    await supabase
      .from('class_join_codes')
      .update({ use_count: joinCode.use_count + 1 })
      .eq('id', joinCode.id)

    await supabase
      .from('profiles')
      .update({
        account_type: 'b2b2c',
        school_id: classRow.school_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
  } catch {
    // Non-blocking — never let this break the auth flow, same as writePhoneIfMissing
  }
}
