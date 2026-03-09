// app/not-found.tsx — Custom 404 page
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="font-fredoka text-[120px] leading-none text-[#4d96ff] mb-4">404</div>
        <h1 className="font-fredoka text-3xl text-white mb-3">Page not found</h1>
        <p className="text-[#8888bb] font-semibold text-sm mb-8 leading-relaxed">
          This page doesn&apos;t exist or was moved. Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <Link
            href="/dashboard"
            className="py-4 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-[#4d96ff] to-[#c77dff] text-white hover:-translate-y-0.5 transition-all"
          >
            🚀 Go to Dashboard
          </Link>
          <Link
            href="/"
            className="py-4 rounded-2xl font-extrabold text-sm border border-white/10 text-[#8888bb] hover:text-white hover:border-white/25 transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
