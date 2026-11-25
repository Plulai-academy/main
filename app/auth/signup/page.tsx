'use client'
// app/auth/signup/page.tsx
//
// Redesign only: the schema, sign-up call, Google sign-in and error handling
// are the same as before. Styling lives in components/AuthShell.tsx (shared
// with the login page); no font is set, so text inherits your site font.

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signUpWithOptionalClassCode, signInWithGoogle } from '@/lib/supabase/queries'
import { AuthAside, AuthMobileLogo, authCss as css } from '@/components/AuthShell'

const schema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(30),
  email:       z.string().email('Please enter a valid email'),
  phone:       z
    .string()
    .optional()
    .transform(v => v?.trim() || undefined)
    .refine(v => {
      if (!v) return true // optional
      return /^[\d\s\+\-\(\)]{6,20}$/.test(v)
    }, 'Please enter a valid phone number'),
  classCode:   z.string().optional(),
  password:    z.string().min(8, 'Password must be at least 8 characters'),
  confirm:     z.string(),
  agreeTerms:  z.boolean().refine((v: boolean) => v, 'You must agree to continue'),
}).refine((d: { password: string; confirm: string }) => d.password === d.confirm, {
  message: "Passwords don't match",
  path: ['confirm'],
})

type FormData = z.infer<typeof schema>

const POINTS = ['Free plan forever', 'COPPA compliant', 'Arabic, French & English']

const Eye = ({ off }: { off: boolean }) =>
  off ? (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 3l18 18M10.6 6.1A10 10 0 0 1 12 6c5 0 8.5 4 9.5 6a14 14 0 0 1-2.6 3.4M6.5 6.9A14 14 0 0 0 2.5 12c1 2 4.5 6 9.5 6a9.7 9.7 0 0 0 4-.9M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>
  ) : (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M2.5 12C3.5 10 7 6 12 6s8.5 4 9.5 6c-1 2-4.5 6-9.5 6s-8.5-4-9.5-6z" /><circle cx="12" cy="12" r="3" /></svg>
  )

