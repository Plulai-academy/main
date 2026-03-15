'use client'
// components/dashboard/LeaderboardClient.tsx
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/openrouter'

const GCC_FLAGS: Record<string, string> = {
  AE:'🇦🇪', SA:'🇸🇦', QA:'🇶🇦', KW:'🇰🇼', BH:'🇧🇭', OM:'🇴🇲'
}
const COUNTRY_NAMES: Record<string, Record<Language, string>> = {
  AE:{ en:'UAE',          ar:'الإمارات',        fr:'EAU'           },
  SA:{ en:'Saudi Arabia', ar:'السعودية',         fr:'Arabie Saoudite'},
  QA:{ en:'Qatar',        ar:'قطر',              fr:'Qatar'         },
  KW:{ en:'Kuwait',       ar:'الكويت',           fr:'Koweït'        },
  BH:{ en:'Bahrain',      ar:'البحرين',          fr:'Bahreïn'       },
  OM:{ en:'Oman',         ar:'عُمان',            fr:'Oman'          },
}
const MEDAL = ['🥇','🥈','🥉']
const AGE_LABELS: Record<string, Record<Language, string>> = {
  mini:   { en:'Mini',   ar:'مبتدئ', fr:'Mini'   },
  junior: { en:'Junior', ar:'ناشئ',  fr:'Junior' },
  pro:    { en:'Pro',    ar:'محترف', fr:'Pro'    },
  expert: { en:'Expert', ar:'خبير',  fr:'Expert' },
}
const UI: Record<Language, Record<string, string>> = {
  en: { title:'🏆 Leaderboard', yourRank:'Your Rank', xp:'XP', lessons:'lessons', streak:'day streak', global:'Global', gcc:'GCC', noData:'No data yet — complete lessons to climb the leaderboard!' },
  ar: { title:'🏆 لوحة المتصدرين', yourRank:'ترتيبك', xp:'XP', lessons:'دروس', streak:'يوم متتالي', global:'عالمي', gcc:'دول الخليج', noData:'لا توجد بيانات بعد — أكمل دروساً للصعود في القائمة!' },
  fr: { title:'🏆 Classement', yourRank:'Ton classement', xp:'XP', lessons:'leçons', streak:'jours de suite', global:'Mondial', gcc:'CCG', noData:'Pas encore de données — complète des leçons pour grimper dans le classement !' },
}

interface Row {
  id: string; display_name: string; avatar: string; country: string; age_group: string
  xp: number; level: number; streak: number; lessons_count: number; badges_count: number
  rank_global: number; rank_country: number
}

interface Props {
  userId:      string
  userCountry: string
  ageGroup:    string
  language:    string
  globalRows:  Row[]
  gccRows:     Row[]
  myRank:      Row | null
}

