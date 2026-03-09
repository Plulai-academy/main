'use client'
// app/dashboard/error.tsx — Dashboard error boundary
import { useEffect } from 'react'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[DashboardError]', error.digest ?? error.message)
  }, [error])

  return (
    <div className="p-10 flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full bg-card border border-white/10 rounded-3xl p-8 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="font-fredoka text-xl mb-2">Page failed to load</h2>
        <p className="text-muted font-semibold text-sm mb-6 leading-relaxed">
          This section hit an error. Your XP and progress are safe.
          {error.digest && (
            <span className="block mt-1 text-xs text-white/25 font-mono">
              {error.digest}
            </span>
          )}
        </p>
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 py-3 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-accent4 to-accent5 text-white hover:-translate-y-0.5 transition-all"
          >
            Retry
          </button>
          <Link
            href="/dashboard"
            className="flex-1 py-3 rounded-2xl font-extrabold text-sm border border-white/10 text-muted hover:text-white transition-all"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
