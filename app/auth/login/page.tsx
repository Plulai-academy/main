'use client'
// app/auth/login/page.tsx
//
// Redesign only: the sign-in, Google, pending-class-code and redirect logic
// below is exactly the same as before. Styling lives in components/AuthShell.tsx
// (shared with signup); no font is set, so text inherits your site font.

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn, signInWithGoogle, resolveUserDestination, redeemClassCode } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/client'
import { AuthAside, AuthMobileLogo, authCss as css } from '@/components/AuthShell'

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

      <AuthAside title="Welcome back." text="Pick up your path right where you left off." />

      {/* ---------- form ---------- */}
      <main className="pl-main">
        <div className="pl-formwrap">
          <AuthMobileLogo />

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