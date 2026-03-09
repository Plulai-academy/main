'use client'
// app/auth/signup/page.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signUp, signInWithGoogle } from '@/lib/supabase/queries'
import { cn } from '@/lib/utils'

const schema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(30),
  email:       z.string().email('Please enter a valid email'),
  password:    z.string().min(8, 'Password must be at least 8 characters'),
  confirm:     z.string(),
  agreeTerms:  z.boolean().refine((v: boolean) => v, 'You must agree to continue'),
}).refine((d: { password: string; confirm: string }) => d.password === d.confirm, {
  message: "Passwords don't match",
  path: ['confirm'],
})

type FormData = z.infer<typeof schema>

export default function SignupPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { agreeTerms: false },
  })

  const onSubmit = async (values: FormData) => {
    setLoading(true)
    setServerError('')
    const { error } = await signUp(values.email, values.password, values.displayName)
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
      <div className="min-h-screen flex items-center justify-center px-4 relative z-10">
        <div className="max-w-md w-full bg-card border border-white/5 rounded-3xl p-10 text-center shadow-2xl animate-slide-up">
          <div className="text-6xl mb-5 animate-bounce-slow">📬</div>
          <h2 className="font-fredoka text-3xl text-accent3 mb-3">Check your email!</h2>
          <p className="text-muted font-semibold leading-relaxed mb-7">
            We sent a confirmation link to your email. Click it to activate your account and start learning!
          </p>
          <Link href="/auth/login" className="block w-full py-4 rounded-2xl font-extrabold text-white bg-gradient-to-r from-accent4 to-accent5 text-center hover:-translate-y-0.5 transition-all">
            Back to Login →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <h1 className="font-fredoka text-4xl bg-gradient-to-r from-accent2 via-accent1 to-accent5 bg-clip-text text-transparent">
              Plulai
            </h1>
          </Link>
          <p className="text-muted font-semibold text-sm mt-1">
            Join 1,000+ kids learning AI & Coding across the GCC! 🌍
          </p>
        </div>

        <div className="bg-card border border-white/5 rounded-3xl p-8 shadow-2xl animate-slide-up">
          <h2 className="font-fredoka text-2xl mb-1">Create Account</h2>
          <p className="text-muted text-sm font-semibold mb-7">Free forever • No credit card needed</p>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-card2 hover:bg-white/5 border border-white/10 rounded-2xl py-3.5 font-bold text-sm transition-all hover:-translate-y-0.5 mb-5 disabled:opacity-50"
          >
            {googleLoading ? <span className="animate-spin">⏳</span> : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Sign up with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-muted text-xs font-bold">or</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Your Name</label>
              <input
                {...register('displayName')}
                placeholder="e.g. Ahmed or Sara"
                className={cn(
                  'w-full bg-card2 border-2 rounded-2xl px-4 py-3.5 text-white font-semibold text-sm outline-none transition-all placeholder:text-muted',
                  errors.displayName ? 'border-accent1' : 'border-white/8 focus:border-accent4'
                )}
              />
              {errors.displayName && <p className="text-accent1 text-xs font-bold mt-1.5">{errors.displayName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                className={cn(
                  'w-full bg-card2 border-2 rounded-2xl px-4 py-3.5 text-white font-semibold text-sm outline-none transition-all placeholder:text-muted',
                  errors.email ? 'border-accent1' : 'border-white/8 focus:border-accent4'
                )}
              />
              {errors.email && <p className="text-accent1 text-xs font-bold mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Password</label>
              <input
                {...register('password')}
                type="password"
                placeholder="Min 8 characters"
                autoComplete="new-password"
                className={cn(
                  'w-full bg-card2 border-2 rounded-2xl px-4 py-3.5 text-white font-semibold text-sm outline-none transition-all placeholder:text-muted',
                  errors.password ? 'border-accent1' : 'border-white/8 focus:border-accent4'
                )}
              />
              {errors.password && <p className="text-accent1 text-xs font-bold mt-1.5">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Confirm Password</label>
              <input
                {...register('confirm')}
                type="password"
                placeholder="Same password again"
                autoComplete="new-password"
                className={cn(
                  'w-full bg-card2 border-2 rounded-2xl px-4 py-3.5 text-white font-semibold text-sm outline-none transition-all placeholder:text-muted',
                  errors.confirm ? 'border-accent1' : 'border-white/8 focus:border-accent4'
                )}
              />
              {errors.confirm && <p className="text-accent1 text-xs font-bold mt-1.5">{errors.confirm.message}</p>}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                {...register('agreeTerms')}
                type="checkbox"
                className="mt-0.5 w-4 h-4 accent-accent4 cursor-pointer"
              />
              <span className="text-xs text-muted font-semibold leading-relaxed group-hover:text-white transition-colors">
                I agree to Plulai's{' '}
                <a href="#" className="text-accent4 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-accent4 hover:underline">Privacy Policy</a>.
                I confirm I am at least 6 years old or have parental consent.
              </span>
            </label>
            {errors.agreeTerms && <p className="text-accent1 text-xs font-bold">{errors.agreeTerms.message}</p>}

            {serverError && (
              <div className="bg-accent1/10 border border-accent1/25 rounded-xl px-4 py-3 text-accent1 text-sm font-bold">
                ⚠️ {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-extrabold text-white text-base bg-gradient-to-r from-accent3 to-accent4 shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? '⏳ Creating account...' : '🚀 Start Learning Free!'}
            </button>
          </form>

          <p className="text-center text-sm text-muted font-semibold mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-accent4 font-bold hover:underline">Log in →</Link>
          </p>
        </div>

        {/* Value props */}
        <div className="grid grid-cols-3 gap-3 mt-7">
          {[
            { emoji:'🆓', label:'Free plan forever' },
            { emoji:'🔒', label:'COPPA compliant' },
            { emoji:'🌍', label:'Arabic & English' },
          ].map(i => (
            <div key={i.label} className="bg-card/50 border border-white/5 rounded-2xl p-3 text-center">
              <div className="text-xl mb-1">{i.emoji}</div>
              <div className="text-xs text-muted font-bold">{i.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
