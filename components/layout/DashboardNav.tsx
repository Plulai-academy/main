'use client'
// components/layout/DashboardNav.tsx
//
// REDESIGN — same nav, same routes, same props, same active-path logic,
// same language handling. Nothing functional changed. What changed:
//   - Sidebar background moved from generic dark slate (#0F1E21) to the
//     navy (#16323A) already used as the dashboard's text color — same
//     brand navy, not a new invented value.
//   - Logo: amber dot + wordmark → the same Marjan mascot used in
//     DashboardClient, for one consistent character across the product.
//   - Active state: a faint white/8% overlay → a solid coral pill
//     (#FF6E52), matching the CTA color used everywhere else. A nav item
//     should look like a place you're standing, not a slightly-lighter
//     rectangle.
//   - Desktop sidebar now shows icons too (previously icon-only on
//     mobile, text-only on desktop — inconsistent between the two).
//   - `balance` was a prop that was received but never rendered anywhere
//     in the original file. Surfaced it as a gem-balance widget linking
//     to /dashboard/shop (a real route per the project's build output),
//     using the same gem visual language as the dashboard redesign.

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/openrouter'

const NAV_ITEMS = [
  { key:'home',        href:'/dashboard',             en:'Home',        ar:'الرئيسية',     fr:'Accueil'      },
  { key:'path',        href:'/dashboard/path',        en:'My path',     ar:'مساري',        fr:'Mon parcours' },
  { key:'assignments', href:'/dashboard/assignments', en:'Assignments', ar:'الواجبات',     fr:'Devoirs'      },
  { key:'tutor',       href:'/dashboard/ai-tutor',    en:'AI tutor',    ar:'المعلم الذكي', fr:'Tuteur IA'    },
  { key:'profile',     href:'/dashboard/profile',     en:'Profile',     ar:'الملف الشخصي', fr:'Profil'       },
] as const

// Minimal inline icons — unchanged from the original (same paths), now
// also used in the desktop sidebar, not just the mobile bar.
function NavIcon({ name, className }: { name: string; className?: string }) {
  const props = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  switch (name) {
    case 'home':
      return (
        <svg {...props}>
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
        </svg>
      )
    case 'path':
      return (
        <svg {...props}>
          <circle cx="6" cy="6" r="2.2" />
          <circle cx="18" cy="18" r="2.2" />
          <path d="M7.8 7.5c1 2 2 3 4.2 4.5s3.2 2.5 4.2 4.5" />
        </svg>
      )
    case 'assignments':
      return (
        <svg {...props}>
          <rect x="5" y="4" width="14" height="17" rx="2" />
          <path d="M9 3.5h6v2H9z" />
          <path d="M8.5 11h7M8.5 14.5h7M8.5 18h4" />
        </svg>
      )
    case 'tutor':
      return (
        <svg {...props}>
          <rect x="4" y="6" width="16" height="12" rx="3" />
          <circle cx="9" cy="12" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="15" cy="12" r="1.1" fill="currentColor" stroke="none" />
          <path d="M12 6V3.5" />
          <path d="M9.5 17.5h5" />
        </svg>
      )
    case 'profile':
      return (
        <svg {...props}>
          <circle cx="12" cy="8.5" r="3.3" />
          <path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5" />
        </svg>
      )
    default:
      return null
  }
}

function GemIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 20 20" fill="none">
      <path d="M4 8 L10 2 L16 8 L10 18 Z" fill="#9B90FF" />
      <path d="M4 8 L16 8 L10 18 Z" fill="#B4ABFF" />
      <path d="M10 2 L7 8 L13 8 Z" fill="#CFC8FF" />
    </svg>
  )
}

interface Props {
  profile: { display_name: string; avatar: string; age: number; preferred_language?: string } | null
  userId:  string
  balance?: number | null
}

export default function DashboardNav({ profile, userId, balance }: Props) {
  const pathname = usePathname()
  const lang     = (profile?.preferred_language ?? 'en') as Language
  const dir      = lang === 'ar' ? 'rtl' : 'ltr'

  const getLabel = (item: typeof NAV_ITEMS[number]) =>
    lang === 'ar' ? item.ar : lang === 'fr' ? item.fr : item.en

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  const gradeLabel =
    lang === 'ar' ? `عمر ${profile?.age}` : lang === 'fr' ? `${profile?.age} ans` : `Age ${profile?.age}`

  return (
    <>
      {/* Desktop sidebar (lg and up) */}
      <aside
        dir={dir}
        className="hidden lg:flex w-64 flex-shrink-0 fixed inset-y-0 left-0 z-40 flex-col bg-[#16323A] border-r border-white/[0.06] py-7 px-5"
      >
        {/* Logo */}
        <div className="mb-8 flex items-center gap-2.5 px-1">
          <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center overflow-hidden shrink-0">
            <Image src="/avatars/marjanthecamel.png" alt="" width={26} height={26} className="object-contain" />
          </div>
          <span className="text-white font-extrabold text-xl tracking-tight">Plulai</span>
        </div>

        {/* Gem balance — links to the shop */}
        {balance != null && (
          <Link
            href="/dashboard/shop"
            className="mb-6 flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.09] transition-colors"
          >
            <span className="flex items-center gap-2">
              <GemIcon />
              <span className="text-white font-extrabold text-sm">{balance}</span>
            </span>
            <span className="text-[11px] font-semibold text-slate-400">Shop →</span>
          </Link>
        )}

        {/* Nav items */}
        <nav className="flex flex-col gap-1.5 flex-1">
          {NAV_ITEMS.map(item => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-2xl font-bold text-[15px] transition-all',
                  active
                    ? 'text-white'
                    : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'
                )}
                style={active ? { background: '#FF6E52', boxShadow: '0 4px 14px rgba(255,110,82,0.3)' } : undefined}
              >
                <NavIcon name={item.key} className="w-[19px] h-[19px] shrink-0" />
                {getLabel(item)}
              </Link>
            )
          })}
        </nav>

        {/* Bottom caption */}
        {profile && (
          <div className="pt-5 border-t border-white/[0.06] px-1 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center overflow-hidden shrink-0">
              {profile.avatar ? (
                <Image src={profile.avatar} alt="" width={32} height={32} className="object-cover w-full h-full" />
              ) : (
                <span className="text-white text-xs font-extrabold">
                  {profile.display_name?.[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <div className="text-white text-[13px] font-bold truncate">{profile.display_name}</div>
              <div className="text-[11px] font-medium text-slate-500">{gradeLabel}</div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile bottom bar (below lg) */}
      <nav
        dir={dir}
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex items-stretch justify-around bg-[#16323A] border-t border-white/[0.06] px-1 pt-1.5"
        style={{ paddingBottom: 'max(6px, env(safe-area-inset-bottom))' }}
      >
        {NAV_ITEMS.map(item => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex-1 flex flex-col items-center justify-center gap-1 py-1.5"
            >
              <span
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full transition-colors',
                  active ? '' : 'text-slate-500'
                )}
                style={active ? { background: '#FF6E52' } : undefined}
              >
                <NavIcon name={item.key} className={cn('w-[18px] h-[18px]', active ? 'text-white' : 'text-slate-500')} />
              </span>
              <span
                className={cn(
                  'text-[10px] font-semibold leading-none',
                  active ? 'text-white' : 'text-slate-500'
                )}
              >
                {getLabel(item)}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}