'use client'
// components/subscription/PricingClient.tsx
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/openrouter'

const INTERVAL_LABELS: Record<string, Record<Language, string>> = {
  trial: { en:'14-Day Free Trial', ar:'تجربة مجانية 14 يوم',  fr:'Essai gratuit 14 jours' },
  month: { en:'per month',         ar:'شهرياً',               fr:'par mois'                },
  year:  { en:'per year',          ar:'سنوياً',               fr:'par an'                  },
}
const SAVINGS: Record<Language, string> = {
  en: 'Save $285 vs monthly',
  ar: 'وفر 285$ مقارنة بالشهري',
  fr: 'Économisez 285$ vs mensuel',
}
const POPULAR_LABEL: Record<Language, string> = {
  en:'Most Popular 🔥', ar:'الأكثر شعبية 🔥', fr:'Le plus populaire 🔥'
}

interface Plan {
  id: string; name: string; name_ar: string; name_fr: string
  price_usd: number; interval: string; trial_days: number
  features: string[]; is_popular: boolean
}

interface Props {
  plans:      Plan[]
  isLoggedIn: boolean
  profile:    any
  accessInfo: { isTrialing: boolean; trialDaysLeft: number; isPaid: boolean } | null
}

export default function PricingClient({ plans, isLoggedIn, profile, accessInfo }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError]     = useState<string | null>(null)

  const lang: Language = (profile?.preferred_language ?? 'en') as Language
  const dir  = lang === 'ar' ? 'rtl' : 'ltr'

  const handleCheckout = async (planInterval: string) => {
    if (!isLoggedIn) { router.push('/auth/signup'); return }
    const planKey = planInterval === 'month' ? 'monthly' : 'yearly'
    setLoading(planKey)
    setError(null)
    try {
      const res  = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      })
      const data = await res.json()
      if (data.url) { window.location.href = data.url }
      else setError(data.error ?? 'Something went wrong')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(null)
    }
  }

  const title: Record<Language, string>  = { en:'Simple, Honest Pricing', ar:'تسعير بسيط وشفاف', fr:'Tarifs simples et honnêtes' }
  const sub: Record<Language, string>    = {
    en: 'Start free for 14 days — no credit card needed. Upgrade anytime.',
    ar: 'ابدأ مجاناً لمدة 14 يوماً — لا حاجة لبطاقة ائتمان. يمكنك الترقية في أي وقت.',
    fr: 'Commence gratuitement pendant 14 jours — sans carte bancaire. Mets à niveau quand tu veux.',
  }
  const ctaFree: Record<Language, string>  = { en:'Start Free Trial', ar:'ابدأ التجربة المجانية', fr:'Commencer l\'essai gratuit' }
  const ctaSub: Record<Language, string>   = { en:'Get Started',      ar:'ابدأ الآن',             fr:'Commencer' }
  const included: Record<Language, string> = { en:'What\'s included:', ar:'ما يشمله الاشتراك:',   fr:'Ce qui est inclus :' }

  const getPlanName = (p: Plan) => lang === 'ar' ? p.name_ar : lang === 'fr' ? p.name_fr : p.name

  const getFeatures = (p: Plan): string[] => {
    if (Array.isArray(p.features)) return p.features as string[]
    try { return JSON.parse(p.features as any) } catch { return [] }
  }

  const trialPlan   = plans.find(p => p.interval === 'trial')
  const monthlyPlan = plans.find(p => p.interval === 'month')
  const yearlyPlan  = plans.find(p => p.interval === 'year')
  const paidPlans   = [monthlyPlan, yearlyPlan].filter(Boolean) as Plan[]

  return (
    <div className="min-h-screen relative z-10" dir={dir}>
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 lg:px-12 py-4 flex items-center justify-between glass">
        <Link href="/" className="font-fredoka text-2xl bg-gradient-to-r from-accent2 to-accent1 bg-clip-text text-transparent">Plulai</Link>
        <div className="flex items-center gap-3">
          {isLoggedIn
            ? <Link href="/dashboard" className="px-5 py-2.5 rounded-xl font-extrabold text-sm bg-gradient-to-r from-accent4 to-accent5 text-white hover:-translate-y-0.5 transition-all">{lang === 'ar' ? 'لوحة التحكم' : lang === 'fr' ? 'Tableau de bord' : 'Dashboard'}</Link>
            : <>
                <Link href="/auth/login"  className="text-sm font-bold text-muted hover:text-white transition-colors">{lang === 'ar' ? 'تسجيل الدخول' : lang === 'fr' ? 'Connexion' : 'Log In'}</Link>
                <Link href="/auth/signup" className="px-5 py-2.5 rounded-xl font-extrabold text-sm bg-gradient-to-r from-accent3 to-accent4 text-white hover:-translate-y-0.5 transition-all">{lang === 'ar' ? 'ابدأ مجاناً' : lang === 'fr' ? 'Commencer' : 'Start Free'}</Link>
              </>
          }
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-fredoka text-4xl lg:text-5xl mb-4">{title[lang]}</h1>
          <p className="text-muted font-semibold text-lg max-w-xl mx-auto">{sub[lang]}</p>
        </div>

        {/* Trial banner */}
        {accessInfo?.isTrialing && (
          <div className="bg-accent3/10 border border-accent3/30 rounded-3xl p-6 text-center mb-12">
            <div className="text-3xl mb-2">🎉</div>
            <p className="font-extrabold text-accent3 text-lg">
              {lang === 'ar'
                ? `لديك ${accessInfo.trialDaysLeft} يوم متبقٍ في تجربتك المجانية!`
                : lang === 'fr'
                ? `Il te reste ${accessInfo.trialDaysLeft} jours d'essai gratuit !`
                : `You have ${accessInfo.trialDaysLeft} days left in your free trial!`}
            </p>
            <p className="text-muted font-semibold text-sm mt-1">
              {lang === 'ar' ? 'قم بالترقية الآن للحفاظ على تقدمك.' : lang === 'fr' ? 'Mets à niveau maintenant pour conserver ta progression.' : 'Upgrade now to keep all your progress.'}
            </p>
          </div>
        )}

        {/* Free trial standalone card */}
        {trialPlan && (
          <div className="bg-gradient-to-br from-accent3/10 to-accent4/10 border border-accent3/25 rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-center gap-6">
            <div className="text-5xl">🚀</div>
            <div className="flex-1 text-center md:text-start">
              <h2 className="font-fredoka text-2xl mb-1">{getPlanName(trialPlan)}</h2>
              <p className="text-muted font-semibold text-sm mb-1">{INTERVAL_LABELS.trial[lang]}</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-2">
                {getFeatures(trialPlan).map((f, i) => (
                  <span key={i} className="text-xs font-bold bg-accent3/10 border border-accent3/20 text-accent3 rounded-full px-3 py-1">✓ {f}</span>
                ))}
              </div>
            </div>
            <div className="flex-shrink-0">
              {isLoggedIn && !accessInfo?.isTrialing && !accessInfo?.isPaid ? (
                <Link href="/dashboard" className="block px-8 py-4 rounded-2xl font-extrabold text-white bg-gradient-to-r from-accent3 to-accent4 hover:-translate-y-1 transition-all shadow-lg text-center">
                  {lang === 'ar' ? 'لوحة التحكم' : lang === 'fr' ? 'Mon tableau de bord' : 'Go to Dashboard'}
                </Link>
              ) : !isLoggedIn ? (
                <Link href="/auth/signup" className="block px-8 py-4 rounded-2xl font-extrabold text-white bg-gradient-to-r from-accent3 to-accent4 hover:-translate-y-1 transition-all shadow-lg text-center">
                  {ctaFree[lang]}
                </Link>
              ) : (
                <div className="px-8 py-4 rounded-2xl font-extrabold text-accent3 border-2 border-accent3/30 bg-accent3/10 text-center text-sm">
                  {lang === 'ar' ? '✅ تجربتك نشطة' : lang === 'fr' ? '✅ Essai actif' : '✅ Trial Active'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Paid plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paidPlans.map(plan => (
            <div
              key={plan.id}
              className={cn(
                'relative bg-card border rounded-3xl p-8 flex flex-col transition-all hover:-translate-y-1',
                plan.is_popular
                  ? 'border-accent2/40 shadow-[0_0_40px_rgba(255,217,61,0.15)]'
                  : 'border-white/8 hover:border-white/15'
              )}
            >
              {plan.is_popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-accent2 to-accent1 text-black text-xs font-extrabold px-5 py-2 rounded-full shadow-lg whitespace-nowrap">
                  {POPULAR_LABEL[lang]}
                </div>
              )}

              <h2 className="font-fredoka text-2xl mb-2">{getPlanName(plan)}</h2>

              <div className="mb-4">
                <span className="font-fredoka text-5xl text-white">${plan.price_usd}</span>
                <span className="text-muted font-bold text-sm ms-2">{INTERVAL_LABELS[plan.interval]?.[lang]}</span>
                {plan.interval === 'year' && (
                  <div className="text-accent3 text-xs font-extrabold mt-1">{SAVINGS[lang]}</div>
                )}
                {plan.interval === 'month' && (
                  <div className="text-muted text-xs font-bold mt-1">
                    {lang === 'ar' ? '≈ 8.80$ يومياً' : lang === 'fr' ? '≈ 8,80$/jour' : '≈ $8.80/day billed monthly'}
                  </div>
                )}
                {plan.interval === 'year' && (
                  <div className="text-muted text-xs font-bold mt-0.5">
                    {lang === 'ar' ? '≈ 55.25$ شهرياً' : lang === 'fr' ? '≈ 55,25$/mois' : '≈ $55.25/month billed yearly'}
                  </div>
                )}
              </div>

              <div className="mb-6">
                <p className="text-xs font-bold text-muted mb-3">{included[lang]}</p>
                <ul className="space-y-2">
                  {getFeatures(plan).map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm font-semibold">
                      <span className="text-accent3 flex-shrink-0 mt-0.5">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto">
                {accessInfo?.isPaid ? (
                  <div className="w-full py-4 rounded-2xl font-extrabold text-center text-accent3 border-2 border-accent3/30 bg-accent3/10 text-sm">
                    {lang === 'ar' ? '✅ اشتراكك نشط' : lang === 'fr' ? '✅ Abonnement actif' : '✅ Subscribed'}
                  </div>
                ) : (
                  <button
                    onClick={() => plan.interval !== 'trial' && handleCheckout(plan.interval)}
                    disabled={!!loading || plan.interval === 'trial'}
                    className={cn(
                      'block w-full py-4 rounded-2xl font-extrabold text-center transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed',
                      plan.interval === 'trial'
                        ? 'bg-gradient-to-r from-accent3 to-accent4 text-white'
                        : plan.is_popular
                        ? 'bg-gradient-to-r from-accent2 to-accent1 text-black shadow-lg hover:shadow-accent2/30'
                        : 'bg-gradient-to-r from-accent4 to-accent5 text-white hover:shadow-accent4/30'
                    )}
                  >
                    {loading === (plan.interval === 'month' ? 'monthly' : 'yearly')
                      ? '⏳ ' + (lang === 'ar' ? 'جارٍ التحميل...' : lang === 'fr' ? 'Chargement...' : 'Loading...')
                      : plan.interval === 'trial'
                      ? (isLoggedIn
                          ? (lang === 'ar' ? '✅ التجربة نشطة' : lang === 'fr' ? '✅ Essai actif' : '✅ Trial Active')
                          : ctaFree[lang])
                      : ctaSub[lang]}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ / trust */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { emoji:'🔒', en:'Secure payments via Stripe. Cancel anytime.', ar:'مدفوعات آمنة عبر Stripe. إلغاء في أي وقت.', fr:'Paiements sécurisés via Stripe. Annulation à tout moment.' },
            { emoji:'🌍', en:'Available across all 6 GCC countries in Arabic, English & French.', ar:'متاح في جميع دول الخليج الست بالعربية والإنجليزية والفرنسية.', fr:'Disponible dans les 6 pays du CCG en arabe, anglais et français.' },
            { emoji:'🧒', en:'Safe for kids aged 6-18. COPPA compliant. No ads ever.', ar:'آمن للأطفال 6-18 سنة. متوافق مع COPPA. لا إعلانات أبداً.', fr:'Sûr pour les enfants de 6-18 ans. Conforme COPPA. Aucune publicité.' },
          ].map((f, i) => (
            <div key={i} className="bg-card border border-white/5 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-3">{f.emoji}</div>
              <p className="text-muted text-sm font-semibold leading-relaxed">{f[lang]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
