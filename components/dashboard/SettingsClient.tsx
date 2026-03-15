'use client'
// components/dashboard/SettingsClient.tsx
import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { upsertProfile, updateUserLanguage } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const AVATARS = ['🧑‍🚀','👩‍💻','🧑‍🎨','👩‍🔬','🦸','🧙','🤖','🦊','🐉','🦄','🐱','🐸','🦁','🐯','🦋','🌟','🔥','💎','🎮','🎯']

const COUNTRIES = [
  { code:'AE', flag:'🇦🇪', name:'UAE',          nameAr:'الإمارات',          nameFr:'Émirats'          },
  { code:'SA', flag:'🇸🇦', name:'Saudi Arabia',  nameAr:'السعودية',          nameFr:'Arabie Saoudite'  },
  { code:'KW', flag:'🇰🇼', name:'Kuwait',        nameAr:'الكويت',            nameFr:'Koweït'           },
  { code:'QA', flag:'🇶🇦', name:'Qatar',         nameAr:'قطر',               nameFr:'Qatar'            },
  { code:'BH', flag:'🇧🇭', name:'Bahrain',       nameAr:'البحرين',           nameFr:'Bahreïn'          },
  { code:'OM', flag:'🇴🇲', name:'Oman',          nameAr:'عُمان',             nameFr:'Oman'             },
  { code:'EG', flag:'🇪🇬', name:'Egypt',         nameAr:'مصر',               nameFr:'Égypte'           },
  { code:'MA', flag:'🇲🇦', name:'Morocco',       nameAr:'المغرب',            nameFr:'Maroc'            },
  { code:'FR', flag:'🇫🇷', name:'France',        nameAr:'فرنسا',             nameFr:'France'           },
  { code:'GB', flag:'🇬🇧', name:'UK',            nameAr:'المملكة المتحدة',   nameFr:'Royaume-Uni'      },
  { code:'US', flag:'🇺🇸', name:'USA',           nameAr:'الولايات المتحدة',  nameFr:'États-Unis'       },
  { code:'OTHER', flag:'🌍', name:'Other',       nameAr:'أخرى',              nameFr:'Autre'            },
]

const INTERESTS_LIST = [
  { id:'coding',           emoji:'💻', en:'Coding',           ar:'البرمجة',            fr:'Programmation'   },
  { id:'ai',               emoji:'🧠', en:'AI',               ar:'الذكاء الاصطناعي',  fr:'IA'              },
  { id:'games',            emoji:'🎮', en:'Game Design',       ar:'تصميم الألعاب',     fr:'Jeux'            },
  { id:'entrepreneurship', emoji:'💡', en:'Entrepreneurship',  ar:'ريادة الأعمال',     fr:'Entrepreneuriat' },
  { id:'art',              emoji:'🎨', en:'Digital Art',       ar:'الفن الرقمي',       fr:'Art numérique'   },
  { id:'robots',           emoji:'🤖', en:'Robotics',          ar:'الروبوتات',         fr:'Robotique'       },
]

