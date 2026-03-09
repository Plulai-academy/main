'use client'
// app/error.tsx — Global error boundary
// Catches unhandled errors in the React tree and shows a friendly page.
import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to error monitoring in production (e.g. Sentry)
    console.error('[GlobalError]', error.digest ?? error.message)
  }, [error])

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#16162a] border border-white/10 rounded-3xl p-10 text-center">
        <div className="text-6xl mb-4">🚨</div>
        <h1 className="font-fredoka text-2xl text-white mb-2">Something went wrong</h1>
        <p className="text-[#8888bb] font-semibold text-sm mb-8 leading-relaxed">
          An unexpected error occurred. Your progress is safe — this was a temporary glitch.
          {error.digest && (
            <span className="block mt-2 text-xs text-white/30 font-mono">
              Error ID: {error.digest}
            </span>
          )}
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full py-3 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-[#4d96ff] to-[#c77dff] text-white hover:-translate-y-0.5 transition-all"
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="w-full py-3 rounded-2xl font-extrabold text-sm border border-white/10 text-[#8888bb] hover:text-white hover:border-white/25 transition-all"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
