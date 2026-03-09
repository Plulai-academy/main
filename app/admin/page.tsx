// app/admin/page.tsx
// Admin dashboard — does its own auth check server-side.
// Calls fetchAdminStats() directly (no localhost HTTP fetch) so it works on Cloudflare Pages.
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import AdminDashboardClient from '@/components/admin/AdminDashboardClient'
import { fetchAdminStats } from '@/lib/admin/stats'

export const dynamic  = 'force-dynamic'
export const metadata = { title: 'Analytics · Plulai Admin', robots: 'noindex, nofollow' }

export default async function AdminPage() {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  // ── 1. Must be logged in ───────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirectTo=/admin')

  // ── 2. Must have is_admin = true ───────────────────────────
  const { createClient: createAdmin } = await import('@supabase/supabase-js')
  const adminDb = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const { data: profile } = await adminDb
    .from('profiles')
    .select('is_admin, display_name, email')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/dashboard')

  // ── 3. Fetch analytics directly (no HTTP self-call) ───────
  // Using fetchAdminStats() directly avoids the localhost fetch that breaks
  // Cloudflare Pages and other edge/serverless build environments.
  let data: any  = null
  let fetchError = ''

  try {
    data = await fetchAdminStats()
  } catch (e: any) {
    fetchError = e.message
  }

  if (fetchError || !data) {
    return (
      <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
        <div style={{ textAlign: 'center', color: '#ff6b6b', maxWidth: 500, padding: 20 }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <p style={{ marginTop: 12 }}>Failed to load analytics</p>
          <code style={{ fontSize: 12, color: '#888', display: 'block', marginTop: 8 }}>{fetchError}</code>
          <p style={{ fontSize: 13, color: '#555', marginTop: 16 }}>
            Make sure SUPABASE_SERVICE_ROLE_KEY is set in your environment variables.
          </p>
        </div>
      </div>
    )
  }

  return <AdminDashboardClient data={data} />
}