export default function LeaderboardClient({ userId, userCountry, language, globalRows, gccRows, myRank }: Props) {
  const lang = (language ?? 'en') as Language
  const t    = UI[lang]
  const dir  = lang === 'ar' ? 'rtl' : 'ltr'
  const [tab, setTab] = useState<'global'|'gcc'>('gcc')

  const rows = tab === 'global' ? globalRows : gccRows

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-3xl" dir={dir}>
      <h1 className="font-fredoka text-2xl md:text-3xl lg:text-4xl mb-4 md:mb-5">{t.title}</h1>

      {/* My rank card */}
      {myRank && (
        <div className="bg-gradient-to-r from-accent2/10 to-accent4/10 border border-accent2/20 rounded-3xl p-4 md:p-5 mb-5 md:mb-7">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="text-2xl w-10 h-10 md:w-12 md:h-12 bg-card2 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
              {myRank.avatar}
            </div>

            {/* Rank info — wraps on very small screens */}
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-xs md:text-sm mb-0.5">{t.yourRank}</div>
              <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                <span className="font-fredoka text-xl md:text-2xl text-accent2">#{myRank.rank_global}</span>
                <span className="text-muted text-xs font-bold">{myRank.xp} {t.xp}</span>
                <span className="text-muted text-xs font-bold hidden sm:inline">{myRank.lessons_count} {t.lessons}</span>
                <span className="text-muted text-xs font-bold hidden sm:inline">{myRank.streak} {t.streak}</span>
              </div>
              {/* Show hidden stats on xs below the rank row */}
              <div className="flex items-center gap-2 mt-0.5 sm:hidden">
                <span className="text-muted text-xs font-bold">{myRank.lessons_count} {t.lessons}</span>
                <span className="text-muted text-xs font-bold">{myRank.streak} {t.streak}</span>
              </div>
            </div>

            <div className="text-xl md:text-2xl shrink-0">{GCC_FLAGS[myRank.country] ?? '🌍'}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-5 md:mb-6 bg-card rounded-2xl p-1.5 border border-white/5">
        {(['gcc','global'] as const).map(tabKey => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={cn(
              'flex-1 py-2.5 md:py-3 rounded-xl font-extrabold text-sm transition-all touch-manipulation',
              tab === tabKey ? 'bg-accent4/15 text-accent4 border border-accent4/25' : 'text-muted hover:text-white'
            )}
          >
            {tabKey === 'gcc' ? `🌍 ${t.gcc}` : `🌐 ${t.global}`}
          </button>
        ))}
      </div>

      {/* Rows */}
      {rows.length === 0 ? (
        <div className="text-center py-16 text-muted font-semibold text-sm">{t.noData}</div>
      ) : (
        <div className="space-y-2 md:space-y-3">
          {rows.map((row, idx) => {
            const isMe  = row.id === userId
            const rank  = tab === 'global' ? row.rank_global : idx + 1
            const medal = MEDAL[rank - 1]

            return (
              <div
                key={row.id}
                className={cn(
                  'flex items-center gap-2.5 md:gap-4 p-3 md:p-4 rounded-2xl border transition-all',
                  isMe
                    ? 'bg-accent4/10 border-accent4/30 shadow-[0_0_20px_rgba(77,150,255,0.15)]'
                    : 'bg-card border-white/5 hover:border-white/10'
                )}
              >
                {/* Rank — compact on mobile */}
                <div className="w-7 md:w-10 shrink-0 text-center">
                  {medal ? (
                    <span className="text-xl md:text-2xl">{medal}</span>
                  ) : (
                    <span className="font-fredoka text-sm md:text-lg text-muted">#{rank}</span>
                  )}
                </div>

                {/* Avatar + country flag overlay */}
                <div className="relative shrink-0">
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-card2 border border-white/10 flex items-center justify-center text-lg md:text-xl">
                    {row.avatar}
                  </div>
                  <div className="absolute -bottom-1 -right-1 text-xs leading-none">
                    {GCC_FLAGS[row.country] ?? '🌍'}
                  </div>
                </div>

                {/* Name + stats */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                    <span className="font-extrabold text-xs md:text-sm truncate">
                      {row.display_name}{isMe && ' 👈'}
                    </span>
                    {/* Age badge — hidden on smallest screens to save space */}
                    <span className="hidden xs:inline text-xs font-bold text-muted bg-card2 border border-white/8 rounded-full px-2 py-0.5">
                      {AGE_LABELS[row.age_group]?.[lang] ?? row.age_group}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs font-bold text-accent2">{row.xp} {t.xp}</span>
                    {/* Lesson count hidden on mobile — level badge already summarises progress */}
                    <span className="hidden sm:inline text-xs text-muted font-bold">{row.lessons_count} {t.lessons}</span>
                    {row.streak > 0 && <span className="text-xs text-accent1 font-bold">🔥 {row.streak}</span>}
                  </div>
                </div>

                {/* Level badge — always visible, compact on mobile */}
                <div className="shrink-0 bg-card2 border border-white/10 rounded-xl px-2 md:px-3 py-1 md:py-1.5 text-center">
                  <div className="font-fredoka text-base md:text-lg text-white leading-none">Lv.{row.level}</div>
                  <div className="text-xs text-muted font-bold mt-0.5">{row.badges_count} 🏆</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}