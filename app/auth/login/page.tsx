'use client'
// app/auth/login/page.tsx
//
// Redesign only: the sign-in, Google, pending-class-code and redirect logic
// below is exactly the same as before. Styling is self-contained (no
// auth.module.css, no global .input/.btn classes) and no font is set, so
// text inherits your site font.

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn, signInWithGoogle, resolveUserDestination, redeemClassCode } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  email:    z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type FormData = z.infer<typeof schema>

// Inner component — uses useSearchParams, must be inside Suspense
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const explicitRedirect = searchParams.get('redirectTo')

  const urlError = searchParams.get('error')
  const [serverError, setServerError] = useState(urlError ? decodeURIComponent(urlError) : '')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormData) => {
    setLoading(true)
    setServerError('')
    const { data, error } = await signIn(values.email, values.password)
    if (error) {
      setServerError(error.message === 'Invalid login credentials'
        ? 'Wrong email or password. Try again!'
        : error.message)
      setLoading(false)
      return
    }

    const user = data.user
    if (!user) {
      setServerError('Something went wrong logging in — please try again.')
      setLoading(false)
      return
    }

    // First login after signup with a pending class code — redeem it
    // now that we have an active session, then clear it so it never
    // gets re-redeemed on a later login.
    const pendingCode = (user.user_metadata as Record<string, unknown> | null)?.pending_class_code
    if (typeof pendingCode === 'string' && pendingCode) {
      const result = await redeemClassCode(pendingCode)
      if (result.success) {
        await createClient().auth.updateUser({ data: { pending_class_code: null } })
      }
      // A failed code (expired/invalid) doesn't block login — the
      // student just lands as a regular b2c account and can enter
      // a code again later from settings.
    }

    if (explicitRedirect) {
      router.push(explicitRedirect)
    } else {
      const destination = await resolveUserDestination(user.id)
      router.push(destination.redirectTo)
    }
    router.refresh()
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    await signInWithGoogle()
  }

  return (
    <div className="pl-auth">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* ---------- brand panel (desktop) ---------- */}
      <aside className="pl-aside" aria-hidden="false">
        <Link href="/" className="pl-pill-logo" aria-label="Plulai home">
          <Image src="/logo.png" alt="Plulai" width={132} height={36} priority style={{ height: 'auto', width: 'auto', maxHeight: 32 }} />
        </Link>

        <div className="pl-asidebody">
          <h1>Welcome back.</h1>
          <p>Pick up your path right where you left off.</p>

          <div className="pl-mascot">
            <div className="pl-orb" aria-hidden />
            <Image src="/avatars/heroplulai.png" alt="Marjan the camel, Plulai's mascot" width={300} height={300} priority />
            <div className="pl-chipcard">
              <span className="pl-pearl" />
              <div><b>4-pearl streak</b><small>One more today</small></div>
            </div>
          </div>
        </div>

        <dl className="pl-asidestats">
          <div><dt>20,000+</dt><dd>Kids reached</dd></div>
          <div><dt>500+</dt><dd>Missions</dd></div>
          <div><dt>11+</dt><dd>Partners in MENA</dd></div>
        </dl>
      </aside>

      {/* ---------- form ---------- */}
      <main className="pl-main">
        <div className="pl-formwrap">
          <Link href="/" className="pl-mobilelogo" aria-label="Plulai home">
            <Image src="/logo.png" alt="Plulai" width={132} height={36} priority style={{ height: 'auto', width: 'auto', maxHeight: 34 }} />
          </Link>

          <div className="pl-card">
            <h2>Log in</h2>
            <p className="pl-sub">Continue your learning path</p>

            <button type="button" onClick={handleGoogle} disabled={googleLoading} className="pl-gbtn">
              {googleLoading ? (
                <span className="pl-spin pl-spin-dark" />
              ) : (
                <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </button>

            <div className="pl-or"><span>or</span></div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="pl-field">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  {...register('email')}
                  type="email"
                  placeholder="your@email.com"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  className={errors.email ? 'err' : ''}
                />
                {errors.email && <p className="pl-err">{errors.email.message}</p>}
              </div>

              <div className="pl-field">
                <label htmlFor="login-password">Password</label>
                <div className="pl-pw">
                  <input
                    id="login-password"
                    {...register('password')}
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    aria-invalid={!!errors.password}
                    className={errors.password ? 'err' : ''}
                  />
                  <button type="button" className="pl-eye" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? 'Hide password' : 'Show password'}>
                    {showPw ? (
                      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 3l18 18M10.6 6.1A10 10 0 0 1 12 6c5 0 8.5 4 9.5 6a14 14 0 0 1-2.6 3.4M6.5 6.9A14 14 0 0 0 2.5 12c1 2 4.5 6 9.5 6a9.7 9.7 0 0 0 4-.9M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>
                    ) : (
                      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M2.5 12C3.5 10 7 6 12 6s8.5 4 9.5 6c-1 2-4.5 6-9.5 6s-8.5-4-9.5-6z" /><circle cx="12" cy="12" r="3" /></svg>
                    )}
                  </button>
                </div>
                {errors.password && <p className="pl-err">{errors.password.message}</p>}
              </div>

              {serverError && <div className="pl-server" role="alert">{serverError}</div>}

              <button type="submit" disabled={loading} className="pl-submit">
                {loading ? <span className="pl-spin" /> : 'Log in'}
              </button>
            </form>

            <p className="pl-foot">
              Don&apos;t have an account? <Link href="/auth/signup">Sign up free</Link>
            </p>
          </div>

          <p className="pl-back"><Link href="/">&larr; Back to plulai.com</Link></p>
        </div>
      </main>
    </div>
  )
}

