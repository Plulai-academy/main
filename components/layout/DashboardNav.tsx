'use client'
// components/layout/DashboardNav.tsx
//
// REDESIGN v4 — matches the reference mock: deep-teal sidebar, white logo,
// big teal "pill" for the active item, 3D PNG icons, wave at the bottom.
// Same props as before (profile, userId, balance) and the same
// language / RTL logic.
//
// ICONS: put the PNGs in /public/icons/ (nav-home.png, nav-adventure.png,
// nav-projects.png, nav-tasks.png, nav-ai-coach.png, nav-rewards.png).
// Change ICON_BASE below if you keep them elsewhere.
//
// ROUTES: Home / Adventure / Tasks / AI Coach / Profile use your existing
// routes. Projects and Rewards are NEW entries in this mock, so check the
// two hrefs marked "CHECK" below point to real pages.
//
// LOGO: the sidebar is dark, so /logo.png is turned white with a CSS
// filter. If you have a white version, set LOGO_LIGHT and remove the filter.
//
// `balance` is no longer shown here (gems moved to the dashboard header,
// like in the mock) but the prop is kept so existing callers don't break.

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/openrouter'

const ICON_BASE  = '/icons'
const LOGO_LIGHT = '/logo.png'

const NAV_ITEMS = [
  { key:'home',      href:'/dashboard',             icon:'nav-home.png',      en:'Home',      ar:'الرئيسية',     fr:'Accueil'      },
  { key:'adventure', href:'/dashboard/path',        icon:'nav-adventure.png', en:'Adventure', ar:'المغامرة',     fr:'Aventure'     },
  { key:'projects',  href:'/dashboard/projects',    icon:'nav-projects.png',  en:'Projects',  ar:'المشاريع',     fr:'Projets'      }, // CHECK
  { key:'tasks',     href:'/dashboard/assignments', icon:'nav-tasks.png',     en:'Tasks',     ar:'المهام',       fr:'Tâches'       },
  { key:'coach',     href:'/dashboard/ai-tutor',    icon:'nav-ai-coach.png',  en:'AI Coach',  ar:'المدرب الذكي', fr:'Coach IA'     },
  { key:'rewards',   href:'/dashboard/shop',        icon:'nav-rewards.png',   en:'Rewards',   ar:'المكافآت',     fr:'Récompenses'  }, // CHECK
] as const

interface Props {
  profile: { display_name: string; avatar: string; age: number; preferred_language?: string } | null
  userId:  string
  balance?: number | null
}

export default function DashboardNav({ profile }: Props) {
  const pathname = usePathname()
  const lang     = (profile?.preferred_language ?? 'en') as Language
  const dir      = lang === 'ar' ? 'rtl' : 'ltr'

  const getLabel = (item: typeof NAV_ITEMS[number]) =>
    lang === 'ar' ? item.ar : lang === 'fr' ? item.fr : item.en

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  const gradeLabel =
    lang === 'ar' ? `عمر ${profile?.age}` : lang === 'fr' ? `${profile?.age} ans` : `Age ${profile?.age}`
  const profileLabel = lang === 'ar' ? 'الملف الشخصي' : lang === 'fr' ? 'Profil' : 'Profile'
  const menuLabel = lang === 'ar' ? 'القائمة الرئيسية' : lang === 'fr' ? 'Navigation principale' : 'Main navigation'
  const profileActive = isActive('/dashboard/profile')

  return (
    <>
      {/* ============ Desktop sidebar ============ */}
      <aside
        dir={dir}
        className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-shrink-0 flex-col overflow-hidden bg-gradient-to-b from-[#0B5059] to-[#073E47] px-5 pb-6 pt-8 text-white"
      >
        {/* soft wave decoration, bottom */}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 w-full opacity-[0.16]"
          viewBox="0 0 256 220"
          preserveAspectRatio="none"
          style={{ height: 220 }}
        >
          <path d="M0 110 C 50 60, 100 70, 150 105 S 230 150, 256 120 L256 220 L0 220 Z" fill="#2DD4BF" />
        </svg>

        <Link
          href="/dashboard"
          aria-label="Plulai"
          className="relative z-10 mb-10 ms-1.5 flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <Image src={LOGO_LIGHT} alt="Plulai" width={140} height={40} priority className="h-10 w-auto brightness-0 invert" />
        </Link>

        <nav aria-label={menuLabel} className="relative z-10 flex flex-col gap-1.5">
          {NAV_ITEMS.map(item => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-4 rounded-2xl px-4 py-3 text-[17px] font-bold transition-all',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
                  active
                    ? 'bg-gradient-to-r from-[#22D3BE] to-[#14B8A6] text-white shadow-[0_10px_24px_rgba(20,184,166,0.38)]'
                    : 'text-white/90 hover:bg-white/10'
                )}
              >
                <Image
                  src={`${ICON_BASE}/${item.icon}`}
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7 shrink-0 object-contain"
                />
                <span className="truncate">{getLabel(item)}</span>
              </Link>
            )
          })}
        </nav>

        <div className="flex-1" />

        {/* Profile link, sits over the wave */}
        {profile && (
          <Link
            href="/dashboard/profile"
            aria-current={profileActive ? 'page' : undefined}
            className={cn(
              'relative z-10 flex items-center gap-3 rounded-2xl p-2.5 transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
              profileActive ? 'bg-white/20' : 'bg-white/10 hover:bg-white/15'
            )}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/90 ring-2 ring-white/40">
              {profile.avatar ? (
                <Image src={profile.avatar} alt="" width={40} height={40} className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-extrabold text-[#0B3B44]">{profile.display_name?.[0]?.toUpperCase()}</span>
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-extrabold">{profile.display_name}</span>
              <span className="block text-[12px] font-semibold text-white/70">{profileLabel} · {gradeLabel}</span>
            </span>
          </Link>
        )}
      </aside>

      {/* ============ Mobile bottom bar ============ */}
      <nav
        dir={dir}
        aria-label={menuLabel}
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex items-stretch justify-around rounded-t-3xl bg-[#073E47] px-1.5 pt-1.5 shadow-[0_-10px_28px_rgba(7,62,71,0.35)]"
        style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
      >
        {NAV_ITEMS.map(item => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <span
                className={cn(
                  'grid h-8 w-11 place-items-center rounded-full transition-colors',
                  active ? 'bg-gradient-to-r from-[#22D3BE] to-[#14B8A6]' : ''
                )}
              >
                <Image src={`${ICON_BASE}/${item.icon}`} alt="" width={24} height={24} className="h-6 w-6 object-contain" />
              </span>
              <span className={cn('max-w-full truncate text-[10px] font-bold leading-none', active ? 'text-white' : 'text-white/65')}>
                {getLabel(item)}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}