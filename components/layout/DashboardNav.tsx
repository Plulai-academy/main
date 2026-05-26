'use client'
// components/layout/DashboardNav.tsx
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from '@/lib/supabase/queries'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/openrouter'

const NAV_ITEMS = [
  { href:'/dashboard',             icon:'/icons/home.png',        en:'Home',         ar:'الرئيسية',       fr:'Accueil'      },
  { href:'/dashboard/skills',      icon:'/icons/skill-tree.png',  en:'Skill Tree',   ar:'شجرة المهارات', fr:'Compétences'  },
  { href:'/dashboard/coach',       icon:'/icons/coach.png',       en:'AI Coach',     ar:'المدرب الذكي',   fr:'Coach IA'     },
  { href:'/dashboard/challenges',  icon:'/icons/challenges.png',  en:'Challenges',   ar:'التحديات',       fr:'Défis'        },
  { href:'/dashboard/streak',      icon:'/icons/streak.png',      en:'Streak',       ar:'السلسلة',        fr:'Série'        },
  { href:'/dashboard/badges',      icon:'/icons/badges.png',      en:'Badges',       ar:'الشارات',        fr:'Badges'       },
  { href:'/dashboard/leaderboard', icon:'/icons/leaderboard.png', en:'Leaderboard',  ar:'المتصدرون',      fr:'Classement'   },
  { href:'/dashboard/settings',    icon:'/icons/settings.png',    en:'Settings',     ar:'الإعدادات',      fr:'Paramètres'   },
]

interface Props {
  profile: { display_name: string; avatar: string; age: number; preferred_language?: string } | null
  userId:  string
}

export default function DashboardNav({ profile, userId }: Props) {
  const pathname = usePathname()
  const router   = useRouter()
  const lang     = (profile?.preferred_language ?? 'en') as Language
  const dir      = lang === 'ar' ? 'rtl' : 'ltr'

  const getLabel = (item: typeof NAV_ITEMS[0]) =>
    lang === 'ar' ? item.ar : lang === 'fr' ? item.fr : item.en

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside
      dir={dir}
      className="w-20 lg:w-64 flex-shrink-0 fixed inset-y-0 left-0 z-40 flex flex-col glass border-r border-white/5 py-6 px-3 lg:px-5"
    >
      {/* Logo */}
      {/* <div className="mb-8 flex items-center gap-3 px-2">
        <img src="/icons/plulai.png" alt="Plulai" className="w-10 h-10" />
         <span className="hidden lg:block font-fredoka text-xl bg-gradient-to-r from-accent2 to-accent1 bg-clip-text text-transparent">
          Plulai
        </span> 
      </div> */}

      {/* Logo */}
      <div className="mb-6 flex justify-center items-center px-2">
        <img 
          src="/icons/plulai.png" 
          alt="Plulai" 
          className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" 
        />
        {/* <span className="hidden lg:block font-fredoka text-xl bg-gradient-to-r from-accent2 to-accent1 bg-clip-text text-transparent">
          Plulai
        </span> */}
      </div>

      {/* Profile mini */}
      {profile && (
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="text-3xl bg-card2 rounded-2xl w-11 h-11 flex items-center justify-center flex-shrink-0 border border-white/10">
            {profile.avatar}
          </div>
          <div className="hidden lg:block min-w-0">
            <div className="font-extrabold text-sm truncate">{profile.display_name}</div>
            <div className="text-muted text-xs font-bold">
              {lang === 'ar' ? `عمر ${profile.age}` : lang === 'fr' ? `${profile.age} ans` : `Age ${profile.age}`}
            </div>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-3 rounded-2xl font-bold text-sm transition-all',
              pathname === item.href
                ? 'bg-accent4/15 text-accent4 border border-accent4/25'
                : 'text-muted hover:bg-card2 hover:text-white'
            )}
          >
            <img
              src={item.icon}
              alt={item.en}
              className={cn(
                'w-5 h-5 flex-shrink-0',
                pathname === item.href ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'
              )}
            />
            <span className="hidden lg:block">{getLabel(item)}</span>
          </Link>
        ))}
      </nav>

      {/* Pricing link */}
      <Link
        href="/pricing"
        className="hidden lg:flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-accent2 bg-accent2/8 border border-accent2/20 hover:bg-accent2/15 transition-all mt-2 mb-1"
      >
        <img src="/icons/pricing.png" alt="Pricing" className="w-4 h-4 opacity-80" />
        {lang === 'ar' ? 'الخطط والأسعار' : lang === 'fr' ? 'Abonnements' : 'Plans & Pricing'}
      </Link>

      {/* Sign out */}
      {/* <button
        onClick={handleSignOut}
        className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl text-muted hover:text-accent1 text-xs font-bold transition-all"
      >
        <img src="/icons/signout.svg" alt="Sign out" className="w-4 h-4 opacity-60" />
        {lang === 'ar' ? 'تسجيل الخروج' : lang === 'fr' ? 'Se déconnecter' : 'Sign Out'}
      </button> */}
    </aside>
  )
}