const UI: Record<string, Record<string, string>> = {
  en: {
    title: 'Settings', profile: 'Profile', avatar: 'Choose Your Avatar',
    name: 'Display Name', age: 'Age', country: 'Country', language: 'Language',
    interests: 'My Interests', dream: 'Dream Project', parent: 'Parent Email',
    parentHint: 'Optional — parents get weekly progress updates',
    save: 'Save Changes', saving: 'Saving...', saved: '✅ Saved!',
    danger: 'Danger Zone', signOut: 'Sign Out', account: 'Account',
    stats: 'My Stats', xp: 'Total XP', streak: 'Best Streak',
    time: 'Time Learning', lessons: 'Days learning',
    security: 'Security', changePass: 'Change Password',
    passHint: "We'll send a password reset link to your email",
    sendLink: 'Send Reset Link', linkSent: '📧 Check your email!',
  },
  ar: {
    title: 'الإعدادات', profile: 'الملف الشخصي', avatar: 'اختر صورتك الرمزية',
    name: 'الاسم المعروض', age: 'العمر', country: 'البلد', language: 'اللغة',
    interests: 'اهتماماتي', dream: 'مشروع أحلامي', parent: 'بريد ولي الأمر',
    parentHint: 'اختياري — يحصل الآباء على تحديثات تقدم أسبوعية',
    save: 'حفظ التغييرات', saving: 'جارٍ الحفظ...', saved: '✅ تم الحفظ!',
    danger: 'منطقة الخطر', signOut: 'تسجيل الخروج', account: 'الحساب',
    stats: 'إحصائياتي', xp: 'مجموع XP', streak: 'أطول سلسلة',
    time: 'وقت التعلم', lessons: 'أيام التعلم',
    security: 'الأمان', changePass: 'تغيير كلمة المرور',
    passHint: 'سنرسل رابط إعادة تعيين إلى بريدك الإلكتروني',
    sendLink: 'إرسال الرابط', linkSent: '📧 تحقق من بريدك!',
  },
  fr: {
    title: 'Paramètres', profile: 'Profil', avatar: 'Choisis ton avatar',
    name: 'Nom affiché', age: 'Âge', country: 'Pays', language: 'Langue',
    interests: 'Mes intérêts', dream: 'Projet de rêve', parent: 'Email parent',
    parentHint: 'Optionnel — les parents reçoivent des mises à jour hebdomadaires',
    save: 'Enregistrer', saving: 'Enregistrement...', saved: '✅ Enregistré !',
    danger: 'Zone dangereuse', signOut: 'Se déconnecter', account: 'Compte',
    stats: 'Mes Stats', xp: 'XP total', streak: 'Meilleure série',
    time: "Temps d'apprentissage", lessons: "Jours d'apprentissage",
    security: 'Sécurité', changePass: 'Changer le mot de passe',
    passHint: 'On enverra un lien de réinitialisation à ton email',
    sendLink: 'Envoyer le lien', linkSent: '📧 Vérifie ton email !',
  },
}

const getAgeGroup = (age: number) => age <= 8 ? 'mini' : age <= 11 ? 'junior' : age <= 14 ? 'pro' : 'expert'