export default function SignupPage() {
  const [serverError, setServerError] = useState('')
  const [success, setSuccess]         = useState(false)
  const [loading, setLoading]         = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPw, setShowPw]           = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { agreeTerms: false },
  })

  const onSubmit = async (values: FormData) => {
    setLoading(true)
    setServerError('')
    const { error } = await signUpWithOptionalClassCode(
      values.email,
      values.password,
      values.displayName,
      values.phone,
      values.classCode
    )
    if (error) {
      if (error.message.includes('already registered')) {
        setServerError('This email is already registered. Try logging in instead!')
      } else {
        setServerError(error.message)
      }
      setLoading(false)
      return
    }
    setSuccess(true)
    setLoading(false)
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    await signInWithGoogle()
  }

  /* ---------- success state ---------- */
  if (success) {
    return (
      <div className="pl-auth">
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <AuthAside title="You're almost in." text="One quick step left: confirm your email and start learning." />
        <main className="pl-main">
          <div className="pl-formwrap">
            <AuthMobileLogo />
            <div className="pl-card pl-success">
              <div className="pl-successicon">
                <svg width={32} height={32} viewBox="0 0 28 28" aria-hidden>
                  <path d="M6 14 L11.5 19.5 L22 8" stroke="#0D2B32" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2>Check your email</h2>
              <p>We sent a confirmation link to your email. Click it to activate your account and start learning.</p>
              <Link href="/auth/login" className="pl-linkbtn">Back to login</Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  /* ---------- form ---------- */
  return (
    <div className="pl-auth">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <AuthAside
        title="Start building today."
        text="Create your account and join kids learning to code and build with AI."
        points={POINTS}
      />

      <main className="pl-main">
        <div className="pl-formwrap">
          <AuthMobileLogo />

          <div className="pl-card">
            <h2>Create account</h2>
            <p className="pl-sub">Free forever, no credit card needed</p>

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
              Sign up with Google
            </button>

            <div className="pl-or"><span>or</span></div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="pl-field">
                <label htmlFor="su-name">Your name</label>
                <input
                  id="su-name"
                  {...register('displayName')}
                  placeholder="e.g. Ahmed or Sara"
                  autoComplete="given-name"
                  aria-invalid={!!errors.displayName}
                  className={errors.displayName ? 'err' : ''}
                />
                {errors.displayName && <p className="pl-err">{errors.displayName.message}</p>}
              </div>

              <div className="pl-field">
                <label htmlFor="su-email">Email</label>
                <input
                  id="su-email"
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
                <label htmlFor="su-phone">Phone number <span className="pl-opt">(optional)</span></label>
                <input
                  id="su-phone"
                  {...register('phone')}
                  type="tel"
                  placeholder="+216 XX XXX XXX"
                  autoComplete="tel"
                  aria-invalid={!!errors.phone}
                  className={errors.phone ? 'err' : ''}
                />
                {errors.phone ? (
                  <p className="pl-err">{errors.phone.message}</p>
                ) : (
                  <p className="pl-hint">Used for competition updates and support only.</p>
                )}
              </div>

              {/* Class code: student joining a school. Optional, styled as a
                  distinct box so it reads as special rather than required. */}
              <div className="pl-codebox">
                <b>Have a class code?</b>
                <p>If your teacher gave you a code, enter it to join your class. Skip this if not.</p>
                <input
                  id="su-code"
                  {...register('classCode')}
                  placeholder="e.g. MATH5B-7X2K"
                  aria-label="Class code"
                  autoComplete="off"
                />
              </div>

              <div className="pl-two">
                <div className="pl-field">
                  <label htmlFor="su-pass">Password</label>
                  <div className="pl-pw">
                    <input
                      id="su-pass"
                      {...register('password')}
                      type={showPw ? 'text' : 'password'}
                      placeholder="Min 8 characters"
                      autoComplete="new-password"
                      aria-invalid={!!errors.password}
                      className={errors.password ? 'err' : ''}
                    />
                    <button type="button" className="pl-eye" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? 'Hide passwords' : 'Show passwords'}>
                      <Eye off={showPw} />
                    </button>
                  </div>
                  {errors.password && <p className="pl-err">{errors.password.message}</p>}
                </div>

                <div className="pl-field">
                  <label htmlFor="su-confirm">Confirm password</label>
                  <input
                    id="su-confirm"
                    {...register('confirm')}
                    type={showPw ? 'text' : 'password'}
                    placeholder="Same password again"
                    autoComplete="new-password"
                    aria-invalid={!!errors.confirm}
                    className={errors.confirm ? 'err' : ''}
                  />
                  {errors.confirm && <p className="pl-err">{errors.confirm.message}</p>}
                </div>
              </div>

              <label className="pl-agree">
                <input {...register('agreeTerms')} type="checkbox" />
                <span>
                  I agree to Plulai&apos;s <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
                  I confirm I am at least 6 years old or have parental consent.
                </span>
              </label>
              {errors.agreeTerms && <p className="pl-err" style={{ marginBottom: 12 }}>{errors.agreeTerms.message}</p>}

              {serverError && <div className="pl-server" role="alert" style={{ marginTop: 14 }}>{serverError}</div>}

              <button type="submit" disabled={loading} className="pl-submit" style={{ marginTop: 14 }}>
                {loading ? <span className="pl-spin" /> : 'Start learning free'}
              </button>
            </form>

            <p className="pl-foot">
              Already have an account? <Link href="/auth/login">Log in</Link>
            </p>
          </div>

          <div className="pl-valuerow">
            {POINTS.map((p) => <span key={p}>{p}</span>)}
          </div>
          <p className="pl-back"><Link href="/">&larr; Back to plulai.com</Link></p>
        </div>
      </main>
    </div>
  )
}