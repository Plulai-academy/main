// File: DashboardNav.tsx
// Placement: components/layout/DashboardNav.tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from '@/lib/supabase/queries'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/openrouter'
import { BRAND } from  
import {
  HomeIcon, PathIcon, CoachIcon, ChallengesIcon, ShopIcon,
  BadgesIcon, LeaderboardIcon, SettingsIcon, CoinIcon, PricingIcon, SignOutIcon,
} from '@/components/brand/NavIcons'

const NAV_ITEMS = [
  { href:'/dashboard',             Icon: HomeIcon,        en:'Home',         ar:'الرئيسية',       fr:'Accueil'      },
  { href:'/dashboard/skills',      Icon: PathIcon,        en:'Skill Tree',   ar:'شجرة المهارات', fr:'Compétences'  },
  { href:'/dashboard/coach',       Icon: CoachIcon,       en:'AI Coach',     ar:'المدرب الذكي',   fr:'Coach IA'     },
  { href:'/dashboard/challenges',  Icon: ChallengesIcon,  en:'Challenges',   ar:'التحديات',       fr:'Défis'        },
  { href:'/dashboard/shop',        Icon: ShopIcon,         en:'Shop',         ar:'المتجر',         fr:'Boutique'     },
  { href:'/dashboard/badges',      Icon: BadgesIcon,       en:'Badges',       ar:'الشارات',        fr:'Badges'       },
  { href:'/dashboard/leaderboard', Icon: LeaderboardIcon,  en:'Leaderboard',  ar:'المتصدرون',      fr:'Classement'   },
  { href:'/dashboard/settings',    Icon: SettingsIcon,     en:'Settings',     ar:'الإعدادات',      fr:'Paramètres'   },
]

interface Props {
  profile: { display_name: string; avatar: string; age: number; preferred_language?: string } | null
  userId:  string
  balance?: number | null
}

export default function DashboardNav({ profile, userId, balance }: Props) {
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

  const balanceLabel =
    lang === 'ar' ? 'الرصيد' : lang === 'fr' ? 'Solde' : 'Balance'
  const signOutLabel =
    lang === 'ar' ? 'تسجيل الخروج' : lang === 'fr' ? 'Déconnexion' : 'Sign out'

  return (
    <aside
      dir={dir}
      className="w-20 lg:w-64 flex-shrink-0 fixed inset-y-0 left-0 z-40 flex flex-col py-6 px-3 lg:px-5"
      style={{
        background: 'rgba(13,43,50,0.92)',
        backdropFilter: 'blur(12px)',
        borderRight: `1px solid ${BRAND.reef}1a`, // ~10% opacity hairline
      }}
    >
      {/* Logo — brand mark, not an image asset */}
      <div className="mb-6 flex justify-center items-center px-2">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg"
          style={{ background: '#123A42', color: BRAND.gold }}
        >
          /
        </div>
      </div>

      {/* Profile mini + Wallet balance */}
      {profile && (
        <div className="flex items-center gap-3 mb-8 px-2">
          <div
            className="text-2xl rounded-2xl w-11 h-11 flex items-center justify-center flex-shrink-0"
            style={{ background: '#123A42', border: `1px solid ${BRAND.gold}40` }}
          >
            {profile.avatar}
          </div>
          <div className="hidden lg:block min-w-0 flex-1">
            <div className="font-black text-sm truncate text-white">{profile.display_name}</div>
            <div className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {lang === 'ar' ? `عمر ${profile.age}` : lang === 'fr' ? `${profile.age} ans` : `Age ${profile.age}`}
            </div>
          </div>

          {/* Balance badge — collapsed sidebar: icon + number only */}
          {balance != null && (
            <div
              className="lg:hidden flex items-center justify-center gap-1 rounded-xl w-11 h-7 text-xs font-black shrink-0"
              style={{ background: `${BRAND.sungold}1a`, border: `1px solid ${BRAND.sungold}4d`, color: BRAND.sungold }}
              title={`${balanceLabel}: ${balance}`}
            >
              <CoinIcon className="w-3.5 h-3.5" />
              <span className="text-[10px] leading-none">{balance > 999 ? '999+' : balance}</span>
            </div>
          )}
        </div>
      )}

      {/* Wallet balance row — expanded sidebar only */}
      {balance != null && (
        <Link
          href="/dashboard/shop"
          className="hidden lg:flex items-center gap-2 mx-2 mb-5 px-3 py-2 rounded-2xl transition-all group"
          style={{ background: `${BRAND.sungold}14`, border: `1px solid ${BRAND.sungold}30` }}
        >
          <CoinIcon className="w-4.5 h-4.5" style={{ color: BRAND.sungold }} />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wide leading-none mb-0.5"
              style={{ color: `${BRAND.sungold}99` }}>
              {balanceLabel}
            </div>
            <div className="font-black text-sm leading-none" style={{ color: BRAND.sungold }}>
              {balance.toLocaleString()}
            </div>
          </div>
          <svg className="w-3.5 h-3.5 shrink-0 transition-colors" viewBox="0 0 16 16" fill="none"
            stroke={BRAND.sungold} strokeWidth="2" style={{ opacity: 0.4 }}>
            <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      )}

      {/* Nav items */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-3 rounded-2xl font-bold text-sm transition-all"
              style={{
                background: active ? `${BRAND.gold}26` : 'transparent',
                color: active ? BRAND.gold : 'rgba(255,255,255,0.45)',
                border: active ? `1px solid ${BRAND.gold}40` : '1px solid transparent',
              }}
            >
              <item.Icon className={cn('w-5 h-5 flex-shrink-0', active ? 'opacity-100' : 'opacity-60')} />
              <span className="hidden lg:block">{getLabel(item)}</span>
            </Link>
          )
        })}
      </nav>

      {/* Pricing link */}
      <Link
        href="/pricing"
        className="hidden lg:flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all mt-2 mb-1"
        style={{ color: BRAND.reef, background: `${BRAND.reef}14`, border: `1px solid ${BRAND.reef}33` }}
      >
        <PricingIcon className="w-4 h-4 opacity-80" />
        {lang === 'ar' ? 'الخطط والأسعار' : lang === 'fr' ? 'Abonnements' : 'Plans & Pricing'}
      </Link>

      {/* Sign out — was defined but never rendered in the original file */}
      <button
        onClick={handleSignOut}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all"
        style={{ color: 'rgba(255,255,255,0.35)' }}
      >
        <SignOutIcon className="w-4 h-4" />
        <span className="hidden lg:block">{signOutLabel}</span>
      </button>
    </aside>
  )
}