// Page export — wraps in Suspense (required by Next.js for useSearchParams)
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="pl-auth" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <span className="pl-spin pl-spin-dark" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

/* ------------------------------ STYLES ------------------------------ */

const css = `
.pl-auth {
  --ink: #0D2B32; --ink2: #153B44; --teal: #1FB8A6; --teal-d: #12907F; --gold: #D4A24C;
  --cream: #F6F3EA; --line: #D9E2DF; --muted: #4F6B66; --coral: #E5533D;
  min-height: 100vh; display: grid; grid-template-columns: 1.05fr 1fr; background: var(--cream); color: var(--ink);
}
.pl-auth *, .pl-auth *::before, .pl-auth *::after { box-sizing: border-box; }
.pl-auth a:focus-visible, .pl-auth button:focus-visible, .pl-auth input:focus-visible { outline: 3px solid var(--teal); outline-offset: 2px; }

/* brand panel */
.pl-aside { position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; gap: 32px; padding: 40px 56px; color: var(--cream); background: linear-gradient(160deg, #0D2B32 0%, #153B44 60%, #0F3A40 100%); }
.pl-aside::before { content: ''; position: absolute; inset: 0; background-image: radial-gradient(rgba(246,243,234,.09) 1px, transparent 1px); background-size: 28px 28px; mask-image: radial-gradient(ellipse at 70% 40%, #000, transparent 70%); -webkit-mask-image: radial-gradient(ellipse at 70% 40%, #000, transparent 70%); }
.pl-aside::after { content: ''; position: absolute; width: 560px; height: 560px; right: -160px; top: -140px; border-radius: 50%; background: radial-gradient(circle, rgba(31,184,166,.3), transparent 65%); pointer-events: none; }
.pl-aside > * { position: relative; z-index: 1; }
.pl-pill-logo { align-self: flex-start; display: inline-flex; align-items: center; padding: 8px 18px; border-radius: 999px; background: var(--cream); }
.pl-asidebody h1 { margin: 0; color: var(--cream); font-size: clamp(38px, 4.6vw, 58px); font-weight: 800; line-height: 1.05; letter-spacing: -0.035em; }
.pl-asidebody p { margin: 14px 0 0; max-width: 360px; font-size: 18px; line-height: 1.6; color: #B7CCC8; }
.pl-mascot { position: relative; display: flex; justify-content: center; margin-top: 28px; }
.pl-mascot img { position: relative; max-width: 100%; height: auto; filter: drop-shadow(0 24px 40px rgba(0,0,0,.35)); }
.pl-orb { position: absolute; top: 4%; width: 78%; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle at 35% 30%, rgba(31,184,166,.5), rgba(31,184,166,.08) 70%); border: 1px solid rgba(255,255,255,.12); }
.pl-chipcard { position: absolute; left: 4%; bottom: 10%; display: flex; align-items: center; gap: 10px; padding: 11px 16px; border-radius: 16px; background: rgba(255,255,255,.96); color: var(--ink); box-shadow: 0 16px 36px rgba(0,0,0,.28); }
.pl-chipcard b { display: block; font-size: 13.5px; }
.pl-chipcard small { font-size: 12px; color: var(--muted); }
.pl-pearl { width: 16px; height: 16px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #fff, var(--gold)); animation: pl-pulse 1.8s ease-in-out infinite; }
@keyframes pl-pulse { 50% { transform: scale(1.25); opacity: .75; } }
.pl-asidestats { display: flex; gap: 32px; margin: 0; padding-top: 24px; border-top: 1px solid rgba(255,255,255,.12); }
.pl-asidestats dt { font-size: 26px; font-weight: 800; letter-spacing: -0.03em; background: linear-gradient(90deg, #4FE0CD, #F0C46E); -webkit-background-clip: text; background-clip: text; color: transparent; }
.pl-asidestats dd { margin: 2px 0 0; font-size: 13px; font-weight: 600; color: #9DB5B0; }

/* form side */
.pl-main { display: flex; align-items: center; justify-content: center; padding: 40px 24px; }
.pl-formwrap { width: 100%; max-width: 430px; }
.pl-mobilelogo { display: none; margin-bottom: 24px; }
.pl-card { background: #fff; border-radius: 28px; padding: 36px 34px 30px; box-shadow: 0 2px 4px rgba(13,43,50,.05), 0 24px 56px rgba(13,43,50,.12); }
.pl-card h2 { margin: 0; color: var(--ink); font-size: 30px; font-weight: 800; letter-spacing: -0.03em; }
.pl-sub { margin: 6px 0 26px; font-size: 15.5px; color: var(--muted); }

.pl-gbtn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 13px 18px; border-radius: 999px; border: 1.5px solid var(--line); background: #fff; color: var(--ink); font-size: 15px; font-weight: 700; cursor: pointer; transition: border-color .15s ease, background .15s ease; }
.pl-gbtn:hover:not(:disabled) { border-color: var(--ink); background: #FAFBFA; }
.pl-gbtn:disabled, .pl-submit:disabled { opacity: .7; cursor: not-allowed; }
.pl-or { display: flex; align-items: center; gap: 14px; margin: 22px 0; font-size: 13px; font-weight: 600; color: #7A918D; }
.pl-or::before, .pl-or::after { content: ''; flex: 1; height: 1px; background: #E4E9E7; }

.pl-field { margin-bottom: 18px; }
.pl-field label { display: block; margin-bottom: 7px; font-size: 14px; font-weight: 700; }
.pl-field input { width: 100%; padding: 13px 16px; border: 1.5px solid var(--line); border-radius: 14px; background: #fff; color: var(--ink); font-size: 15.5px; transition: border-color .15s ease, box-shadow .15s ease; }
.pl-field input::placeholder { color: #9DB0AC; }
.pl-field input:focus { outline: none; border-color: var(--teal); box-shadow: 0 0 0 4px rgba(31,184,166,.18); }
.pl-field input.err { border-color: var(--coral); }
.pl-field input.err:focus { box-shadow: 0 0 0 4px rgba(229,83,61,.15); }
.pl-pw { position: relative; }
.pl-pw input { padding-right: 48px; }
.pl-eye { position: absolute; top: 50%; right: 8px; transform: translateY(-50%); width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border: 0; border-radius: 10px; background: none; color: #6F8782; cursor: pointer; }
.pl-eye:hover { color: var(--ink); background: #F1F5F4; }
.pl-err { margin: 6px 2px 0; font-size: 13px; font-weight: 600; color: var(--coral); }
.pl-server { margin: 4px 0 16px; padding: 12px 14px; border-radius: 12px; font-size: 14px; font-weight: 600; line-height: 1.45; color: #9B2F1E; background: #FDEDEA; border: 1px solid #F6C9C0; }

.pl-submit { width: 100%; display: flex; align-items: center; justify-content: center; min-height: 50px; margin-top: 6px; padding: 14px 20px; border: 0; border-radius: 999px; background: var(--teal); color: var(--ink); font-size: 16px; font-weight: 800; cursor: pointer; box-shadow: 0 8px 20px rgba(31,184,166,.32); transition: transform .15s ease, background .15s ease; }
.pl-submit:hover:not(:disabled) { background: #2BD2BE; transform: translateY(-1px); }
.pl-foot { margin: 22px 0 0; text-align: center; font-size: 14.5px; color: var(--muted); }
.pl-foot a { color: var(--teal-d); font-weight: 800; text-decoration: underline; text-underline-offset: 3px; }
.pl-back { margin: 20px 0 0; text-align: center; font-size: 14px; font-weight: 600; }
.pl-back a { color: var(--muted); text-decoration: none; }
.pl-back a:hover { color: var(--ink); }

.pl-spin { width: 20px; height: 20px; border-radius: 50%; border: 2.5px solid rgba(13,43,50,.25); border-top-color: var(--ink); animation: pl-spin .7s linear infinite; }
.pl-spin-dark { border-color: rgba(13,43,50,.15); border-top-color: var(--ink); }
@keyframes pl-spin { to { transform: rotate(360deg); } }

@media (max-width: 960px) {
  .pl-auth { grid-template-columns: 1fr; }
  .pl-aside { display: none; }
  .pl-mobilelogo { display: inline-flex; }
  .pl-main { align-items: flex-start; padding: 32px 18px 40px; }
  .pl-formwrap { max-width: 460px; }
}
@media (max-width: 420px) {
  .pl-card { padding: 28px 22px 24px; border-radius: 24px; }
}
@media (prefers-reduced-motion: reduce) {
  .pl-pearl, .pl-spin { animation: none; }
  .pl-submit { transition: none; }
}
`