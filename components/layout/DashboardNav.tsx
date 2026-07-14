'use client'
// components/layout/DashboardNav.tsx
import Link from 'next/link'
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

// Minimal inline icons — only used in the mobile bottom bar
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
        className="hidden lg:flex w-64 flex-shrink-0 fixed inset-y-0 left-0 z-40 flex-col bg-[#0F1E21] border-r border-white/[0.06] py-7 px-5"
      >
        {/* Logo */}
        <div className="mb-9 flex items-center gap-2.5 px-1">
          <span className="w-3 h-3 rounded-full bg-amber-400 flex-shrink-0 shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
          <span className="text-white font-extrabold text-xl tracking-tight">Plulai</span>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map(item => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2.5 rounded-xl font-semibold text-[15px] transition-all',
                  active
                    ? 'bg-white/[0.08] text-white'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                )}
              >
                {getLabel(item)}
              </Link>
            )
          })}
        </nav>

        {/* Bottom caption */}
        {profile && (
          <div className="pt-5 border-t border-white/[0.06] px-1">
            <div className="text-[11px] font-mono uppercase tracking-widest text-slate-600">
              {gradeLabel} · {profile.display_name}
            </div>
          </div>
        )}
      </aside>

      {/* Mobile bottom bar (below lg) */}
      <nav
        dir={dir}
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex items-stretch justify-around bg-[#0F1E21] border-t border-white/[0.06] px-1 pt-1.5"
        style={{ paddingBottom: 'max(6px, env(safe-area-inset-bottom))' }}
      >
        {NAV_ITEMS.map(item => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl"
            >
              <NavIcon
                name={item.key}
                className={cn('w-5 h-5', active ? 'text-white' : 'text-slate-500')}
              />
              <span
                className={cn(
                  'text-[10px] font-semibold leading-none',
                  active ? 'text-white' : 'text-slate-500'
                )}
              >
                {getLabel(item)}
              </span>
              {active && (
                <span className="absolute -top-1 w-8 h-[3px] rounded-full bg-amber-400" />
              )}
            </Link>
          )
        })}
      </nav>
    </>
  )
}