// File: HomeClientAr.tsx
// Placement: components/HomeClientAr.tsx   (rendered by app/ar/page.tsx)
//
// Arabic version of the redesigned landing page. Same structure, same design
// system (components/plulai-styles.ts), mirrored for RTL by the `.pl-rtl`
// rules at the bottom of that stylesheet. The Arabic font stack still comes
// from `.arRoot` in your page.module.css, so the font is unchanged.
//
// Differences from the English page, on purpose:
//  - Arabic-Indic digits and the Arabic thousands separator for numbers.
//  - Auth / schools links keep their /ar/... paths from the old Arabic page.
//  - No founder section (it lives on /about, which is English only for now).

'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import arStyles from '@/app/page.module.css'
import { css } from './plulai-styles'

/* ------------------------------ HELPERS ------------------------------ */

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩'
const ar = (n: number | string) => String(n).replace(/\d/g, (d) => AR_DIGITS[+d])
const arGroup = (n: number) => ar(String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')).replace(/,/g, '٬')

/* ------------------------------ DATA ------------------------------ */

const partners = Array.from({ length: 11 }, (_, i) => ({ name: `شريك ${ar(i + 1)}`, file: `p${i + 1}.png` }))

const AI = 'الذكاء الاصطناعي'
const projects = [
  { file: '1.png', title: 'شاهد مع الأصدقاء', track: 'البرمجة', student: 'سارة، ١٥ سنة' },
  { file: '2.png', title: 'لعبة الهروب', track: 'ألعاب', student: 'كمر، ١٥ سنة' },
  { file: '3.png', title: 'مسابقة الدول', track: 'ألعاب', student: 'فرح، ١٥ سنة' },
  { file: '4.png', title: 'خمّن العلم', track: 'ألعاب', student: 'مريم، ١٢ سنة' },
  { file: '5.png', title: 'قارئ الوصفات الطبية', track: AI, student: 'يوسف، ١٥ سنة' },
  { file: '6.png', title: 'إدارة الفعاليات', track: 'البرمجة', student: 'كمر، ١٤ سنة' },
  { file: '7.png', title: 'سودوكو', track: 'ألعاب', student: 'كمر، ١٥ سنة' },
  { file: '8.png', title: 'الطبيب الذكي', track: AI, student: 'ياسين، ١١ سنة' },
  { file: '10.png', title: 'لعبة التلوين', track: 'ألعاب', student: 'كمر، ١٥ سنة' },
  { file: '11.png', title: 'المساعد الجيولوجي', track: AI, student: 'أحمد، ١٣ سنة' },
  { file: '12.png', title: 'لعبة', track: 'ألعاب', student: 'عبد الرحمن، ١٢ سنة' },
  { file: '13.png', title: 'لعبة المتاهة', track: 'ألعاب', student: 'سارة، ١٤ سنة' },
  { file: '14.png', title: 'الذكاء الاصطناعي للتأمل', track: AI, student: 'يحيى، ١٢ سنة' },
  { file: '15.png', title: 'لعبة كرة القدم', track: 'البرمجة', student: 'عثمان، ١٠ سنوات' },
  { file: '17.png', title: 'اصنعها بنفسك بالذكاء الاصطناعي', track: AI, student: '' },
  { file: '18.png', title: 'لعبة المتتاليات', track: 'ألعاب', student: 'مريم، ١٤ سنة' },
  { file: '19.png', title: 'سباق الأعلام', track: 'البرمجة', student: 'فرح، ١٥ سنة' },
]

const journey = [
  { title: 'شرارة', color: '#FF6B57', fg: '#FFFFFF', text: 'اكتشف صوتك: اعرض فكرة، تحدّث أمام الآخرين، ولا تخف من الخطأ.', tags: ['الثقة بالنفس', 'التواصل', 'التفكير الإبداعي'] },
  { title: 'بناء', color: '#1FB8A6', fg: '#0D2B32', text: 'حوّل ما في رأسك إلى شيء حقيقي: تطبيق أو لعبة أو تصميم يحبه الناس.', tags: ['البرمجة', 'تطوير الألعاب', 'تصميم الواجهات'] },
  { title: 'تفكير', color: '#D4A24C', fg: '#0D2B32', text: 'أتقن الذكاء الاصطناعي والمال، لتستخدمهما بدل أن يستخدماك.', tags: ['الذكاء الاصطناعي وتقنيات المستقبل', 'الثقافة المالية'] },
  { title: 'انطلاق', color: '#0D2B32', fg: '#F6F3EA', text: 'خذ فكرتك حتى العرض النهائي: مسعّرة ومسوّقة ومقدَّمة بثقة.', tags: ['ريادة الأعمال', 'التسويق', 'العرض والإلقاء'] },
]

const steps = [
  { chip: '٣٠ دقيقة', title: 'احجز عرضًا تجريبيًا', text: 'جولة من ٣٠ دقيقة على واجهة الطالب وواجهة المعلّم ولوحة الإدارة، مصمّمة حسب صفوفكم.' },
  { chip: 'تجربة مجانية', title: 'جرّب فصلًا واحدًا', text: 'شغّل تجربة مجانية مع فصل واحد قبل الالتزام على مستوى المدرسة. وصول كامل وبلا ضغط.' },
  { chip: 'يقدّمها معلّمو Plulai', title: 'معلّمو Plulai يقودون الحصص', text: 'يقدّم معلّمونا الجلسات بالعربية أو الفرنسية أو الإنجليزية، مع مدرّب ذكاء اصطناعي يدعم كل طالب.' },
  { chip: 'خلال شهر', title: 'التطبيق على مستوى المدرسة', text: 'وسّع التجربة لتشمل الصف الكامل أو المدرسة، مع لوحة إدارة تنبّه لمن يتعثّر قبل بطاقة التقرير.' },
]

const packages = [
  { name: 'تجربة فصل واحد', seats: 'فصل واحد · حتى ٣٥ مقعدًا', blurb: 'جرّبها مع فصل واحد قبل اتخاذ القرار على مستوى المدرسة.', features: ['المسار الكامل بمراحله الأربع', 'فصل دراسي واحد', 'جلسة تأهيل للمعلّمين'], cta: 'ابدأ تجربة', hi: false },
  { name: 'على مستوى المدرسة', seats: '٥٠–١٬٠٠٠ مقعد', blurb: 'الإعداد الأكثر شيوعًا لتطبيق كامل على مستوى المدرسة.', features: ['المسار الكامل بمراحله الأربع', 'لوحة تحكم الإدارة', 'تدريب المعلّمين والدعم', 'عام دراسي كامل'], cta: 'احجز عرضًا تجريبيًا', hi: true },
  { name: 'على مستوى المنطقة التعليمية', seats: '+١٬٠٠٠ مقعد', blurb: 'عدّة مدارس تحت عقد ولوحة تحكم واحدة.', features: ['كل ما في باقة المدرسة', 'تقارير متعددة المدارس', 'مسؤول نجاح مخصص'], cta: 'تواصل مع المبيعات', hi: false },
]

const sec = (d: string) => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
)

