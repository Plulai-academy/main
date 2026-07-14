'use client'
// app/auth/signup/page.tsx
import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signUpWithOptionalClassCode, signInWithGoogle } from '@/lib/supabase/queries'
import { cn } from '@/lib/utils'
import styles from '../auth.module.css'

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

export default function SignupPage() {
  const [serverError, setServerError] = useState('')
  const [success, setSuccess]         = useState(false)
  const [loading, setLoading]         = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

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

  if (success) {
    return (
      <div className={styles.wrap}>
        <div className={styles.inner}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>
              <svg width={28} height={28} viewBox="0 0 28 28">
                <path d="M6 14 L11.5 19.5 L22 8" stroke="#053D35" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 style={{ marginBottom: 10 }}>Check your email</h2>
            <p style={{ color: 'rgba(41,57,74,0.65)', lineHeight: 1.6, marginBottom: 28 }}>
              We sent a confirmation link to your email. Click it to activate your account
              and start learning.
            </p>
            <Link href="/auth/login" className="btn btn-cta btn-block">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>

        <div className={styles.logoBlock}>
          <Link href="/" className="wordmark">
            <span className="brand-mark">/</span>
            <span>Plulai</span>
          </Link>
          <p className={styles.logoSub}>Join 150+ kids learning AI &amp; coding across the GCC</p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Create account</h2>
          <p className={styles.cardSubtitle}>Free forever — no credit card needed</p>

          <button onClick={handleGoogle} disabled={googleLoading} className="oauth-btn">
            {googleLoading ? (
              <span className="spinner spinner--dark" />
            ) : (
              <svg width={18} height={18} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Sign up with Google
          </button>

          <div className="auth-divider"><span>or</span></div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="field">
              <label>Your name</label>
              <input
                {...register('displayName')}
                placeholder="e.g. Ahmed or Sara"
                className={cn('input', errors.displayName && 'input--error')}
              />
              {errors.displayName && <p className="error-text">{errors.displayName.message}</p>}
            </div>

            <div className="field">
              <label>Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                className={cn('input', errors.email && 'input--error')}
              />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>

            <div className="field">
              <label>Phone number <span style={{ fontWeight: 500, opacity: 0.6 }}>(optional)</span></label>
              <input
                {...register('phone')}
                type="tel"
                placeholder="+216 XX XXX XXX"
                autoComplete="tel"
                className={cn('input', errors.phone && 'input--error')}
              />
              {errors.phone ? (
                <p className="error-text">{errors.phone.message}</p>
              ) : (
                <p className="field-hint">Used for competition updates and support only.</p>
              )}
            </div>

            {/* Class code — student joining a school. Optional, visually
                distinct so it reads as "special" rather than a required
                field most signups will skip. */}
            <div className={styles.codeField}>
              <p className={styles.codeFieldLabel}>Have a class code?</p>
              <p className={styles.codeFieldHint}>
                If your teacher gave you a code, enter it to join your class. Skip this if not.
              </p>
              <input
                {...register('classCode')}
                placeholder="e.g. MATH5B-7X2K"
                className="input"
                style={{ background: '#fff' }}
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                {...register('password')}
                type="password"
                placeholder="Min 8 characters"
                autoComplete="new-password"
                className={cn('input', errors.password && 'input--error')}
              />
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>

            <div className="field">
              <label>Confirm password</label>
              <input
                {...register('confirm')}
                type="password"
                placeholder="Same password again"
                autoComplete="new-password"
                className={cn('input', errors.confirm && 'input--error')}
              />
              {errors.confirm && <p className="error-text">{errors.confirm.message}</p>}
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 16 }}>
              <input
                {...register('agreeTerms')}
                type="checkbox"
                style={{ marginTop: 3, width: 16, height: 16, accentColor: 'var(--raw-coral)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: 12, color: 'rgba(41,57,74,0.65)', fontWeight: 500, lineHeight: 1.5 }}>
                I agree to Plulai&apos;s <a href="#" style={{ color: 'var(--raw-coral)', fontWeight: 700 }}>Terms of Service</a>{' '}
                and <a href="#" style={{ color: 'var(--raw-coral)', fontWeight: 700 }}>Privacy Policy</a>. I confirm I am at
                least 6 years old or have parental consent.
              </span>
            </label>
            {errors.agreeTerms && <p className="error-text" style={{ marginBottom: 12 }}>{errors.agreeTerms.message}</p>}

            {serverError && <div className="server-error">{serverError}</div>}

            <button type="submit" disabled={loading} className="btn btn-cta btn-block">
              {loading ? <span className="spinner" /> : 'Start learning free'}
            </button>
          </form>

          <p className={styles.footerNote}>
            Already have an account? <Link href="/auth/login">Log in</Link>
          </p>
        </div>

        <div className={styles.valueGrid}>
          <div className={styles.valueTile}><b>Free plan forever</b></div>
          <div className={styles.valueTile}><b>COPPA compliant</b></div>
          <div className={styles.valueTile}><b>Arabic &amp; English</b></div>
        </div>
      </div>
    </div>
  )
}