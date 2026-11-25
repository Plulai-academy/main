'use client'
// components/layout/DashboardNav.tsx
//
// REDESIGN v3 — same props, same routes, same language/RTL logic. Only the
// look changed. It stays on the dashboard's own mint surface, and:
//   - uses the real Plulai logo (public/logo.png) instead of an icon + text
//   - every item gets an icon tile; the active one fills with coral
//   - gem balance is a compact chip next to the logo (opens the shop)
//   - the profile row at the bottom is now a card that links to /dashboard/profile
//   - the mobile bar keeps its height but uses a pill behind the active icon
//   - aria-current, focus rings and labels were added for accessibility
// Fonts are not set here, so everything inherits your app font.

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

// Minimal inline icons — same paths as before.
function NavIcon({ name, className }: { name: string; className?: string }) {
  const props = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
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
    <svg className={className} width={14} height={14} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M4 8 L10 2 L16 8 L10 18 Z" fill="#7C6FFF" />
      <path d="M4 8 L16 8 L10 18 Z" fill="#9B90FF" />
      <path d="M10 2 L7 8 L13 8 Z" fill="#B4ABFF" />
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

  const gemsLabel = lang === 'ar' ? 'الجواهر' : lang === 'fr' ? 'Gemmes' : 'Gems'
  const menuLabel = lang === 'ar' ? 'القائمة الرئيسية' : lang === 'fr' ? 'Navigation principale' : 'Main navigation'

  return (
    <>
      {/* ============ Desktop sidebar (lg and up) ============ */}
      <aside
        dir={dir}
        className="hidden lg:flex w-64 flex-shrink-0 fixed inset-y-0 left-0 z-40 flex-col bg-[#EAF6F1] border-r border-[#D8E9E3] pt-7 pb-5 px-4"
      >
        {/* Logo + gem balance */}
        <div className="mb-7 flex items-center justify-between gap-2 px-1.5">
          <Link href="/dashboard" aria-label="Plulai" className="flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6E52]/50">
            <Image src="/logo.png" alt="Plulai" width={132} height={36} priority className="h-8 w-auto" />
          </Link>
          {balance != null && (
            <Link
              href="/dashboard/shop"
              aria-label={`${gemsLabel}: ${balance}`}
              className="flex items-center gap-1.5 rounded-full bg-white py-1 pl-2 pr-2.5 shadow-[0_2px_8px_rgba(22,50,58,0.08)] ring-1 ring-[#E1EEE9] transition hover:shadow-[0_4px_12px_rgba(22,50,58,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6E52]/50"
            >
              <GemIcon />
              <span className="text-[#16323A] text-[12.5px] font-extrabold tabular-nums">{balance}</span>
            </Link>
          )}
        </div>

        {/* Nav items */}
        <nav aria-label={menuLabel} className="flex flex-1 flex-col gap-1.5">
          {NAV_ITEMS.map(item => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group flex items-center gap-3 rounded-2xl px-2.5 py-2 text-[15px] font-bold transition-all',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6E52]/50',
                  active
                    ? 'bg-white text-[#16323A] shadow-[0_4px_14px_rgba(22,50,58,0.08)]'
                    : 'text-[#5B7B78] hover:bg-white/60 hover:text-[#16323A]'
                )}
              >
                <span
                  className={cn(
                    'grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors',
                    active
                      ? 'bg-[#FF6E52] text-white shadow-[0_6px_14px_rgba(255,110,82,0.35)]'
                      : 'bg-white/70 text-[#5B7B78] group-hover:bg-white group-hover:text-[#FF6E52]'
                  )}
                >
                  <NavIcon name={item.key} className="h-[19px] w-[19px]" />
                </span>
                <span className="flex-1 truncate">{getLabel(item)}</span>
                {active && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF6E52]" aria-hidden />}
              </Link>
            )
          })}
        </nav>

        {/* Bottom profile card */}
        {profile && (
          <Link
            href="/dashboard/profile"
            className="mt-4 flex items-center gap-3 rounded-2xl bg-white p-2.5 shadow-[0_2px_10px_rgba(22,50,58,0.07)] ring-1 ring-[#E1EEE9] transition hover:shadow-[0_6px_16px_rgba(22,50,58,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6E52]/50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EAF6F1] ring-2 ring-white">
              {profile.avatar ? (
                <Image src={profile.avatar} alt="" width={40} height={40} className="h-full w-full object-cover" />
              ) : (
                <span className="text-[#16323A] text-sm font-extrabold">
                  {profile.display_name?.[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13.5px] font-extrabold text-[#16323A]">{profile.display_name}</div>
              <div className="text-[11.5px] font-semibold text-[#7C9995]">{gradeLabel}</div>
            </div>
            <svg className={cn('h-4 w-4 shrink-0 text-[#9BB5B1]', dir === 'rtl' && '-scale-x-100')} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M6 3l5 5-5 5" />
            </svg>
          </Link>
        )}
      </aside>

      {/* ============ Mobile bottom bar (below lg) ============ */}
      <nav
        dir={dir}
        aria-label={menuLabel}
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex items-stretch justify-around rounded-t-3xl border-t border-[#E4EDE9] bg-white/95 px-2 pt-1.5 shadow-[0_-8px_24px_rgba(22,50,58,0.08)] backdrop-blur"
        style={{ paddingBottom: 'max(6px, env(safe-area-inset-bottom))' }}
      >
        {NAV_ITEMS.map(item => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6E52]/50 rounded-2xl"
            >
              <span
                className={cn(
                  'grid h-8 w-12 place-items-center rounded-full transition-colors',
                  active ? 'bg-[#FF6E52]/10 text-[#FF6E52]' : 'text-[#9BB5B1]'
                )}
              >
                <NavIcon name={item.key} className="h-5 w-5" />
              </span>
              <span
                className={cn(
                  'max-w-full truncate text-[10.5px] font-bold leading-none',
                  active ? 'text-[#FF6E52]' : 'text-[#9BB5B1]'
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