const security = [
  { label: 'الخصوصية', color: '#1FB8A6', icon: sec('M5 11h14v10H5zM8 11V8a4 4 0 0 1 8 0v3'), title: 'بيانات الطالب محمية', text: 'نجمع فقط ما يلزم لتشغيل المهام وتتبّع التقدّم. لا تُباع أبدًا ولا تُستخدم للإعلانات.' },
  { label: 'الصلاحيات', color: '#FF6B57', icon: sec('M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM21 20v-1a4 4 0 0 0-3-3.9M16 4.1a3.5 3.5 0 0 1 0 6.8'), title: 'صلاحيات حسب الدور', text: 'يرى المعلّمون فصولهم، وترى الإدارة المدرسة كاملة، ويرى الطلاب أعمالهم فقط.' },
  { label: 'الاستضافة', color: '#D4A24C', icon: sec('M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z'), title: 'خيارات استضافة إقليمية', text: 'خيارات لمكان تخزين البيانات للمؤسسات ذات المتطلبات الإقليمية.' },
  { label: 'الدعم', color: '#0D2B32', icon: sec('M4 14v-2a8 8 0 0 1 16 0v2M4 14h3v5H5a1 1 0 0 1-1-1zM20 14h-3v5h2a1 1 0 0 0 1-1zM17 19c0 1.5-2 2-5 2'), title: 'جهة اتصال مخصّصة', text: 'تحصل خطط المؤسسات على جهة اتصال مخصّصة لأسئلة البيانات والأمان، لا طابور دعم عام.' },
]

const pitchFamily = [
  { color: '#1FB8A6', icon: sec('M3 7h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3zM16 11l5-3v8l-5-3'), title: 'حصة مباشرة كل أسبوع', text: '٩٠ دقيقة أونلاين مع معلّم من Plulai، بالعربية أو الفرنسية أو الإنجليزية.' },
  { color: '#FF6B57', icon: sec('M7 6h10a4 4 0 0 1 4 4v4a3 3 0 0 1-5.2 2L14 14h-4l-1.8 2A3 3 0 0 1 3 14v-4a4 4 0 0 1 4-4zM8 10v4M6 12h4M15.5 11h.01M18 13h.01'), title: 'لعب مفتوح في أي وقت', text: 'كلما توفّرت لحظة فراغ، يدخل الطفل المنصّة ليلعب المهام ويتدرّب.' },
  { color: '#D4A24C', icon: sec('M4 20V10M10 20V4M16 20v-7M22 20H2'), title: 'ملخّص أسبوعي لولي الأمر', text: 'اطّلعوا على ما تعلّمه وأين واجه صعوبة.' },
]

const pitchSchools = [
  { color: '#1FB8A6', icon: sec('M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM21 20v-1a4 4 0 0 0-3-3.9M16 4.1a3.5 3.5 0 0 1 0 6.8'), title: 'من ٥٠ إلى ٥٬٠٠٠ مقعد', text: 'تسعير إقليمي وفوترة مرنة.' },
  { color: '#FF6B57', icon: sec('M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z'), title: 'عربي وفرنسي وإنجليزي', text: 'مبني لفصول منطقة الشرق الأوسط وشمال أفريقيا، لا مترجم من مكان آخر.' },
  { color: '#D4A24C', icon: sec('M4 14v-2a8 8 0 0 1 16 0v2M4 14h3v5H5a1 1 0 0 1-1-1zM20 14h-3v5h2a1 1 0 0 0 1-1zM17 19c0 1.5-2 2-5 2'), title: 'دعم مخصص', text: 'تأهيل ومسؤول نجاح مخصص.' },
]

const testimonials = [
  { q: 'ابني البالغ ٩ سنوات يطلب أداء مهمته بعد المدرسة. لم أتخيّل يومًا أن أرى هذا مع البرمجة.', n: 'ليلى م.', r: 'وليّة أمر', i: 'ل' },
  { q: 'العربية والفرنسية ليستا مترجمتين، إنهما أصليتان. هذا وحده يميّزها.', n: 'د. خالد ر.', r: 'مدير مدرسة', i: 'خ' },
  { q: 'بنى أول لعبة تعمل فعليًا خلال أسبوعين. مدرّب الذكاء الاصطناعي أكثر صبرًا مني.', n: 'سارة أ.', r: 'وليّة أمر', i: 'س' },
]

