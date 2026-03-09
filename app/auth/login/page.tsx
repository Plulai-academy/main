'use client'
// app/auth/login/page.tsx
import { Suspense } from 'react'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn, signInWithGoogle } from '@/lib/supabase/queries'
import { cn } from '@/lib/utils'

const schema = z.object({
  email:    z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type FormData = z.infer<typeof schema>

// Inner component — uses useSearchParams, must be inside Suspense
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  const urlError = searchParams.get('error')
  const [serverError, setServerError] = useState(urlError ? decodeURIComponent(urlError) : '')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormData) => {
    setLoading(true)
    setServerError('')
    const { error } = await signIn(values.email, values.password)
    if (error) {
      setServerError(error.message === 'Invalid login credentials'
        ? 'Wrong email or password. Try again!'
        : error.message)
      setLoading(false)
      return
    }
    router.push(redirectTo)
    router.refresh()
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    await signInWithGoogle()
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
            Welcome back, superstar! 🚀
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-white/5 rounded-3xl p-8 shadow-2xl animate-slide-up">
          <h2 className="font-fredoka text-2xl mb-1">Log In</h2>
          <p className="text-muted text-sm font-semibold mb-7">
            Continue your learning adventure
          </p>

          {/* Google OAuth */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-card2 hover:bg-white/5 border border-white/10 rounded-2xl py-3.5 font-bold text-sm transition-all hover:-translate-y-0.5 mb-5 disabled:opacity-50"
          >
            {googleLoading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-muted text-xs font-bold">or</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                placeholder="••••••••"
                autoComplete="current-password"
                className={cn(
                  'w-full bg-card2 border-2 rounded-2xl px-4 py-3.5 text-white font-semibold text-sm outline-none transition-all placeholder:text-muted',
                  errors.password ? 'border-accent1' : 'border-white/8 focus:border-accent4'
                )}
              />
              {errors.password && <p className="text-accent1 text-xs font-bold mt-1.5">{errors.password.message}</p>}
            </div>

            {serverError && (
              <div className="bg-accent1/10 border border-accent1/25 rounded-xl px-4 py-3 text-accent1 text-sm font-bold">
                ⚠️ {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-extrabold text-white bg-gradient-to-r from-accent4 to-accent5 shadow-lg hover:-translate-y-0.5 hover:shadow-accent4/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? '⏳ Logging in...' : '🚀 Log In'}
            </button>
          </form>

          <p className="text-center text-sm text-muted font-semibold mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-accent4 font-bold hover:underline">
              Sign up free →
            </Link>
          </p>
        </div>

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-5 mt-7">
          {['🇦🇪 UAE', '🇸🇦 KSA', '🇶🇦 Qatar', '🇰🇼 Kuwait'].map(c => (
            <span key={c} className="text-xs text-muted font-bold">{c}</span>
          ))}
        </div>
        <p className="text-center text-xs text-muted/60 font-semibold mt-2">
          Trusted by 1,000+ kids across the GCC 🌟
        </p>
      </div>
    </div>
  )
}

// Page export — wraps in Suspense (required by Next.js 14 for useSearchParams)
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted font-bold text-sm">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
