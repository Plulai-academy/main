'use client'
// components/layout/DashboardNav.tsx
//
// REDESIGN v3 — a structural rethink, not another recolor. v1 and v2 were
// both "a rectangular panel full of list items" with different paint.
// This version treats navigation as a floating object on the page rather
// than a panel bolted to its edge:
//   - Icon-only dock, vertically centered, generously spaced — no text
//     labels sitting in a list. Labels appear as a tooltip on hover
//     (desktop) and stay visible under the icon (mobile), so nothing is
//     less discoverable, it's just not the default visual weight.
//   - The mascot is a genuine floating brand mark ABOVE the dock, not a
//     logo squeezed into a header row inside it.
//   - The active item doesn't get a background rectangle — it scales up
//     and glows, like a pressed button on a game console, not a
//     selected table row.
//   - Gem balance and profile avatar are their own small floating
//     circles below the dock, continuing the same "constellation of
//     floating objects" language instead of being crammed into the
//     same panel.
//
// IMPORTANT structural note: the outer <aside> keeps the exact same
// footprint as before (w-64, fixed inset-y-0 left-0) even though the
// dock itself is much narrower. This is deliberate — your app layout
// almost certainly reserves that width elsewhere (e.g. `lg:pl-64` on
// the main content wrapper), and I don't have that file to update. If
// you DO want the reserved width to shrink to match the slimmer dock,
// tell me and I'll adjust both — but that requires touching whatever
// file currently offsets the main content.

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
    <svg className={className} width={16} height={16} viewBox="0 0 20 20" fill="none">
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
  const tooltipSide = dir === 'rtl' ? 'right-full mr-3' : 'left-full ml-3'

  const getLabel = (item: typeof NAV_ITEMS[number]) =>
    lang === 'ar' ? item.ar : lang === 'fr' ? item.fr : item.en

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  return (
    <>
      {/* Desktop: floating icon dock, vertically centered.
          Outer footprint unchanged (w-64, inset-y-0, left-0) — see note
          above. Inner content is a narrow floating composition. */}
      <aside
        dir={dir}
        className="hidden lg:flex w-64 flex-shrink-0 fixed inset-y-0 left-0 z-40 flex-col items-center justify-center bg-[#EAF6F1] py-10"
      >
        {/* Brand mark — floats above the dock, not inside it */}
        <Link href="/dashboard" className="mb-6 flex flex-col items-center gap-1.5 group">
          <div className="w-12 h-12 rounded-full bg-white shadow-[0_6px_18px_rgba(22,50,58,0.12)] flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
            <Image src="/avatars/marjanthecamel.png" alt="Plulai" width={34} height={34} className="object-contain" />
          </div>
        </Link>

        {/* The dock itself */}
        <nav className="flex flex-col items-center gap-2 bg-white rounded-[28px] shadow-[0_10px_30px_rgba(22,50,58,0.1)] py-4 px-2.5">
          {NAV_ITEMS.map(item => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={getLabel(item)}
                className="relative group flex items-center justify-center"
              >
                <span
                  className={cn(
                    'flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200',
                    active ? 'scale-[1.12]' : 'hover:bg-[#F1F5F4]'
                  )}
                  style={active ? { background: '#FF6E52', boxShadow: '0 6px 16px rgba(255,110,82,0.4)' } : undefined}
                >
                  <NavIcon
                    name={item.key}
                    className={cn('w-[20px] h-[20px]', active ? 'text-white' : 'text-[#7C9995]')}
                  />
                </span>

                {/* Tooltip label on hover — keeps icon-only dock discoverable */}
                <span
                  className={cn(
                    'absolute top-1/2 -translate-y-1/2 whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-bold text-white',
                    'bg-[#16323A] opacity-0 scale-95 pointer-events-none transition-all duration-150',
                    'group-hover:opacity-100 group-hover:scale-100',
                    tooltipSide
                  )}
                >
                  {getLabel(item)}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* Gem balance — its own small floating circle */}
        {balance != null && (
          <Link
            href="/dashboard/shop"
            aria-label="Shop"
            className="relative group mt-5 flex items-center justify-center w-11 h-11 rounded-full bg-white shadow-[0_6px_16px_rgba(22,50,58,0.1)] hover:scale-105 transition-transform"
          >
            <GemIcon />
            <span className="absolute -bottom-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#7C6FFF] text-white text-[9px] font-extrabold flex items-center justify-center">
              {balance > 99 ? '99+' : balance}
            </span>
            <span
              className={cn(
                'absolute top-1/2 -translate-y-1/2 whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-bold text-white',
                'bg-[#16323A] opacity-0 scale-95 pointer-events-none transition-all duration-150',
                'group-hover:opacity-100 group-hover:scale-100',
                tooltipSide
              )}
            >
              Shop
            </span>
          </Link>
        )}

        {/* Profile avatar — its own small floating circle */}
        {profile && (
          <Link
            href="/dashboard/profile"
            aria-label={profile.display_name}
            className="mt-3 w-11 h-11 rounded-full bg-white shadow-[0_6px_16px_rgba(22,50,58,0.1)] flex items-center justify-center overflow-hidden hover:scale-105 transition-transform"
          >
            {profile.avatar ? (
              <Image src={profile.avatar} alt="" width={44} height={44} className="object-cover w-full h-full" />
            ) : (
              <span className="text-[#16323A] text-sm font-extrabold">
                {profile.display_name?.[0]?.toUpperCase()}
              </span>
            )}
          </Link>
        )}
      </aside>

      {/* Mobile: floating bottom dock — lifted off the screen edge with
          margin, rounded full capsule, not a flat edge-to-edge bar. */}
      <nav
        dir={dir}
        className="lg:hidden fixed bottom-4 inset-x-4 z-40 flex items-center justify-around bg-white rounded-full shadow-[0_10px_30px_rgba(22,50,58,0.14)] px-2 py-2"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      >
        {NAV_ITEMS.map(item => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={getLabel(item)}
              className="flex-1 flex items-center justify-center py-1.5"
            >
              <span
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200',
                  active ? 'scale-110' : ''
                )}
                style={active ? { background: '#FF6E52', boxShadow: '0 4px 12px rgba(255,110,82,0.4)' } : undefined}
              >
                <NavIcon
                  name={item.key}
                  className={cn('w-[19px] h-[19px]', active ? 'text-white' : 'text-[#9BB5B1]')}
                />
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}