const faqs: { q: string; a: string; for: 'family' | 'schools' | 'common' }[] = [
  { q: 'هل يمكن لطفلي استخدام Plulai بمفرده في المنزل؟', a: 'نعم. إلى جانب الحصة المباشرة الأسبوعية (٩٠ دقيقة)، يستطيع طفلكم فتح المنصّة متى كان متفرّغًا ليلعب المهام ويتدرّب بمفرده.', for: 'family' },
  { q: 'هل توجد باقة لأكثر من طفل؟', a: 'نعم. تغطي باقة العائلة حتى ٣ أطفال باشتراك واحد، مع تتبّع تقدّم منفصل لكل طفل ولوحة واحدة مشتركة لولي الأمر.', for: 'family' },
  { q: 'ما الأجهزة أو المتصفّحات التي نحتاجها؟', a: 'تعمل Plulai على أي متصفّح حديث (Chrome أو Safari أو Edge) على أجهزة Chromebook أو الحواسيب المحمولة أو الأجهزة اللوحية. لا حاجة لأي تثبيت.', for: 'common' },
  { q: 'كيف يتم التعامل مع بيانات الطالب؟', a: 'نجمع فقط ما يلزم لتشغيل المهام وتتبّع التقدّم. لا تُباع البيانات أبدًا ولا تُستخدم للإعلانات.', for: 'common' },
  { q: 'هل تناسب الجلسات مدة الحصّة الدراسية العادية؟', a: 'نعم. الجلسات من ٣٠ إلى ٤٥ دقيقة، مصمّمة لتناسب حصّة دراسية عادية دون جدولة إضافية.', for: 'schools' },
  { q: 'كم يستغرق التأهيل؟', a: 'تنتقل معظم المدارس من العرض التجريبي إلى فصل تجريبي فعلي خلال أسبوع، وإلى التطبيق الكامل خلال شهر. يشمل ذلك جلسة تدريب قصيرة للمعلّمين.', for: 'schools' },
  { q: 'كيف تعمل الفوترة للمؤسسات؟', a: 'تُفوتَر خطط المؤسسات حسب عدد المقاعد ومدة الفصل، مع فوترة مرنة. احجز عرضًا تجريبيًا وسنُعدّ لكم عرض سعر.', for: 'schools' },
  { q: 'هل يحتاج المعلّمون خلفية في البرمجة؟', a: 'لا. يحصل المعلّمون على جلسة تأهيل قصيرة، ويتولّى مدرّب الذكاء الاصطناعي معظم التوجيه الفردي.', for: 'schools' },
]

const WHATSAPP_URL = `https://wa.me/97455548407?text=${encodeURIComponent('مرحبًا Plulai، أودّ الاشتراك في باقة العائلة (٢٠ دولارًا شهريًا).')}`

/* --------------------------- SHARED PIECES --------------------------- */