// ── Notification prefs sub-component ────────────────────────
function NotificationPrefsSection({ userId, profile, lang }: { userId: string; profile: any; lang: string }) {
  const supabase = createClient()
  const [streakAlert,  setStreakAlert]  = useState(profile?.email_streak_alerts   ?? true)
  const [weeklyReport, setWeeklyReport] = useState(profile?.email_weekly_report   ?? true)
  const [trialRemind,  setTrialRemind]  = useState(profile?.email_trial_reminders ?? true)
  const [saved, setSaved] = useState(false)

  const save = async (key: string, val: boolean) => {
    await supabase.from('profiles').update({ [key]: val, updated_at: new Date().toISOString() } as any).eq('id', userId)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggle = (key: string, current: boolean, setter: (v: boolean) => void) => {
    const next = !current
    setter(next)
    save(key, next)
  }

  const labels: Record<string, Record<string, string>> = {
    en: { title: 'Email Notifications', streak: 'Streak at-risk alerts', streakDesc: "Get a nudge at 8pm if you haven't learned today", weekly: 'Weekly parent report', weeklyDesc: 'Your parent gets a progress summary every Sunday', trial: 'Trial expiry reminders', trialDesc: 'Heads up before your free trial ends' },
    ar: { title: 'إشعارات البريد الإلكتروني', streak: 'تنبيهات خطر السلسلة', streakDesc: 'تلقّ تذكيراً عند الساعة 8 مساءً إذا لم تتعلم اليوم', weekly: 'تقرير الوالدين الأسبوعي', weeklyDesc: 'يتلقى والدك ملخصاً أسبوعياً كل أحد', trial: 'تذكيرات انتهاء التجربة', trialDesc: 'تنبيه قبل انتهاء التجربة المجانية' },
    fr: { title: 'Notifications email', streak: 'Alertes série en danger', streakDesc: "Reçois un rappel à 20h si tu n'as pas appris aujourd'hui", weekly: 'Rapport hebdomadaire parent', weeklyDesc: 'Tes parents reçoivent un résumé chaque dimanche', trial: "Rappels fin d'essai", trialDesc: 'Prévenu avant la fin de ton essai gratuit' },
  }
  const l = labels[lang] ?? labels.en

  const prefs = [
    { key: 'email_streak_alerts',   label: l.streak, desc: l.streakDesc, val: streakAlert,  set: setStreakAlert  },
    { key: 'email_weekly_report',   label: l.weekly,  desc: l.weeklyDesc, val: weeklyReport, set: setWeeklyReport },
    { key: 'email_trial_reminders', label: l.trial,   desc: l.trialDesc,  val: trialRemind,  set: setTrialRemind  },
  ]

  return (
    <section className="bg-card border border-white/8 rounded-3xl p-5 md:p-6 mb-5 md:mb-6">
      <div className="flex items-center justify-between mb-4 md:mb-5">
        <h2 className="font-fredoka text-lg md:text-xl">🔔 {l.title}</h2>
        {saved && <span className="text-xs font-bold text-accent3 animate-fade-in">✅ Saved</span>}
      </div>
      <div className="space-y-4">
        {prefs.map(p => (
          <div key={p.key} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-bold text-sm mb-0.5">{p.label}</p>
              <p className="text-xs text-muted font-semibold leading-snug">{p.desc}</p>
            </div>
            {/* Toggle — adequate tap target via padding trick */}
            <button
              onClick={() => toggle(p.key, p.val, p.set)}
              className={cn(
                'relative w-12 h-6 rounded-full transition-all shrink-0 border-2 touch-manipulation',
                p.val ? 'bg-accent3 border-accent3' : 'bg-card2 border-white/15'
              )}
              aria-pressed={p.val}
            >
              <span className={cn(
                'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all',
                p.val ? (lang === 'ar' ? 'right-0.5' : 'left-6') : (lang === 'ar' ? 'right-6' : 'left-0.5')
              )} />
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Parent share sub-component ───────────────────────────────
function ParentShareSection({ hasParentEmail, lang, t }: { hasParentEmail: boolean; lang: string; t: Record<string,string> }) {
  const [loading,   setLoading]   = useState(false)
  const [magicLink, setMagicLink] = useState<string | null>(null)
  const [error,     setError]     = useState<string | null>(null)
  const [copied,    setCopied]    = useState(false)

  const generate = async () => {
    if (!hasParentEmail) return
    setLoading(true); setError(null)
    try {
      const res  = await fetch('/api/parent/token', { method: 'POST' })
      const data = await res.json()
      if (data.magicLink) setMagicLink(data.magicLink)
      else setError(data.error ?? 'Something went wrong')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const copy = () => {
    if (!magicLink) return
    navigator.clipboard.writeText(magicLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const labels: Record<string, Record<string, string>> = {
    en: { title: 'Share Progress with Parent 👨‍👩‍👧', desc: 'Generate a private link so your parent can see your progress, badges, and streaks — no login needed.', btn: 'Generate Parent Link', need: 'Add a parent email above first, then save.', link: 'Parent Dashboard Link', copy: 'Copy Link', copied: '✅ Copied!', expire: 'Link valid for 7 days' },
    ar: { title: 'شارك التقدم مع ولي الأمر 👨‍👩‍👧', desc: 'أنشئ رابطاً خاصاً لوالديك لمتابعة تقدمك وشاراتك.', btn: 'إنشاء رابط الوالدين', need: 'أضف بريد ولي الأمر أولاً.', link: 'رابط لوحة الوالدين', copy: 'نسخ الرابط', copied: '✅ تم النسخ!', expire: 'الرابط صالح 7 أيام' },
    fr: { title: 'Partager avec les parents 👨‍👩‍👧', desc: 'Génère un lien privé pour que tes parents voient ta progression — sans connexion.', btn: 'Générer le lien parent', need: "Ajoute d'abord un email parent ci-dessus.", link: 'Lien tableau de bord parent', copy: 'Copier le lien', copied: '✅ Copié !', expire: 'Lien valide 7 jours' },
  }
  const l = labels[lang] ?? labels.en

  return (
    <section className="bg-card border border-accent5/20 rounded-3xl p-5 md:p-6 mb-5 md:mb-6">
      <h2 className="font-fredoka text-lg md:text-xl mb-2">{l.title}</h2>
      <p className="text-muted text-sm font-semibold mb-4 md:mb-5 leading-relaxed">{l.desc}</p>

      {!hasParentEmail ? (
        <p className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">{l.need}</p>
      ) : !magicLink ? (
        <button
          onClick={generate}
          disabled={loading}
          className="w-full sm:w-auto px-6 py-3 rounded-xl font-extrabold text-sm bg-gradient-to-r from-accent5 to-accent1 text-white hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-50 touch-manipulation"
        >
          {loading ? '⏳ Generating...' : `🔗 ${l.btn}`}
        </button>
      ) : (
        <div className="space-y-3">
          <label className="text-xs font-bold text-muted uppercase tracking-wider block">{l.link}</label>
          {/* Magic link row — stacks on very small screens */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-card2 border border-white/10 rounded-xl px-4 py-3">
            <span className="text-xs font-mono text-accent5 flex-1 truncate">{magicLink}</span>
            <button
              onClick={copy}
              className="text-xs font-extrabold text-muted hover:text-white transition-colors shrink-0 touch-manipulation"
            >
              {copied ? l.copied : l.copy}
            </button>
          </div>
          <p className="text-xs text-muted font-semibold">⏰ {l.expire}</p>
          {error && <p className="text-xs text-red-400 font-bold">{error}</p>}
        </div>
      )}
      {error && !magicLink && <p className="text-xs text-red-400 font-bold mt-3">{error}</p>}
    </section>
  )
}

interface Props { userId: string; profile: any; progress: any }

export default function SettingsClient({ userId, profile, progress }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const lang = profile?.preferred_language ?? 'en'
  const t    = UI[lang] ?? UI.en
  const dir  = lang === 'ar' ? 'rtl' : 'ltr'

  const [name,        setName]        = useState(profile?.display_name ?? '')
  const [avatar,      setAvatar]      = useState(profile?.avatar ?? '🧑‍🚀')
  const [age,         setAge]         = useState(profile?.age ?? 12)
  const [country,     setCountry]     = useState(profile?.country ?? 'AE')
  const [language,    setLanguage]    = useState(profile?.preferred_language ?? 'en')
  const [interests,   setInterests]   = useState<string[]>(profile?.interests ?? [])
  const [dream,       setDream]       = useState(profile?.dream_project ?? '')
  const [parentEmail, setParentEmail] = useState(profile?.parent_email ?? '')
  const [savedMsg,    setSavedMsg]    = useState(false)
  const [linkSent,    setLinkSent]    = useState(false)

  const toggleInterest = (id: string) =>
    setInterests((prev: string[]) => prev.includes(id) ? prev.filter((i: string) => i !== id) : [...prev, id])

  const save = () => {
    startTransition(async () => {
      const ageGroup = getAgeGroup(age)
      const { error } = await upsertProfile(userId, {
        display_name: name, avatar, age, age_group: ageGroup,
        interests: interests as any, dream_project: dream,
        country, parent_email: parentEmail || undefined,
      })
      if (error) { console.error('[SettingsClient] Profile save failed:', error.message); return }
      await updateUserLanguage(userId, language as 'en' | 'ar' | 'fr')
      setSavedMsg(true)
      setTimeout(() => setSavedMsg(false), 3000)
      router.refresh()
    })
  }

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const sendPasswordReset = async () => {
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(profile?.email ?? '', {
      redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/settings`,
    })
    setLinkSent(true)
    setTimeout(() => setLinkSent(false), 5000)
  }

  const totalMins = progress?.total_time_mins ?? 0
  const timeStr   = totalMins >= 60 ? `${Math.floor(totalMins / 60)}h ${totalMins % 60}m` : `${totalMins}m`

  const getCountryName = (c: typeof COUNTRIES[0]) =>
    lang === 'ar' ? c.nameAr : lang === 'fr' ? c.nameFr : c.name

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-3xl" dir={dir}>
      <h1 className="font-fredoka text-2xl md:text-3xl mb-6 md:mb-8">{t.title}</h1>

      {/* ── Stats summary ── */}
      {/* 2×2 on mobile, 4-wide on sm+ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3 mb-6 md:mb-8">
        {[
          { label: t.xp,     value: (progress?.xp ?? 0).toLocaleString(), emoji: '⚡' },
          { label: t.streak, value: `${progress?.longest_streak ?? 0}d`,  emoji: '🔥' },
          { label: t.time,   value: timeStr,                               emoji: '⏱' },
          { label: 'Level',  value: `L${progress?.level ?? 1}`,            emoji: '🌟' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-white/8 rounded-2xl p-3 md:p-4 text-center">
            <div className="text-lg md:text-xl mb-1">{s.emoji}</div>
            <div className="font-extrabold text-sm">{s.value}</div>
            <div className="text-muted text-xs font-bold">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Profile section ── */}
      <section className="bg-card border border-white/8 rounded-3xl p-5 md:p-6 mb-5 md:mb-6">
        <h2 className="font-fredoka text-lg md:text-xl mb-5 md:mb-6">{t.profile}</h2>

        {/* Avatar picker */}
        <div className="mb-5 md:mb-6">
          <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-3">{t.avatar}</label>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-card2 border-2 border-accent4/40 flex items-center justify-center text-3xl md:text-4xl shrink-0">
              {avatar}
            </div>
            <div className="text-sm font-semibold text-muted">
              {lang === 'ar' ? 'صورتك الحالية' : lang === 'fr' ? 'Ton avatar actuel' : 'Current avatar'}
            </div>
          </div>
          {/* 10-col grid on md+, 5-col on mobile so each emoji is a comfortable tap size */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {AVATARS.map(a => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                className={cn(
                  'aspect-square rounded-xl text-xl sm:text-2xl flex items-center justify-center transition-all touch-manipulation',
                  avatar === a
                    ? 'bg-accent4/20 border-2 border-accent4 scale-110'
                    : 'bg-card2 border-2 border-transparent hover:border-white/20 hover:scale-105 active:scale-95'
                )}
              >{a}</button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-2">{t.name}</label>
          <input
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            maxLength={50}
            className="w-full bg-card2 border-2 border-white/8 focus:border-accent4 rounded-xl px-4 py-3 text-white font-semibold text-sm outline-none transition-all"
          />
        </div>

        {/* Age + Country — stacked on mobile, side-by-side on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-4">
          <div>
            <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-2">{t.age}</label>
            <input
              type="number" min={6} max={18} value={age}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAge(Number(e.target.value))}
              className="w-full bg-card2 border-2 border-white/8 focus:border-accent4 rounded-xl px-4 py-3 text-white font-semibold text-sm outline-none transition-all"
            />
            <p className="text-xs text-muted font-bold mt-1">
              {getAgeGroup(age) === 'mini'   ? '🌱 Mini Explorer'  :
               getAgeGroup(age) === 'junior' ? '🛠️ Junior Creator' :
               getAgeGroup(age) === 'pro'    ? '🗺️ Pro Explorer'   : '🚀 Tech Expert'}
            </p>
          </div>
          <div>
            <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-2">{t.country}</label>
            <select
              value={country}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCountry(e.target.value)}
              className="w-full bg-card2 border-2 border-white/8 focus:border-accent4 rounded-xl px-4 py-3 text-white font-semibold text-sm outline-none transition-all"
            >
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.flag} {getCountryName(c)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Language selector */}
        <div className="mb-5 md:mb-6">
          <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-3">{t.language}</label>
          <div className="flex gap-2 md:gap-3">
            {[
              { code: 'en', flag: '🇬🇧', label: 'English'  },
              { code: 'ar', flag: '🇦🇪', label: 'العربية'  },
              { code: 'fr', flag: '🇫🇷', label: 'Français' },
            ].map(l => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={cn(
                  'flex-1 py-2.5 md:py-3 rounded-xl font-extrabold text-xs md:text-sm border-2 transition-all flex items-center justify-center gap-1.5 md:gap-2 touch-manipulation',
                  language === l.code
                    ? 'bg-accent4/15 border-accent4 text-accent4'
                    : 'bg-card2 border-white/8 text-muted hover:border-white/25'
                )}
              >
                <span>{l.flag}</span>
                {/* Hide text label on very narrow screens, show from xs up */}
                <span className="hidden xs:inline">{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Interests — 2-col on mobile, 3-col on sm+ */}
        <div className="mb-5 md:mb-6">
          <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-3">{t.interests}</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {INTERESTS_LIST.map(int => {
              const label = lang === 'ar' ? int.ar : lang === 'fr' ? int.fr : int.en
              return (
                <button
                  key={int.id}
                  onClick={() => toggleInterest(int.id)}
                  className={cn(
                    'py-2.5 md:py-3 px-3 rounded-xl text-xs md:text-sm font-bold border-2 transition-all text-start flex items-center gap-2 touch-manipulation active:scale-95',
                    interests.includes(int.id)
                      ? 'bg-accent5/15 border-accent5/60 text-accent5'
                      : 'bg-card2 border-white/8 text-muted hover:border-white/20'
                  )}
                >
                  <span>{int.emoji}</span>
                  <span className="truncate">{label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Dream project */}
        <div className="mb-5 md:mb-6">
          <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-2">{t.dream} 🌟</label>
          <textarea
            value={dream}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDream(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder={lang === 'ar' ? 'أخبرنا عن مشروع أحلامك...' : lang === 'fr' ? "Parle-nous de ton projet de rêve..." : 'Tell us about your dream project...'}
            className="w-full bg-card2 border-2 border-white/8 focus:border-accent4 rounded-xl px-4 py-3 text-white font-semibold text-sm outline-none transition-all resize-none placeholder:text-muted/50"
          />
        </div>

        {/* Parent email */}
        <div className="mb-7 md:mb-8">
          <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-2">{t.parent} 👨‍👩‍👧</label>
          <input
            type="email"
            value={parentEmail}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setParentEmail(e.target.value)}
            placeholder="parent@example.com"
            className="w-full bg-card2 border-2 border-white/8 focus:border-accent4 rounded-xl px-4 py-3 text-white font-semibold text-sm outline-none transition-all"
          />
          <p className="text-xs text-muted font-semibold mt-1.5">{t.parentHint}</p>
        </div>

        {/* Save button */}
        <button
          onClick={save}
          disabled={isPending}
          className={cn(
            'w-full py-3.5 md:py-4 rounded-2xl font-extrabold text-sm transition-all touch-manipulation active:scale-[0.98]',
            savedMsg
              ? 'bg-accent3/20 text-accent3 border border-accent3/30'
              : 'bg-gradient-to-r from-accent4 to-accent5 text-white hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50'
          )}
        >
          {savedMsg ? t.saved : isPending ? t.saving : t.save}
        </button>
      </section>

      {/* ── Parent share section ── */}
      <ParentShareSection
        hasParentEmail={!!parentEmail || !!profile?.parent_email}
        lang={lang}
        t={t}
      />

      {/* ── Notification preferences ── */}
      <NotificationPrefsSection userId={userId} profile={profile} lang={lang} />

      {/* ── Security section ── */}
      <section className="bg-card border border-white/8 rounded-3xl p-5 md:p-6 mb-5 md:mb-6">
        <h2 className="font-fredoka text-lg md:text-xl mb-4 md:mb-5">{t.security}</h2>
        {/* Stacked on mobile, inline on sm+ */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="font-bold text-sm mb-0.5">{t.changePass}</p>
            <p className="text-xs text-muted font-semibold">{t.passHint}</p>
          </div>
          <button
            onClick={sendPasswordReset}
            className={cn(
              'w-full sm:w-auto px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all shrink-0 touch-manipulation',
              linkSent
                ? 'bg-accent3/15 text-accent3 border border-accent3/30'
                : 'bg-card2 border border-white/10 text-muted hover:text-white hover:border-white/25'
            )}
          >
            {linkSent ? t.linkSent : t.sendLink}
          </button>
        </div>
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-xs text-muted font-semibold break-all">
            {t.account}: <span className="text-white">{profile?.email}</span>
          </p>
        </div>
      </section>

      {/* ── Danger zone ── */}
      <section className="bg-red-500/5 border border-red-500/20 rounded-3xl p-5 md:p-6">
        <h2 className="font-fredoka text-lg md:text-xl text-red-400 mb-3 md:mb-4">{t.danger}</h2>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="font-bold text-sm mb-0.5">{t.signOut}</p>
            <p className="text-xs text-muted font-semibold">
              {lang === 'ar' ? 'ستحتاج إلى تسجيل الدخول مجدداً' : lang === 'fr' ? 'Tu devras te reconnecter' : 'You will need to sign in again'}
            </p>
          </div>
          <button
            onClick={signOut}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-extrabold text-sm border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all touch-manipulation"
          >
            {t.signOut} →
          </button>
        </div>
      </section>
    </div>
  )
}