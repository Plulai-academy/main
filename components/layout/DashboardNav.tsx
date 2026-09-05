'use client'
// components/layout/DashboardNav.tsx
//
// REDESIGN v2 — same nav, same routes, same props, same logic. The
// previous version kept a dark navy sidebar (#16323A) next to the light
// mint dashboard content, which is why it "didn't feel like the
// dashboard" — two different surfaces bolted together. This version
// puts the sidebar on the SAME light surface as the dashboard itself:
//   - Sidebar background: white, sitting on the app's mint page
//     background (#EAF6F1) — no separate dark chrome.
//   - Active state: a white rounded card with a coral left accent bar
//     and coral icon, closer to "a place on the map you're standing"
//     than a corporate selected-tab.
//   - Trimmed back from v1: gem balance is now a small compact chip
//     near the logo instead of its own full-width card; the bottom
//     profile caption is simpler (avatar + name only, no separate
//     bordered block).

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
    <svg className={className} width={14} height={14} viewBox="0 0 20 20" fill="none">
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

  return (
    <>
      {/* Desktop sidebar (lg and up) — sits on the app's own mint background */}
      <aside
        dir={dir}
        className="hidden lg:flex w-64 flex-shrink-0 fixed inset-y-0 left-0 z-40 flex-col bg-[#EAF6F1] border-r border-[#D8E9E3] py-7 px-5"
      >
        {/* Logo + gem balance */}
        <div className="mb-8 flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white shadow-[0_2px_8px_rgba(22,50,58,0.08)] flex items-center justify-center overflow-hidden shrink-0">
              <Image src="/avatars/marjanthecamel.png" alt="" width={24} height={24} className="object-contain" />
            </div>
            <span className="text-[#16323A] font-extrabold text-xl tracking-tight">Plulai</span>
          </div>
          {balance != null && (
            <Link
              href="/dashboard/shop"
              className="flex items-center gap-1 bg-white rounded-full pl-1.5 pr-2 py-1 shadow-[0_2px_8px_rgba(22,50,58,0.08)]"
            >
              <GemIcon />
              <span className="text-[#16323A] text-[12px] font-extrabold">{balance}</span>
            </Link>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1.5 flex-1">
          {NAV_ITEMS.map(item => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-2xl font-bold text-[15px] transition-all',
                  active
                    ? 'bg-white text-[#16323A] shadow-[0_2px_10px_rgba(22,50,58,0.08)]'
                    : 'text-[#5B7B78] hover:bg-white/60 hover:text-[#16323A]'
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-[#FF6E52]" />
                )}
                <NavIcon
                  name={item.key}
                  className={cn('w-[19px] h-[19px] shrink-0', active ? 'text-[#FF6E52]' : '')}
                />
                {getLabel(item)}
              </Link>
            )
          })}
        </nav>

        {/* Bottom profile row */}
        {profile && (
          <div className="pt-4 border-t border-[#D8E9E3] px-1 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white shadow-[0_2px_8px_rgba(22,50,58,0.08)] flex items-center justify-center overflow-hidden shrink-0">
              {profile.avatar ? (
                <Image src={profile.avatar} alt="" width={32} height={32} className="object-cover w-full h-full" />
              ) : (
                <span className="text-[#16323A] text-xs font-extrabold">
                  {profile.display_name?.[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <div className="text-[#16323A] text-[13px] font-bold truncate">{profile.display_name}</div>
              <div className="text-[11px] font-medium text-[#7C9995]">{gradeLabel}</div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile bottom bar (below lg) — same light surface */}
      <nav
        dir={dir}
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex items-stretch justify-around bg-white border-t border-[#E4EDE9] px-1 pt-1.5"
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
              <NavIcon
                name={item.key}
                className={cn('w-5 h-5', active ? 'text-[#FF6E52]' : 'text-[#9BB5B1]')}
              />
              <span
                className={cn(
                  'text-[10px] font-semibold leading-none',
                  active ? 'text-[#FF6E52]' : 'text-[#9BB5B1]'
                )}
              >
                {getLabel(item)}
              </span>
              {active && (
                <span className="absolute -top-0.5 w-8 h-[3px] rounded-full bg-[#FF6E52]" />
              )}
            </Link>
          )
        })}
      </nav>
    </>
  )
}