function Section({ id, tone, title, sub, children }: { id?: string; tone: 'cream' | 'white'; title?: string; sub?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={`pl-sec pl-${tone}`}>
      <div className="pl-wrap">
        {title && (
          <header className="pl-head">
            <h2>{title}</h2>
            {sub && <p>{sub}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  )
}

const Check = ({ light }: { light?: boolean }) => (
  <span className={`pl-check ${light ? 'light' : ''}`} aria-hidden>
    <svg width={12} height={12} viewBox="0 0 16 16"><path d="M3 8.5l3.2 3.2L13 4.8" stroke="currentColor" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </span>
)

const Arrow = () => (
  <svg className="pl-arrow" width={16} height={16} viewBox="0 0 16 16" aria-hidden>
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const WhatsApp = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12.04 2a9.9 9.9 0 0 0-8.4 15.1L2 22l5.04-1.6A9.9 9.9 0 1 0 12.04 2Zm0 18a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-2.99.95.97-2.9-.2-.31A8.1 8.1 0 1 1 12.04 20Zm4.45-6.06c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.8-.2-.47-.4-.41-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.1 3.64.57.25 1.02.4 1.37.5.58.18 1.1.16 1.51.1.46-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z" />
  </svg>
)

function CountUp({ to, prefix = '+' }: { to: number; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [v, setV] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setV(to); return }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / 1400)
        setV(Math.round(to * (1 - Math.pow(1 - p, 3))))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [to])
  return <span ref={ref}>{prefix}{arGroup(v)}</span>
}

/* ------------------------------ PAGE ------------------------------ */

export default function HomeClientAr() {
  const [navOpen, setNavOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [stage, setStage] = useState(0)
  const [audience, setAudience] = useState<'family' | 'schools'>('family')

  const schools = audience === 'schools'
  const primaryCta = schools ? 'احجز عرضًا تجريبيًا' : 'ابدأ التجربة المجانية'
  const primaryHref = schools ? 'mailto:hello@plulai.com' : '/ar/auth/signup'
  const secondary = schools
    ? { label: 'تحدّث مع فريقنا', href: 'mailto:hello@plulai.com' }
    : { label: 'شاهد باقة العائلة', href: '#plans' }

  let n = 0
  const tone = () => (n++ % 2 ? 'white' : 'cream') as 'white' | 'cream'

  const pick = (a: 'family' | 'schools') => { setAudience(a); setOpenFaq(0) }
  const visibleFaqs = faqs.filter((f) => f.for === 'common' || f.for === audience)

  return (
    <div className={`pl-root pl-rtl ${arStyles.arRoot}`} dir="rtl" lang="ar">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <a href="#main-content" className="pl-skip">انتقل إلى المحتوى</a>

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'EducationalOrganization',
            name: 'Plulai',
            legalName: 'Plulai Consulting FZCO',
            url: 'https://plulai.com/ar',
            logo: 'https://plulai.com/logo.png',
            inLanguage: 'ar',
            description: 'منهج في البرمجة والذكاء الاصطناعي والمهارات الحياتية للأطفال والمدارس، يُدرَّس بالعربية والفرنسية والإنجليزية الأصيلة.',
            address: { '@type': 'PostalAddress', addressLocality: 'Dubai', addressCountry: 'AE' },
            areaServed: 'MENA',
            availableLanguage: ['ar', 'fr', 'en'],
            sameAs: [],
          }),
        }}
      />

      {/* ============ NAV ============ */}
      <header className="pl-navwrap">
        <nav className="pl-nav" aria-label="القائمة الرئيسية">
          <a href="/ar" aria-label="Plulai، الصفحة الرئيسية" className="pl-logo">
            <Image src="/logo.png" alt="Plulai" width={132} height={36} priority style={{ height: 'auto', width: 'auto', maxHeight: 30 }} />
          </a>

          <div className="pl-navlinks">
            <a href="#path">المسار</a>
            <a href="#audience" onClick={() => pick('schools')} className={schools ? 'on' : ''}>للمدارس</a>
            <a href="#audience" onClick={() => pick('family')} className={!schools ? 'on' : ''}>للعائلات</a>
            <a href="#plans">الأسعار</a>
          </div>

          <div className="pl-navright">
            <a href="/" className="pl-lang" lang="en" hrefLang="en">English</a>
            <a href="/ar/auth/login" className="pl-login">تسجيل الدخول</a>
            <a href={primaryHref} className="pl-btn pl-btn-primary pl-btn-sm">{primaryCta}</a>
          </div>

          <button type="button" className="pl-burger" aria-label={navOpen ? 'إغلاق القائمة' : 'فتح القائمة'} aria-expanded={navOpen} onClick={() => setNavOpen((v) => !v)}>
            <span className={navOpen ? 'x1' : ''} /><span className={navOpen ? 'x2' : ''} /><span className={navOpen ? 'x3' : ''} />
          </button>
        </nav>

        {navOpen && (
          <div className="pl-mobile">
            <a href="#path" onClick={() => setNavOpen(false)}>المسار</a>
            <a href="#audience" onClick={() => { pick('schools'); setNavOpen(false) }}>للمدارس</a>
            <a href="#audience" onClick={() => { pick('family'); setNavOpen(false) }}>للعائلات</a>
            <a href="#plans" onClick={() => setNavOpen(false)}>الأسعار</a>
            <a href="/ar/auth/login">تسجيل الدخول</a>
            <a href="/" lang="en" hrefLang="en">English</a>
            <a href={primaryHref} className="pl-btn pl-btn-primary" onClick={() => setNavOpen(false)}>{primaryCta}</a>
          </div>
        )}
      </header>

      <main id="main-content">
        {/* ============ HERO ============ */}
        <section className="pl-hero">
          <div className="pl-wrap pl-herogrid">
            <div>
              <div className="pl-toggle" role="tablist" aria-label="اختر جمهورك">
                <button type="button" role="tab" aria-selected={!schools} onClick={() => pick('family')}>للعائلات</button>
                <button type="button" role="tab" aria-selected={schools} onClick={() => pick('schools')}>للمدارس ومراكز التدريب</button>
              </div>

              <h1>
                {schools ? (
                  <><span className="pl-grad">منهج في البرمجة والذكاء الاصطناعي والمهارات الحياتية</span> تستطيع مدرستكم تطبيقه فعلًا.</>
                ) : (
                  <>ربّوا طفلًا <span className="pl-grad">يبني، لا يكتفي بالتصفّح.</span></>
                )}
              </h1>
              <p className="pl-lead">
                {schools
                  ? 'منهج متكامل لحصص من ٣٠ إلى ٤٥ دقيقة، بالعربية والفرنسية والإنجليزية الأصيلة. لكل طالب مدرّب ذكاء اصطناعي، ويرى المعلّمون من يواجه صعوبة قبل أن تظهر في بطاقة التقرير.'
                  : 'حصة مباشرة أونلاين كل أسبوع مع معلّم من Plulai، ومنصّة يدخلها طفلكم متى شاء ليلعب ويتدرّب. بالعربية أو الفرنسية أو الإنجليزية الأصيلة.'}
              </p>
              <div className="pl-row">
                <a href={primaryHref} className="pl-btn pl-btn-primary pl-btn-lg">{primaryCta} <Arrow /></a>
                <a href={secondary.href} className="pl-btn pl-btn-glass pl-btn-lg">{secondary.label}</a>
              </div>
              <ul className="pl-trust">
                {(schools
                  ? ['جلسات من ٣٠ إلى ٤٥ دقيقة', 'لوحة تحكم للمعلّم', 'تجربة مجانية لفصل واحد']
                  : ['حصة مباشرة (٩٠ دقيقة) أسبوعيًا', 'العب في المنصّة متى شئت', 'تجربة مجانية ١٤ يومًا']
                ).map((t) => <li key={t}><Check light /> {t}</li>)}
              </ul>
            </div>

            <div className="pl-herovisual">
              <div className="pl-orb" aria-hidden />
              <Image src="/avatars/heroplulai.png" alt="مرجان الجمل، تميمة Plulai" width={380} height={380} priority />
              <div className="pl-float pl-float-a">
                <span className="pl-pearl" />
                <div><b>٤ لآلئ متتالية</b><small>لؤلؤة واحدة اليوم</small></div>
              </div>
              <div className="pl-float pl-float-b">
                <span className="pl-badge-ico"><svg width={16} height={16} viewBox="0 0 20 20" aria-hidden><path d="M10 2l7 5v11H3V7z" fill="#0D2B32" /></svg></span>
                <div><b>الوصول للمستوى ٥</b><small>فارس · البرمجة</small></div>
              </div>
              <div className="pl-mission">
                <small>مهمة اليوم</small>
                <b>ابنِ لعبة أسئلة</b>
                <div className="meta"><span>البرمجة · ١٢ دقيقة</span><span>٣ / ٥ خطوات</span></div>
                <div className="pl-mbar"><div /></div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ PROOF ============ */}
        <section className={`pl-sec pl-sheet pl-${tone()}`}>
          <div className="pl-wrap">
            <p className="pl-kicker">يُستخدم في فصول دراسية وبرامج حقيقية</p>
            <div className="pl-marquee">
              <div className="pl-track" style={{ ['--dur' as string]: '36s' }}>
                {[...partners, ...partners].map((p, i) => (
                  <div key={`${p.file}-${i}`} className="pl-logo-tile">
                    <Image src={`/partners/${p.file}`} alt={p.name} width={120} height={48} style={{ width: 'auto', height: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="pl-strip">
              <div className="pl-sitem">
                <span className="pl-snum pl-snum-grad"><CountUp to={20000} /></span>
                <span className="pl-slab"><b>طفل وصلنا إليهم</b><small>تعلّموا مع Plulai</small></span>
              </div>
              <div className="pl-sitem">
                <span className="pl-snum"><CountUp to={500} /></span>
                <span className="pl-slab"><b>مهمة مصغّرة</b><small>من أول سطر برمجة إلى عرض متكامل</small></span>
              </div>
              <div className="pl-sitem">
                <span className="pl-snum"><CountUp to={partners.length} /></span>
                <span className="pl-slab"><b>شريكًا في المنطقة</b><small>مدارس ومراكز</small></span>
                <div className="pl-logostack" aria-hidden>
                  {partners.slice(0, 3).map((p) => (
                    <span key={p.file}>
                      <Image src={`/partners/${p.file}`} alt="" width={28} height={28} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </span>
                  ))}
                  <span className="more">+{ar(partners.length - 3)}</span>
                </div>
              </div>
            </div>

            <div className="pl-chips">
              {['مسابقة وطنية في البرمجة والذكاء الاصطناعي', 'تجربة كشفية حضورية لمدة يومين', 'عربي وفرنسي وإنجليزي أصيل'].map((c) => (
                <span key={c} className="pl-chip"><i />{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ============ AUDIENCE PITCH ============ */}
        <Section
          id="audience"
          tone={tone()}
          title={schools ? 'أدخل Plulai إلى فصلك الدراسي.' : 'تعلّم يناسب جدول عائلتكم.'}
          sub={schools
            ? 'منهج مع لوحة تحكم تنبّه لمن يواجه صعوبة قبل أن تظهر في بطاقة التقرير.'
            : 'حصة مباشرة واحدة أسبوعيًا، ومنصّة مفتوحة بينها. بلا جدول معقّد.'}
        >
          <div className="pl-pitch">
            {schools ? (
              <div className="pl-dashwrap">
                <div className="pl-dash" aria-label="معاينة المنتج">
                  <div className="pl-dots"><i /><i /><i /></div>
                  <p className="pl-dashtitle">الصف الخامس ب · مسار البرمجة</p>
                  {([['سارة ك.', 80], ['علي م.', 45], ['فاطمة ر.', 92], ['يوسف أ.', 15]] as [string, number][]).map(([a, v]) => {
                    const stuck = a === 'يوسف أ.'
                    return (
                      <div key={a} className="pl-bar">
                        <div className="pl-barhead"><span>{a}{stuck && <em>متعثّر</em>}</span><span>{ar(v)}٪</span></div>
                        <div className="pl-barbg"><div style={{ width: `${v}%`, background: stuck ? 'var(--pl-gold)' : 'var(--pl-teal)' }} /></div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="pl-weekcard" aria-label="أسبوع طفلكم على Plulai">
                <div className="pl-live">
                  <span className="pl-liveico">
                    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 7h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3zM16 11l5-3v8l-5-3" /></svg>
                  </span>
                  <div><b>حصة مباشرة أونلاين</b><small>مع معلّم من Plulai</small></div>
                  <div className="pl-livetime">٩٠ دقيقة<small>كل أسبوع</small></div>
                </div>
                <p className="pl-weeklabel">وبينها: لعب مفتوح في أي وقت</p>
                <div className="pl-days" aria-hidden>
                  {['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'].map((d, i) => (
                    <div key={d + i} className="pl-day"><i style={{ height: [34, 58, 26, 70, 46, 80, 52][i] }} /><small>{d}</small></div>
                  ))}
                </div>
                <p className="pl-weeknote">يدخل الأطفال متى توفّرت لهم لحظة فراغ: يلعبون المهام، يتدرّبون، ويحافظون على سلسلة لآلئهم.</p>
              </div>
            )}

            <div>
              <div className="pl-feats">
                {(schools ? pitchSchools : pitchFamily).map((f) => (
                  <div key={f.title} className="pl-feat" style={{ ['--c' as string]: f.color }}>
                    <span className="ico">{f.icon}</span>
                    <div><b>{f.title}</b><span className="t">{f.text}</span></div>
                  </div>
                ))}
              </div>
              <div className="pl-row">
                <a href={schools ? '/ar/schools' : '/ar/auth/signup'} className="pl-btn pl-btn-dark">
                  {schools ? 'استكشف الخيارات للمدارس' : 'ابدأ التجربة المجانية'} <Arrow />
                </a>
                <a href={schools ? 'mailto:hello@plulai.com' : '#plans'} className="pl-btn pl-btn-ghost">
                  {schools ? 'احجز عرضًا تجريبيًا' : 'شاهد باقة العائلة'}
                </a>
              </div>
            </div>
          </div>
        </Section>

        {/* ============ HOW IT WORKS (schools) ============ */}
        {schools && (
          <Section tone={tone()} title="من العرض التجريبي إلى التطبيق الكامل" sub="معظم المدارس تنتقل من أول مكالمة إلى فصل كامل خلال أقل من شهر.">
            <div className="pl-flow">
              <ol className="pl-flowgrid">
                {steps.map((st, i) => (
                  <li key={st.title} className="pl-fstep" style={{ ['--c' as string]: journey[i].color }}>
                    <span className="pl-fbar" />
                    <div className="pl-fbody">
                      <span className="pl-fnum">{ar(i + 1)}</span>
                      <h3>{st.title}</h3>
                      <p>{st.text}</p>
                      <span className="pl-fchip">{st.chip}</span>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="pl-flowfoot">
                <p>تجربة مجانية أولًا، بلا ضغط للاستمرار.</p>
                <a href="mailto:hello@plulai.com" className="pl-btn pl-btn-primary pl-btn-sm">احجز عرضًا تجريبيًا <Arrow /></a>
              </div>
            </div>
          </Section>
        )}

        {/* ============ THE PATH ============ */}
        <Section id="path" tone={tone()} title="ما الذي يصبحون عليه، لا ما يتعلّمونه فقط" sub="من عمر ٦ إلى ١٨، مسار واحد متّصل. البرمجة والذكاء الاصطناعي إلى جانب الثقة والتصميم والمال والتسويق، لتتحوّل الفكرة إلى شيء حقيقي.">
          <div className="pl-path">
            <div className="pl-pathtabs" role="tablist" aria-label="مراحل المسار">
              {journey.map((s, i) => (
                <button
                  key={s.title} type="button" role="tab" id={`stage-tab-${i}`}
                  aria-selected={stage === i} aria-controls="stage-panel"
                  className={`pl-pathtab ${stage === i ? 'on' : ''} ${i < stage ? 'done' : ''}`}
                  style={{ ['--c' as string]: s.color, ['--fg' as string]: s.fg }}
                  onClick={() => setStage(i)}
                >
                  <span className="pl-pathnode">{ar(i + 1)}</span>
                  <span className="pl-pathname">{s.title}</span>
                </button>
              ))}
            </div>

            {(() => {
              const s = journey[stage]
              return (
                <div key={s.title} id="stage-panel" role="tabpanel" aria-labelledby={`stage-tab-${stage}`} className="pl-panel">
                  <div className="pl-panelcopy">
                    <span className="pl-tag">المرحلة {ar(stage + 1)} من {ar(journey.length)}</span>
                    <h3>{s.title}</h3>
                    <p className="pl-panelsub">{s.text}</p>
                    <button type="button" className="pl-btn pl-btn-dark pl-btn-sm" onClick={() => setStage((stage + 1) % journey.length)}>
                      {stage < journey.length - 1 ? 'المرحلة التالية' : 'ابدأ من جديد'} <Arrow />
                    </button>
                  </div>
                  <div className="pl-panelvis" style={{ ['--c' as string]: s.color, ['--fg' as string]: s.fg }}>
                    <span className="pl-bignum" aria-hidden>{ar(`0${stage + 1}`)}</span>
                    <p className="pl-skillhead">ما يتدرّبون عليه</p>
                    <ul>{s.tags.map((t) => <li key={t}><Check />{t}</li>)}</ul>
                  </div>
                </div>
              )
            })()}
          </div>
          <p className="pl-foot">ومهام جديدة كل عام، في أي مهارة يصبح لها شأن.</p>
        </Section>

        {/* ============ PROJECTS ============ */}
        <section className={`pl-sec pl-${tone()} pl-flush`}>
          <div className="pl-wrap">
            <header className="pl-head">
              <h2>ما يعودون به من المسار</h2>
              <p>كل مشروع هنا أنجزه طفل حقيقي من Plulai، مع المسار والعمر.</p>
            </header>
          </div>
          <div className="pl-marquee">
            <div className="pl-track" style={{ ['--dur' as string]: '60s', gap: 20 }}>
              {[...projects, ...projects].map((p, i) => (
                <figure key={`${p.file}-${i}`} className="pl-proj">
                  <Image src={`/projects/${p.file}`} alt={p.title} fill sizes="260px" style={{ objectFit: 'cover' }} />
                  <span className={`pl-pill ${p.track === AI ? 'gold' : ''}`}>{p.track}</span>
                  <figcaption>
                    <b>{p.title}</b>
                    {p.student && <small>{p.student}</small>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
          <div className="pl-wrap pl-center" style={{ marginTop: 44 }}>
            <a href={primaryHref} className="pl-btn pl-btn-dark pl-btn-lg">{primaryCta} <Arrow /></a>
          </div>
        </section>

        {/* ============ BEFORE / AFTER ============ */}
        <Section
          tone={tone()}
          title={schools ? 'شاهدوا طلابكم ينتقلون من التردّد إلى ثقة البنّائين' : 'شاهدوه ينتقل من الفضول إلى الثقة'}
          sub={schools ? 'هذا التحوّل تلاحظه المدارس: ليس لوحة صدارة، بل تغيّر حقيقي في طريقة عمل الطلاب.' : 'ليس نظام نقاط، بل ما يتغيّر فعليًا خلال أشهر من المهام.'}
        >
          <div className="pl-ba">
            <div className="pl-card pl-before">
              <span className="pl-tag">قبل</span>
              <ul>
                {(schools
                  ? ['متردّد، لا يعرف من أين يبدأ', 'يحتاج متابعة مستمرة', 'التفاعل يتراجع بعد الأسبوع الأول']
                  : ['لم يكتب سطر برمجة من قبل', 'هادئ في المجموعة، سريع الاستسلام', 'وقت شاشة بلا أي حصيلة']
                ).map((t) => <li key={t}><i />{t}</li>)}
              </ul>
            </div>
            <div className="pl-ba-arrow" aria-hidden><Arrow /></div>
            <div className="pl-card pl-after">
              <span className="pl-tag pl-tag-teal">بعد ٣ أشهر</span>
              <ul>
                {(schools
                  ? ['يتحدّث ويعرض بثقة', 'يبني ويُنجز مشاريع حقيقية', 'يحلّ المشكلات بمفرده']
                  : ['يعرض فكرته دون تردّد', 'يبني تطبيقه أو لعبته الخاصة', 'يصحّح أخطاءه دون طلب مساعدة']
                ).map((t) => <li key={t}><Check light />{t}</li>)}
              </ul>
            </div>
          </div>
        </Section>

        {/* ============ CASE STUDY (schools) ============ */}
        {schools && (
          <Section tone={tone()}>
            <div className="pl-case">
              <div className="pl-glow pl-glow-sm" aria-hidden />
              <div style={{ position: 'relative' }}>
                <span className="pl-tag pl-tag-teal">دراسة حالة</span>
                <h2 className="pl-h2" style={{ color: 'var(--pl-cream)', marginTop: 16 }}>ماذا يحدث حين يتفاعل الشريك</h2>
                <p className="pl-sub" style={{ color: 'var(--pl-muted-d)' }}>
                  نظّمنا مسابقة وطنية في البرمجة والذكاء الاصطناعي مع ٨ شركاء من المدارس ومراكز التدريب.
                  حيثما روّج الشريك للمسابقة بين طلابه، تبعتها المشاركة. شراكة واحدة مع أحد مراكز التدريب
                  حقّقت وحدها مشاركة حقيقية ومستمرة.
                </p>
                <a href="mailto:hello@plulai.com" className="pl-btn pl-btn-primary" style={{ marginTop: 26 }}>احجز عرضًا تجريبيًا <Arrow /></a>
              </div>
              <div className="pl-casestats" style={{ position: 'relative' }}>
                {[
                  ['٨', 'شركاء من المدارس ومراكز التدريب في أول مسابقة لنا'],
                  ['٧٠', 'مشاركًا من شريك واحد متفاعل من مراكز التدريب'],
                  ['٤٠', 'طفلًا في تجربة كشفية حضورية لمدة يومين'],
                  ['٣', 'لغات تُدرَّس بأصالة: العربية والفرنسية والإنجليزية'],
                ].map(([num, label]) => (
                  <div key={label}><b>{num}</b><span>{label}</span></div>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* ============ PRICING ============ */}
        {schools ? (
          <Section
            id="plans" tone={tone()}
            title="باقة بحجم مؤسستكم"
            sub="كل باقة تشمل المسار الكامل ولوحة تحكم الإدارة. يُحدَّد السعر حسب عدد المقاعد ومدة الفصل، فاحجز عرضًا تجريبيًا للحصول على عرض سعر."
          >
            <div className="pl-grid pl-grid-3 pl-plans">
              {packages.map((p) => (
                <div key={p.name} className={`pl-card pl-plan ${p.hi ? 'hi' : ''}`}>
                  {p.hi && <span className="pl-flag">الأكثر طلبًا</span>}
                  <h3>{p.name}</h3>
                  <small>{p.seats}</small>
                  <p>{p.blurb}</p>
                  <ul>{p.features.map((f) => <li key={f}><Check light={p.hi} />{f}</li>)}</ul>
                  <a href="mailto:hello@plulai.com" className={`pl-btn pl-btn-block ${p.hi ? 'pl-btn-primary' : 'pl-btn-ghost'}`}>{p.cta}</a>
                </div>
              ))}
            </div>
          </Section>
        ) : (
          <Section
            id="plans" tone={tone()}
            title="باقة واحدة، كل شيء متضمّن"
            sub="جرّبها مجانًا لمدة ١٤ يومًا. ألغِ في أي وقت قبل انتهاء التجربة ولن يُخصم منك شيء."
          >
            <div className="pl-card pl-plan hi pl-single">
              <span className="pl-flag">تجربة مجانية ١٤ يومًا</span>
              <p className="pl-price"><b>$20</b> دولار / شهريًا</p>
              <small>بعد انتهاء التجربة، فوترة شهرية، ألغِ في أي وقت</small>
              <ul>
                {['حصة مباشرة أونلاين كل أسبوع (٩٠ دقيقة)', 'وصول مفتوح للمنصّة للعب والتدرّب في أي وقت', 'المسار الكامل: شرارة، بناء، تفكير، انطلاق', 'مدرّب ذكاء اصطناعي غير محدود', 'ملخّص أسبوعي لولي الأمر', 'عربي وفرنسي وإنجليزي'].map((f) => (
                  <li key={f}><Check light />{f}</li>
                ))}
              </ul>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="pl-btn pl-btn-wa pl-btn-block"><WhatsApp /> ابدأ عبر واتساب</a>
            </div>
            <p className="pl-foot" style={{ maxWidth: 560, marginInline: 'auto' }}>
              نجمع فقط ما يلزم لتشغيل المهام وتتبّع التقدّم، ولا تُباع البيانات ولا تُستخدم للإعلانات.{' '}
              <a href="mailto:hello@plulai.com" className="pl-link">أسئلة عن بيانات طفلكم؟</a>
            </p>
          </Section>
        )}

        {/* ============ TESTIMONIALS ============ */}
        <Section tone={tone()} title="ماذا يقول الأهالي والمديرون">
          <div className="pl-grid pl-grid-3">
            {testimonials.map((t) => (
              <figure key={t.n} className="pl-card pl-quote">
                <span className="pl-qmark" aria-hidden>&ldquo;</span>
                <blockquote>{t.q}</blockquote>
                <figcaption>
                  <span className="pl-avatar">{t.i}</span>
                  <span><b>{t.n}</b><small>{t.r}</small></span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>

        {/* ============ SECURITY (schools) ============ */}
        {schools && (
          <section id="security" className={`pl-sec pl-${tone()}`}>
            <div className="pl-wrap pl-secwrap">
              <div className="pl-seccard">
                <span className="pl-shield" aria-hidden>
                  <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z" /><path d="M8.5 12l2.5 2.5L15.5 10" /></svg>
                </span>
                <h2>بيانات يمكن لقسم تقنية المعلومات لديكم الموافقة عليها</h2>
                <p>خصوصية الطالب هي الإعداد الافتراضي، لا إضافة لاحقة.</p>
                <ul>
                  {['لا تُباع ولا تُستخدم للإعلانات', 'كل دور يرى ما يحتاجه فقط', 'استضافة إقليمية عند الحاجة'].map((t) => (
                    <li key={t}><Check />{t}</li>
                  ))}
                </ul>
                <a href={`mailto:hello@plulai.com?subject=${encodeURIComponent('وثائق التعامل مع البيانات')}`} className="pl-btn pl-btn-primary">
                  اطلبوا وثائقنا <Arrow />
                </a>
              </div>

              <div className="pl-secgrid">
                {security.map((x) => (
                  <div key={x.title} className="pl-seccell" style={{ ['--c' as string]: x.color }}>
                    <span className="pl-secico">{x.icon}</span>
                    <small>{x.label}</small>
                    <h3>{x.title}</h3>
                    <p>{x.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ============ FAQ ============ */}
        <Section tone={tone()} title="أسئلة متكرّرة من العائلات والمدارس">
          <div className="pl-faq">
            {visibleFaqs.map((f, i) => {
              const open = openFaq === i
              return (
                <div key={f.q} className={`pl-faqitem ${open ? 'open' : ''}`}>
                  <button type="button" aria-expanded={open} onClick={() => setOpenFaq(open ? null : i)}>
                    {f.q}
                    <span aria-hidden>+</span>
                  </button>
                  {open && <p>{f.a}</p>}
                </div>
              )
            })}
          </div>
        </Section>

        {/* ============ FINAL CTA ============ */}
        <section className={`pl-sec pl-${tone()}`} style={{ paddingTop: 24 }}>
          <div className="pl-wrap">
            <div className="pl-final">
              <div className="pl-glow pl-glow-sm" aria-hidden />
              <div style={{ position: 'relative' }}>
                <h2>{schools ? 'مستعدّون لإدخال Plulai إلى مدرستكم؟' : 'مستعدّون لمنحه انطلاقة مبكرة؟'}</h2>
                <p>
                  {schools
                    ? 'انضموا إلى المدارس ومراكز التدريب التي تبني الجيل القادم من مبدعي المنطقة.'
                    : 'انضموا إلى العائلات في المنطقة التي تبني لأطفالها أول سلسلة لآلئ.'}
                </p>
                <div className="pl-row" style={{ justifyContent: 'center' }}>
                  <a href={primaryHref} className="pl-btn pl-btn-primary pl-btn-lg">{primaryCta} <Arrow /></a>
                  <a href={secondary.href} className="pl-btn pl-btn-glass pl-btn-lg">{secondary.label}</a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="pl-footer">
        <div className="pl-wrap">
          <div className="pl-footgrid">
            <div>
              <p className="pl-wordmark">Plulai</p>
              <p className="pl-footnote">نبني بناة الغد، اليوم. لمنطقة الشرق الأوسط وشمال أفريقيا.</p>
              <p className="pl-entity">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
                <span><b>Plulai Consulting FZCO</b>شركة إماراتية · DTEC، واحة دبي للسيليكون (DSO)، دبي</span>
              </p>
            </div>
            <div>
              <h4>المنتج</h4>
              <a href="#path">المسار</a>
              <a href="#plans">الأسعار</a>
            </div>
            <div>
              <h4>لك أنت</h4>
              <a href="#audience" onClick={() => pick('schools')}>للمدارس</a>
              <a href="#audience" onClick={() => pick('family')}>للعائلات</a>
            </div>
            <div>
              <h4>الشركة</h4>
              <a href="/about">من نحن</a>
              <a href="/" lang="en" hrefLang="en">English</a>
            </div>
          </div>
          <div className="pl-footbottom">
            <span>© 2026 Plulai Consulting FZCO. جميع الحقوق محفوظة.</span>
            <span>الخصوصية · الشروط</span>
          </div>
        </div>
      </footer>
    </div>
  )
}