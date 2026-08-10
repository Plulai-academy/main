// File: page.tsx
// Placement: app/ar/page.tsx
//
// Ported from the updated app/page.tsx (B2B focus, new logo, camel mascot,
// illustrated tracks, tabbed "How it works", case study, packages,
// security & compliance, FAQ). Reuses ../page.module.css as-is — that file
// uses logical inline-start/end CSS properties plus flex/grid, which mirror
// automatically under dir="rtl". The .arRoot class (bottom of
// page.module.css) swaps in an Arabic font stack.
//
// MANUAL RTL MIRRORING — anywhere the English file uses inline left/right,
// text-align, or margin-left/right, it's been flipped here since inline
// styles don't auto-mirror the way the CSS module's logical properties do:
//   - hero float badges (left/right swapped)
//   - tracks section: doodle stars, sticker "STOP" tags, decorative dashed
//     path (mirrored via scaleX(-1))
//   - how-it-works tabs: text-align left -> right
//   - FAQ: text-align + icon margin flipped
//   - arrow glyphs: &rarr; -> &larr;

'use client'

import { useState } from 'react'
import styles from '../page.module.css'
import Image from 'next/image'

const partners = [
  { name: 'شريك ١', file: 'p1.png' },
  { name: 'شريك ٢', file: 'p2.png' },
  { name: 'شريك ٣', file: 'p3.png' },
  { name: 'شريك ٤', file: 'p4.png' },
  { name: 'شريك ٥', file: 'p5.png' },
  { name: 'شريك ٦', file: 'p6.png' },
  { name: 'شريك ٧', file: 'p7.png' },
  { name: 'شريك ٨', file: 'p8.png' },
  { name: 'شريك ٩', file: 'p9.png' },
  { name: 'شريك ١٠', file: 'p10.png' },
  { name: 'شريك ١١', file: 'p11.png' },
]

const projects = [
  { file: '1.png', title: 'شاهد مع الأصدقاء', track: 'البرمجة', tagColor: 'reef', student: 'سارة، ١٥ سنة' },
  { file: '2.png', title: 'لعبة الهروب', track: 'ألعاب', tagColor: 'reef', student: 'كمر، ١٥ سنة' },
  { file: '3.png', title: 'مسابقة الدول', track: 'ألعاب', tagColor: 'reef', student: 'فرح، ١٥ سنة' },
  { file: '4.png', title: 'خمّن العلم', track: 'ألعاب', tagColor: 'reef', student: 'مريم، ١٢ سنة' },
  { file: '5.png', title: 'قارئ الوصفات الطبية', track: 'الذكاء الاصطناعي', tagColor: 'gold', student: 'يوسف، ١٥ سنة' },
  { file: '6.png', title: 'إدارة الفعاليات', track: 'البرمجة', tagColor: 'reef', student: 'كمر، ١٤ سنة' },
  { file: '7.png', title: 'سودوكو', track: 'ألعاب', tagColor: 'reef', student: 'كمر، ١٥ سنة' },
  { file: '8.png', title: 'الطبيب الذكي', track: 'الذكاء الاصطناعي', tagColor: 'gold', student: 'ياسين، ١١ سنة' },
  { file: '10.png', title: 'لعبة التلوين', track: 'ألعاب', tagColor: 'reef', student: 'كمر، ١٥ سنة' },
  { file: '11.png', title: 'المساعد الجيولوجي', track: 'الذكاء الاصطناعي', tagColor: 'gold', student: 'أحمد، ١٣ سنة' },
  { file: '12.png', title: 'لعبة', track: 'ألعاب', tagColor: 'reef', student: 'عبد الرحمن، ١٢ سنة' },
  { file: '13.png', title: 'لعبة المتاهة', track: 'ألعاب', tagColor: 'reef', student: 'سارة، ١٤ سنة' },
  { file: '14.png', title: 'الذكاء الاصطناعي للتأمل', track: 'الذكاء الاصطناعي', tagColor: 'gold', student: 'يحيى، ١٢ سنة' },
  { file: '15.png', title: 'لعبة كرة القدم', track: 'البرمجة', tagColor: 'reef', student: 'عثمان، ١٠ سنوات' },
  { file: '17.png', title: 'اصنعها بنفسك بالذكاء الاصطناعي', track: 'الذكاء الاصطناعي', tagColor: 'gold', student: '' },
  { file: '18.png', title: 'لعبة المتتاليات', track: 'ألعاب', tagColor: 'reef', student: 'مريم، ١٤ سنة' },
  { file: '19.png', title: 'سباق الأعلام', track: 'البرمجة', tagColor: 'reef', student: 'فرح، ١٥ سنة' },
]

export default function LandingPageAr() {
  const [navOpen, setNavOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [activeStep, setActiveStep] = useState(0)

  return (
    <main dir="rtl" lang="ar" className={styles.arRoot}>
      {/* ================= NAV ================= */}
      <nav className={styles.nav}>
        <div className="container">
          <div className={styles.navRow}>
            <a href="/ar" aria-label="Plulai — الصفحة الرئيسية" style={{ display: 'flex', alignItems: 'center' }}>
              <Image
                src="/plulai_logo_dark_transparent.png"
                alt="Plulai"
                width={132}
                height={36}
                priority
                style={{ height: 'auto', width: 'auto', maxHeight: 36 }}
              />
            </a>

            <div className={styles.navLinks} style={{ color: '#0D2B32' }}>
              <a href="#tracks" style={{ color: '#0D2B32' }}>المسارات</a>
              <a href="#schools" style={{ color: '#0D2B32', fontWeight: 600 }}>للمدارس</a>
            </div>

            <div className={styles.navRight}>
              <a href="/ar/auth/login" style={{ color: '#0D2B32' }}>تسجيل الدخول</a>
              <a href="#schools"><button className="btn btn-dark">احجز عرضًا تجريبيًا &larr;</button></a>
            </div>

            <button
              type="button"
              className={styles.burger}
              aria-label={navOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
              aria-expanded={navOpen}
              onClick={() => setNavOpen((v) => !v)}
            >
              <span className={navOpen ? styles.burgerTopOpen : ''} />
              <span className={navOpen ? styles.burgerMidOpen : ''} />
              <span className={navOpen ? styles.burgerBotOpen : ''} />
            </button>
          </div>

          <div className={`${styles.mobilePanel} ${navOpen ? styles.mobilePanelOpen : ''}`}>
            <a href="#tracks" onClick={() => setNavOpen(false)} style={{ color: '#0D2B32' }}>المسارات</a>
            <a href="#schools" onClick={() => setNavOpen(false)} style={{ color: '#0D2B32', fontWeight: 600 }}>للمدارس</a>
            <div className={styles.mobilePanelDivider} />
            <a href="/ar/auth/login" onClick={() => setNavOpen(false)} style={{ color: '#0D2B32' }}>تسجيل الدخول</a>
            <a href="#schools" onClick={() => setNavOpen(false)}>
              <button className="btn btn-cta btn-block">احجز عرضًا تجريبيًا &larr;</button>
            </a>
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <div className={styles.hero}>
        <span aria-hidden className={styles.heroWatermark}>/</span>
        <div className="container">
          <div className={styles.heroGrid}>
            <div>
              <div className={styles.statBadge}>
                <span className={styles.statDot} />
                +١١ شريكًا في منطقة الشرق الأوسط وشمال أفريقيا
              </div>
              <h1 className={styles.heroTitle}>
                منهج في البرمجة والذكاء الاصطناعي وريادة الأعمال يمكن لمدرستكم تطبيقه.
              </h1>
              <p className={styles.heroSub}>
                ١٥ دقيقة يوميًا، بالعربية أو الفرنسية أو الإنجليزية — مع مدرّب ذكاء
                اصطناعي مصمَّم على طريقة تعلّم الأطفال الحقيقية، ولوحة تحكم تنبّه لمن
                يواجه صعوبة قبل أن تظهر في بطاقة التقرير.
              </p>
              <div className={styles.ctaRow}>
                <a href="#schools"><button className="btn btn-cta">احجز عرضًا تجريبيًا &larr;</button></a>
                <a href="mailto:hello@plulai.com"><button className="btn btn-outline">تحدّث مع فريقنا</button></a>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <Image
                src="/avatars/marjanthecamel.png"
                alt="مرجان الجمل، تعويذة Plulai"
                width={280}
                height={280}
                priority
              />

              {/* mirrored: left:-10 on the en page */}
              <div className={styles.floatBadge} style={{ top: 0, right: -10 }}>
                <span className="pearl-dot pearl-dot--md" />
                <div>
                  <div className={styles.floatBadgeTitle}>٤ لآلئ متتالية</div>
                  <div className={styles.floatBadgeSub}>لؤلؤة واحدة اليوم</div>
                </div>
              </div>

              {/* mirrored: right:-20 on the en page */}
              <div className={styles.floatBadge} style={{ bottom: 20, left: -20 }}>
                <svg width={20} height={20} viewBox="0 0 20 20">
                  <path d="M10 2 L17 7 L17 18 L3 18 L3 7 Z" fill="#1FB8A6" />
                </svg>
                <div>
                  <div className={styles.floatBadgeTitle}>الوصول للمستوى ٥</div>
                  <div className={styles.floatBadgeSub}>فارس · البرمجة</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.divider}>
        <svg viewBox="0 0 1440 70" preserveAspectRatio="none">
          <path d="M0,30 C240,80 480,0 720,25 C960,50 1200,10 1440,35 L1440,70 L0,70 Z" fill="#F6F3EA" />
        </svg>
      </div>

      {/* ================= PARTNERS ================= */}
      <div className={styles.partnersSec}>
        <div className="container">
          <p className={styles.partnersLabel}>يُستخدم في فصول دراسية وبرامج حقيقية</p>
          <div className={styles.partnerRow}>
            {partners.map((partner) => (
              <div key={partner.name} className={styles.partnerTile}>
                <Image
                  src={`/partners/${partner.file}`}
                  alt={partner.name}
                  width={120}
                  height={48}
                  className={styles.partnerLogo}
                />
              </div>
            ))}
          </div>
          <p className={styles.partnersSub}>
            مدارس · برامج كشفية · مراكز مجتمعية وتدريبية
          </p>
        </div>
      </div>

      {/* ================= SCHOOLS ================= */}
      <div id="schools" className={styles.schoolsSec}>
        <div className="container">
          <div className={styles.schoolsGrid}>
            <div>
              <span className="pill">للمدارس والمؤسسات</span>
              <h2 style={{ marginTop: 18 }}>أدخل Plulai إلى فصلك الدراسي.</h2>
              <p style={{ color: 'rgba(41,57,74,0.7)', maxWidth: 460 }}>
                منهج يستطيع معلّموك تطبيقه — مع لوحة تحكم تنبّه لمن يواجه صعوبة قبل
                أن تظهر في بطاقة التقرير.
              </p>
              <div className={styles.schoolsList}>
                <div className={styles.schoolsItem}>
                  <b>من ٥٠ إلى ٥٬٠٠٠ مقعد</b>
                  <span>تسعير إقليمي، فوترة مرنة.</span>
                </div>
                <div className={styles.schoolsItem}>
                  <b>منهج عربي وفرنسي وإنجليزي</b>
                  <span>مبني لفصول منطقة الشرق الأوسط وشمال أفريقيا، لا مترجم من مكان آخر.</span>
                </div>
                <div className={styles.schoolsItem}>
                  <b>دعم مخصص</b>
                  <span>تأهيل، تدريب، ومسؤول نجاح مخصص.</span>
                </div>
              </div>
              <div className={styles.ctaRow}>
                <a href="/ar/schools">
                  <button className="btn btn-dark">استكشف الخيارات للمدارس &larr;</button>
                </a>
                <a href="mailto:hello@plulai.com">
                  <button className="btn btn-outline">احجز عرضًا تجريبيًا &larr;</button>
                </a>
              </div>
            </div>

            <div className={styles.dashMock}>
              <div className={styles.dashBar}>
                <div className={styles.dashDot} />
                <div className={styles.dashDot} />
                <div className={styles.dashDot} />
              </div>
              <p style={{ color: '#F6F3EA', fontWeight: 700, marginBottom: 14 }}>
                الصف الخامس ب — مسار البرمجة
              </p>
              <div className={styles.rosterRow}><span>سارة ك.</span><span>80%</span></div>
              <div className={styles.rosterRow}><span>علي م.</span><span>45%</span></div>
              <div className={styles.rosterRow}><span>فاطمة ر.</span><span>92%</span></div>
              <div className={styles.rosterRow}>
                <span>يوسف أ. <span style={{ color: '#D4A24C' }}>· متعثر</span></span>
                <span>15%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= HOW IT WORKS ================= */}
      <div className={styles.tracksSec}>
        <style>{`
          @media (max-width: 760px) {
            .how-grid { grid-template-columns: 1fr !important; }
            .how-tabs { flex-direction: row !important; overflow-x: auto; gap: 10px !important; padding-bottom: 6px; }
            .how-tab { flex: 0 0 auto !important; white-space: nowrap; }
          }
        `}</style>
        <div className="container">
          <div className={styles.tracksHead}>
            <p className="eyebrow">كيف تسير العملية</p>
            <h2>من العرض التجريبي إلى التطبيق الكامل</h2>
            <p style={{ color: 'rgba(41,57,74,0.7)', maxWidth: 520, margin: '10px auto 0' }}>
              معظم المدارس تنتقل من أول مكالمة إلى فصل دراسي كامل خلال أقل من شهر.
            </p>
          </div>

          {(() => {
            const steps = [
              {
                n: '٠١', title: 'احجز عرضًا تجريبيًا', color: '#1FB8A6',
                desc: 'جولة تعريفية مدتها ٣٠ دقيقة مصمَّمة حسب صفوفكم وأهدافكم — شاهد واجهة الطالب، وواجهة المعلّم، ولوحة تحكم الإدارة.',
                preview: (
                  <>
                    <p style={{ color: '#F6F3EA', fontWeight: 700, marginBottom: 14 }}>هذا الأسبوع</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 16 }}>
                      {['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'].map((d, idx) => (
                        <div
                          key={d + idx}
                          style={{
                            aspectRatio: '1', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 600,
                            background: idx === 3 ? '#1FB8A6' : 'rgba(255,255,255,0.08)',
                            color: idx === 3 ? '#0D2B32' : '#B7C9C5',
                          }}
                        >
                          {d}
                        </div>
                      ))}
                    </div>
                    <div className={styles.rosterRow}><span>عرض تجريبي · الأربعاء، ١٠:٠٠ ص</span><span style={{ color: '#1FB8A6' }}>محجوز</span></div>
                  </>
                ),
              },
              {
                n: '٠٢', title: 'تجربة فصل واحد', color: '#D4A24C',
                desc: 'شغّل تجربة مجانية مع فصل واحد قبل الالتزام على مستوى المدرسة كاملة — وصول كامل، بلا تكلفة، وبلا ضغط للاستمرار.',
                preview: (
                  <>
                    <p style={{ color: '#F6F3EA', fontWeight: 700, marginBottom: 14 }}>الصف الخامس ب — تجريبي</p>
                    <div className={styles.rosterRow}><span>سارة ك.</span><span>80%</span></div>
                    <div className={styles.rosterRow}><span>علي م.</span><span>45%</span></div>
                    <div className={styles.rosterRow}><span>فاطمة ر.</span><span>92%</span></div>
                  </>
                ),
              },
              {
                n: '٠٣', title: 'درّب معلّميك', color: '#0D2B32',
                desc: 'جلسة تأهيل قصيرة — لا حاجة لخلفية برمجية. يغادر المعلّمون وهم متمكّنون تمامًا من المنصّة ولوحة التحكم.',
                preview: (
                  <>
                    <p style={{ color: '#F6F3EA', fontWeight: 700, marginBottom: 14 }}>قائمة التأهيل</p>
                    {['جولة على المنصّة', 'التقييم ولوحة التحكم', 'جلسة أسئلة وأجوبة مباشرة'].map((item) => (
                      <div key={item} className={styles.rosterRow}>
                        <span>{item}</span>
                        <span style={{ color: '#1FB8A6' }}>✓</span>
                      </div>
                    ))}
                  </>
                ),
              },
              {
                n: '٠٤', title: 'التطبيق على مستوى المدرسة', color: '#053D35',
                desc: 'التوسّع ليشمل الصف الكامل أو المدرسة كاملة، مع لوحة تحكم للإدارة تنبّه لمن يواجه صعوبة قبل أن تظهر في بطاقة التقرير.',
                preview: (
                  <>
                    <p style={{ color: '#F6F3EA', fontWeight: 700, marginBottom: 14 }}>تقدّم التطبيق</p>
                    {[{ g: 'الصف الرابع', v: 82 }, { g: 'الصف الخامس', v: 91 }, { g: 'الصف السادس', v: 76 }].map((row) => (
                      <div key={row.g} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#B7C9C5', marginBottom: 4 }}>
                          <span>{row.g}</span><span>{row.v}%</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 4, background: 'rgba(255,255,255,0.1)' }}>
                          <div style={{ height: 6, borderRadius: 4, width: `${row.v}%`, background: '#1FB8A6' }} />
                        </div>
                      </div>
                    ))}
                  </>
                ),
              },
            ]
            const step = steps[activeStep]
            return (
              <div className="how-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 40, marginTop: 48, alignItems: 'start' }}>
                <div className="how-tabs" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {steps.map((s, i) => {
                    const active = i === activeStep
                    return (
                      <button
                        key={s.n}
                        type="button"
                        className="how-tab"
                        onClick={() => setActiveStep(i)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 14, textAlign: 'right',
                          padding: '16px 18px', borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit',
                          border: active ? 'none' : '1px solid #E4E9E7',
                          background: active ? '#0D2B32' : '#fff',
                        }}
                      >
                        <span
                          style={{
                            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12.5, fontWeight: 700,
                            background: active ? s.color : '#F1F5F4',
                            color: active ? (s.color === '#D4A24C' ? '#402F12' : '#fff') : '#5C7873',
                          }}
                        >
                          {s.n}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: 14.5, color: active ? '#F6F3EA' : '#0D2B32' }}>
                          {s.title}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <div>
                  <div className={styles.dashMock}>
                    <div className={styles.dashBar}>
                      <div className={styles.dashDot} />
                      <div className={styles.dashDot} />
                      <div className={styles.dashDot} />
                    </div>
                    {step.preview}
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.65, color: 'rgba(41,57,74,0.75)', marginTop: 20 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            )
          })()}

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <a href="#schools">
              <button className="btn btn-cta">احجز عرضًا تجريبيًا &larr;</button>
            </a>
          </div>
        </div>
      </div>

      {/* ================= TRACKS: illustrated path ================= */}
      <div id="tracks" className={styles.tracksSec} style={{ overflow: 'hidden' }}>
        <style>{`
          .trk-card { transition: transform .25s ease, box-shadow .25s ease; }
          .trk-card:hover { transform: translateY(-6px) rotate(0deg) !important; box-shadow: 0 18px 30px rgba(13,43,50,0.14) !important; }
          @media (max-width: 760px) {
            .trk-card { transform: none !important; }
            .trk-row { flex-direction: column; align-items: center !important; }
            .trk-path { display: none; }
          }
        `}</style>
        <div className="container">
          <div className={styles.tracksHead} style={{ position: 'relative' }}>
            <p className="eyebrow">نظرة على المنهج</p>
            <h2 style={{ display: 'inline-block', position: 'relative' }}>
              ما الذي سيتعلّمه طلابكم
              <svg
                width="280" height="14" viewBox="0 0 280 14"
                style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: -10 }}
                aria-hidden
              >
                <path d="M4 8 Q40 -2 76 8 T148 8 T220 8 T276 8" stroke="#D4A24C" strokeWidth={3} fill="none" strokeLinecap="round" />
              </svg>
            </h2>
            <p style={{ color: 'rgba(41,57,74,0.7)', maxWidth: 520, margin: '22px auto 0' }}>
              ثلاثة مسارات، طريق واحد — كل درس يفتح المحطة التالية، مرتّبة حسب
              العمر لتنطبق مباشرة على حصّة دراسية أو نشاط بعد المدرسة.
            </p>
            <span
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 18,
                padding: '7px 15px', borderRadius: 999, background: '#EAF6F3',
                color: '#0D2B32', fontSize: 13, fontWeight: 600,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1FB8A6' }} />
              مبني للمدارس، درسًا بعد درس
            </span>
          </div>

          <div style={{ position: 'relative', marginTop: 64, paddingBottom: 30 }}>
            {/* dashed path connecting the three stops, decorative — mirrored via scaleX(-1) for RTL */}
            <svg
              className="trk-path"
              viewBox="0 0 1000 120" preserveAspectRatio="none"
              style={{ position: 'absolute', top: 60, left: 0, width: '100%', height: 120, zIndex: 0, transform: 'scaleX(-1)' }}
              aria-hidden
            >
              <path
                d="M110 100 C 250 20, 400 20, 500 60 S 750 100, 890 20"
                stroke="#C9DAD5" strokeWidth={3} strokeDasharray="2 14" strokeLinecap="round" fill="none"
              />
              <circle cx="110" cy="100" r="6" fill="#1FB8A6" />
              <circle cx="500" cy="60" r="6" fill="#D4A24C" />
              <circle cx="890" cy="20" r="6" fill="#053D35" />
            </svg>

            {/* stray doodle stars — left/right swapped for RTL */}
            <svg width="22" height="22" viewBox="0 0 22 22" style={{ position: 'absolute', top: -30, right: '18%', opacity: 0.6 }} aria-hidden>
              <path d="M11 0 L13 9 L22 11 L13 13 L11 22 L9 13 L0 11 L9 9 Z" fill="#D4A24C" />
            </svg>
            <svg width="14" height="14" viewBox="0 0 22 22" style={{ position: 'absolute', top: 10, left: '12%', opacity: 0.5 }} aria-hidden>
              <path d="M11 0 L13 9 L22 11 L13 13 L11 22 L9 13 L0 11 L9 9 Z" fill="#1FB8A6" />
            </svg>

            <div
              className="trk-row"
              style={{
                position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap',
                justifyContent: 'center', alignItems: 'flex-start', gap: 32,
              }}
            >
              {/* Coding */}
              <div
                className="trk-card"
                style={{
                  width: 272, background: '#fff', borderRadius: 22, padding: '30px 24px 26px',
                  border: '2px solid #0D2B32', boxShadow: '0 8px 0 #0D2B32',
                  transform: 'rotate(3deg)', position: 'relative',
                }}
              >
                <span
                  style={{
                    position: 'absolute', top: -14, right: 20, transform: 'rotate(6deg)',
                    background: '#0D2B32', color: '#fff', fontSize: 11.5, fontWeight: 700,
                    padding: '5px 12px', borderRadius: 8, letterSpacing: 0.3,
                  }}
                >
                  المحطة ٠١ · الأعمار ٨–١٦
                </span>
                <div
                  style={{
                    width: 76, height: 76, margin: '18px auto 16px',
                    borderRadius: '63% 37% 54% 46% / 55% 45% 45% 55%',
                    background: 'linear-gradient(135deg, #1FB8A6, #17948A)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <span className="font-mono" style={{ fontWeight: 700, fontSize: 24, color: '#fff' }}>{'{ }'}</span>
                </div>
                <p style={{ fontWeight: 700, fontSize: 19, color: '#0D2B32', margin: '0 0 8px', textAlign: 'center' }}>
                  البرمجة
                </p>
                <p style={{ color: 'rgba(41,57,74,0.7)', fontSize: 14, lineHeight: 1.55, margin: '0 0 16px', textAlign: 'center' }}>
                  من المكعبات إلى بايثون الحقيقية — يبني الطلاب تطبيقات وألعابًا فعلية.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 18 }}>
                  {['المنطق', 'بايثون', 'تصحيح الأخطاء'].map((t) => (
                    <span key={t} style={{ fontSize: 11.5, fontWeight: 600, color: '#0D2B32', background: '#EAF6F3', padding: '4px 10px', borderRadius: 999 }}>
                      {t}
                    </span>
                  ))}
                </div>
                <p style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, color: '#1FB8A6', margin: 0 }}>+١٨٠ درسًا ←</p>
              </div>

              {/* AI & Future Tech — raised, center stop */}
              <div
                className="trk-card"
                style={{
                  width: 272, background: '#fff', borderRadius: 22, padding: '30px 24px 26px',
                  border: '2px solid #402F12', boxShadow: '0 8px 0 #D4A24C',
                  transform: 'translateY(-18px) rotate(-2deg)', position: 'relative',
                }}
              >
                <span
                  style={{
                    position: 'absolute', top: -14, right: 20, transform: 'rotate(-4deg)',
                    background: '#D4A24C', color: '#402F12', fontSize: 11.5, fontWeight: 700,
                    padding: '5px 12px', borderRadius: 8, letterSpacing: 0.3,
                  }}
                >
                  المحطة ٠٢ · الأعمار ١٠–١٦
                </span>
                <div
                  style={{
                    width: 76, height: 76, margin: '18px auto 16px',
                    borderRadius: '45% 55% 60% 40% / 50% 45% 55% 50%',
                    background: 'linear-gradient(135deg, #E8BE72, #D4A24C)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <span className="font-mono" style={{ fontWeight: 700, fontSize: 24, color: '#402F12' }}>AI</span>
                </div>
                <p style={{ fontWeight: 700, fontSize: 19, color: '#0D2B32', margin: '0 0 8px', textAlign: 'center' }}>
                  الذكاء الاصطناعي وتقنيات المستقبل
                </p>
                <p style={{ color: 'rgba(41,57,74,0.7)', fontSize: 14, lineHeight: 1.55, margin: '0 0 16px', textAlign: 'center' }}>
                  الأوامر، البيانات، وأساسيات التعلّم الآلي — محو أمّية بالذكاء الاصطناعي من اليوم الأول.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 18 }}>
                  {['الأوامر', 'البيانات', 'أساسيات التعلّم الآلي'].map((t) => (
                    <span key={t} style={{ fontSize: 11.5, fontWeight: 600, color: '#402F12', background: '#FBF1DE', padding: '4px 10px', borderRadius: 999 }}>
                      {t}
                    </span>
                  ))}
                </div>
                <p style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, color: '#D4A24C', margin: 0 }}>+١٦٠ درسًا ←</p>
              </div>

              {/* Entrepreneurship */}
              <div
                className="trk-card"
                style={{
                  width: 272, background: '#fff', borderRadius: 22, padding: '30px 24px 26px',
                  border: '2px solid #053D35', boxShadow: '0 8px 0 #053D35',
                  transform: 'rotate(2deg)', position: 'relative',
                }}
              >
                <span
                  style={{
                    position: 'absolute', top: -14, right: 20, transform: 'rotate(5deg)',
                    background: '#053D35', color: '#fff', fontSize: 11.5, fontWeight: 700,
                    padding: '5px 12px', borderRadius: 8, letterSpacing: 0.3,
                  }}
                >
                  المحطة ٠٣ · الأعمار ١٠–١٦
                </span>
                <div
                  style={{
                    width: 76, height: 76, margin: '18px auto 16px',
                    borderRadius: '50% 50% 38% 62% / 60% 45% 55% 40%',
                    background: 'linear-gradient(135deg, #145048, #053D35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <svg width={26} height={26} viewBox="0 0 20 20">
                    <rect x="2" y="12" width="4" height="6" fill="#fff" />
                    <rect x="8" y="7" width="4" height="11" fill="#fff" />
                    <rect x="14" y="2" width="4" height="16" fill="#fff" />
                  </svg>
                </div>
                <p style={{ fontWeight: 700, fontSize: 19, color: '#0D2B32', margin: '0 0 8px', textAlign: 'center' }}>
                  ريادة الأعمال
                </p>
                <p style={{ color: 'rgba(41,57,74,0.7)', fontSize: 14, lineHeight: 1.55, margin: '0 0 16px', textAlign: 'center' }}>
                  أول مشروع تجاري صغير — التسعير، التسويق، وعرض تقديمي حقيقي.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 18 }}>
                  {['التسعير', 'التسويق', 'العرض التقديمي'].map((t) => (
                    <span key={t} style={{ fontSize: 11.5, fontWeight: 600, color: '#053D35', background: '#EAF6F3', padding: '4px 10px', borderRadius: 999 }}>
                      {t}
                    </span>
                  ))}
                </div>
                <p style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, color: '#053D35', margin: 0 }}>+١٤٠ درسًا ←</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= ALUMNI PROJECTS ================= */}
      <div className={styles.alumniSec}>
        <div className="container">
          <p className="eyebrow">عمل حقيقي، لا مجرد اختبارات</p>
          <h2>ما يبنيه الأطفال فعليًا</h2>
          <p className={styles.alumniIntro}>
            كل مسار ينتهي بمشروع حقيقي، لا بشهادة للنقر على الشرائح.
          </p>
        </div>

        <div className={styles.projectCarousel}>
          {projects.map((project) => (
            <div key={project.file} className={styles.projectSlide}>
              <div className={styles.projectShot}>
                <Image
                  src={`/projects/${project.file}`}
                  alt={project.title}
                  fill
                  className={styles.projectImg}
                  sizes="(max-width: 640px) 80vw, 320px"
                />
              </div>
              <span className={`tag-mono tag-mono--${project.tagColor}`}>{project.track}</span>
              <p className={styles.projectTitle}>{project.title}</p>
              <p className={styles.projectStudent}>{project.student}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ================= PATH SECTION ================= */}
      <div className={styles.pathSec}>
        <div className="container">
          <p className="eyebrow">مسار اللؤلؤة</p>
          <h2 style={{ color: 'var(--raw-pearlwhite)' }}>مسار يوضّح تمامًا ما هي الخطوة التالية</h2>
          <p style={{ color: '#8FA8A3', maxWidth: 500 }}>
            كل درس مكتمل يفتح مكافأة مضمونة — لا مكافأة عشوائية أبدًا.
          </p>

          <div className={styles.mapGrid}>
            <div>
              <div className={styles.mapNodes}>
                <div className={styles.mapNode} style={{ background: '#17D9C0' }}>
                  <svg width={16} height={16} viewBox="0 0 16 16">
                    <path d="M3 8 L7 12 L13 4" stroke="#053D35" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className={styles.mapLine} />
                <div className={`${styles.mapNode} ${styles.mapNodeCurrent}`} style={{ background: '#FFB930' }}>
                  <span className="font-mono" style={{ fontWeight: 700, color: '#4A3403' }}>/</span>
                </div>
                <div className={styles.mapLine} />
                <div className={styles.mapNode} style={{ background: '#D9F1EC' }}>
                  <LockIcon />
                </div>
                <div className={styles.mapLine} />
                <div className={styles.mapNode} style={{ background: '#D9F1EC' }}>
                  <LockIcon />
                </div>
              </div>

              <div className={styles.hudRow}>
                <div className={styles.hudChip}>
                  لآلئ هذا الأسبوع
                  <b>4 / 5</b>
                </div>
                <div className={styles.hudChip}>
                  نقاط الخبرة للمستوى التالي
                  <b>240 / 300</b>
                </div>
              </div>

              <div className={styles.moduleCard}>
                <p className={styles.moduleTitle}>ابنِ تطبيقك الأول</p>
                <p className={styles.moduleSub}>الوحدة ١ · ٦ دروس · اكتمل ٢ من ٦</p>
                <div className={styles.progTrack}>
                  <div className={styles.progFill} />
                </div>
              </div>
              <a href="#schools">
                <button className="btn btn-cta" style={{ marginTop: 24 }}>
                  احجز عرضًا تجريبيًا &larr;
                </button>
              </a>
            </div>

            <div className={styles.featureList}>
              <div className={styles.featureItem}>
                <div className={styles.iconTile}>
                  <svg width={16} height={16} viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="6.5" stroke="#8FA8A3" strokeWidth={1.5} fill="none" />
                    <path d="M8 4.5 V8 L10.5 9.5" stroke="#8FA8A3" strokeWidth={1.5} fill="none" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <b>١٥ دقيقة، لا ٣٠</b>
                  <span>بحجم مناسب لعادة يومية فعلية.</span>
                </div>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.iconTile}>
                  <svg width={16} height={16} viewBox="0 0 16 16">
                    <path d="M2 3 h12 v7 h-6 l-3 3 v-3 h-3 z" fill="#8FA8A3" />
                  </svg>
                </div>
                <div>
                  <b>مدرّب ذكاء اصطناعي شخصي</b>
                  <span>يتكيّف مع السرعة واللغة، لحظة بلحظة.</span>
                </div>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.iconTile}>
                  <svg width={16} height={16} viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="6" fill="#D4A24C" />
                    <circle cx="8" cy="8" r="2.5" fill="#123A42" />
                  </svg>
                </div>
                <div>
                  <b>مكافآت لآلئ مضمونة</b>
                  <span>بلا صناديق حظ — كل درس يُثمر بالطريقة نفسها.</span>
                </div>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.iconTile}>
                  <svg width={16} height={16} viewBox="0 0 16 16">
                    <rect x="2" y="2" width="7" height="7" fill="#8FA8A3" />
                    <rect x="7" y="7" width="7" height="7" fill="#5C7873" />
                  </svg>
                </div>
                <div>
                  <b>مشاريع حقيقية</b>
                  <span>كل وحدة تنتهي بشيء يمكن عرضه.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className={styles.statsSec}>
        <div className="container">
          <div className={styles.statsRow}>
            <div><div className={styles.statNum}>+١١</div><div className={styles.statLabel}>شريك في المنطقة</div></div>
            <div><div className={styles.statNum}>+500</div><div className={styles.statLabel}>درس مصغّر</div></div>
            <div><div className={styles.statNum}>3</div><div className={styles.statLabel}>لغات تدريس</div></div>
            <div><div className={styles.statNum}>9.2/10</div><div className={styles.statLabel}>رضا المستخدمين</div></div>
          </div>
        </div>
      </div>

      {/* ================= CASE STUDY ================= */}
      {/* <div className={styles.tracksSec}>
        <div className="container">
          <div
            style={{
              background: '#0D2B32', borderRadius: 28, padding: '48px 40px',
              display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 40, alignItems: 'center',
            }}
          >
            <div>
              <span
                style={{
                  display: 'inline-block', fontSize: 12, fontWeight: 700, letterSpacing: 0.4,
                  color: '#1FB8A6', background: 'rgba(31,184,166,0.12)', padding: '5px 12px', borderRadius: 999,
                  marginBottom: 18,
                }}
              >
                دراسة حالة
              </span>
              <h2 style={{ color: '#F6F3EA', marginBottom: 14 }}>مدرسة شريكة في تونس</h2>
              <p style={{ color: '#B7C9C5', lineHeight: 1.7, marginBottom: 22 }}>
                جرّبت إحدى مدارسنا الشريكة Plulai مع فصل واحد قبل تعميمه على عدّة
                صفوف. أشارت إدارة المدرسة إلى المنهج الثلاثي اللغة ولوحة تحكم
                الإدارة كعاملين حاسمين مقارنةً بخيارات أخرى جرّبوها.
              </p>
              <a href="mailto:hello@plulai.com">
                <button className="btn btn-cta">احجز عرضًا تجريبيًا &larr;</button>
              </a>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { num: '3 أسابيع', label: 'من التجربة إلى التطبيق الكامل' },
                { num: '+200', label: 'طالب تم تسجيلهم' },
                { num: '↑', label: 'نسبة إكمال الدروس الأسبوعية' },
                { num: '3', label: 'صفوف دراسية مشمولة' },
              ].map((stat) => (
                <div key={stat.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px 16px' }}>
                  <p style={{ color: '#1FB8A6', fontWeight: 700, fontSize: 26, margin: '0 0 6px' }}>{stat.num}</p>
                  <p style={{ color: '#B7C9C5', fontSize: 13, margin: 0, lineHeight: 1.4 }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <p style={{ textAlign: 'center', fontSize: 12.5, color: 'rgba(41,57,74,0.45)', marginTop: 14 }}>
            مثال توضيحي — استبدله بأرقام تجربة حقيقية عند توفّرها للنشر.
          </p>
        </div>
      </div> */}

      {/* ================= PACKAGES ================= */}
      <div className={styles.tracksSec}>
        <div className="container">
          <div className={styles.tracksHead}>
            <p className="eyebrow">الباقات</p>
            <h2>باقة بحجم مدرستكم</h2>
            <p style={{ color: 'rgba(41,57,74,0.7)', maxWidth: 520, margin: '10px auto 0' }}>
              كل باقة تشمل المسارات الثلاثة ولوحة تحكم الإدارة. يُحدَّد السعر حسب
              عدد المقاعد ومدة الفصل الدراسي — احجز عرضًا تجريبيًا للحصول على عرض سعر.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, marginTop: 44 }}>
            {[
              {
                name: 'تجربة فصل واحد',
                blurb: 'جرّبها مع فصل واحد قبل اتخاذ القرار على مستوى المدرسة.',
                seats: 'فصل واحد · حتى ٣٥ مقعدًا',
                features: ['المسارات الثلاثة كاملة', 'فصل دراسي واحد', 'جلسة تأهيل للمعلّم'],
                cta: 'ابدأ تجربة',
                highlight: false,
              },
              {
                name: 'على مستوى المدرسة',
                blurb: 'الإعداد الأكثر شيوعًا لتطبيق كامل على مستوى المدرسة.',
                seats: '٥٠–١٬٠٠٠ مقعد',
                features: ['المسارات الثلاثة كاملة', 'لوحة تحكم الإدارة', 'تدريب المعلّمين + دعم', 'عام دراسي كامل'],
                cta: 'احجز عرضًا تجريبيًا',
                highlight: true,
              },
              {
                name: 'على مستوى المنطقة التعليمية',
                blurb: 'عدّة مدارس تحت عقد ولوحة تحكم واحدة.',
                seats: '+١٬٠٠٠ مقعد',
                features: ['كل ما في باقة المدرسة', 'تقارير متعددة المدارس', 'مسؤول نجاح مخصص'],
                cta: 'تواصل مع المبيعات',
                highlight: false,
              },
            ].map((pkg) => (
              <div
                key={pkg.name}
                style={{
                  background: pkg.highlight ? '#0D2B32' : '#fff',
                  border: pkg.highlight ? 'none' : '1px solid #E4E9E7',
                  borderRadius: 20, padding: '30px 26px', display: 'flex', flexDirection: 'column',
                  boxShadow: pkg.highlight ? '0 12px 26px rgba(13,43,50,0.18)' : '0 1px 2px rgba(13,43,50,0.04)',
                }}
              >
                <p style={{ fontWeight: 700, fontSize: 19, margin: '0 0 6px', color: pkg.highlight ? '#F6F3EA' : '#0D2B32' }}>
                  {pkg.name}
                </p>
                <p style={{ fontSize: 13.5, margin: '0 0 4px', color: pkg.highlight ? '#1FB8A6' : '#5C7873', fontWeight: 600 }}>
                  {pkg.seats}
                </p>
                <p style={{ fontSize: 14, lineHeight: 1.55, margin: '10px 0 20px', color: pkg.highlight ? '#B7C9C5' : 'rgba(41,57,74,0.7)' }}>
                  {pkg.blurb}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                  {pkg.features.map((f) => (
                    <li key={f} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 13.5, color: pkg.highlight ? '#F6F3EA' : '#0D2B32' }}>
                      <svg width={14} height={14} viewBox="0 0 16 16" style={{ marginTop: 3, flexShrink: 0 }}>
                        <path d="M3 8 L7 12 L13 4" stroke="#1FB8A6" strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="mailto:hello@plulai.com">
                  <button className={pkg.highlight ? 'btn btn-cta btn-block' : 'btn btn-outline btn-block'}>
                    {pkg.cta} &larr;
                  </button>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.divider}>
        <svg viewBox="0 0 1440 70" preserveAspectRatio="none">
          <path d="M0,40 C300,0 600,70 900,30 C1100,5 1300,45 1440,20 L1440,70 L0,70 Z" fill="#1FB8A6" />
        </svg>
      </div>

      {/* ================= TESTIMONIALS ================= */}
      <div className={styles.testiSec}>
        <div className="container">
          <p className="eyebrow" style={{ textAlign: 'center', opacity: 0.7 }}>المفضّل لدى الأهالي والمديرين</p>
          <h2 style={{ textAlign: 'center' }}>ماذا يقول الناس</h2>

          <div className={styles.testiCluster}>
            <div className={styles.testiBubble}>
              <p className={styles.stars}>★★★★★</p>
              <p className={styles.testiQuote}>
                «ابني البالغ ٩ سنوات يطلب أداء درسه بعد المدرسة. لم أتخيّل يومًا
                أن أرى هذا مع البرمجة.»
              </p>
              <div className={styles.testiPerson}>
                <div className={styles.testiAvatar}>ل</div>
                <div>
                  <p className={styles.testiName}>ليلى م.</p>
                  <p className={styles.testiRole}>وليّة أمر، سوسة</p>
                </div>
              </div>
            </div>
            <div className={styles.testiBubble}>
              <p className={styles.stars}>★★★★★</p>
              <p className={styles.testiQuote}>
                «العربية والفرنسية ليستا مترجمتين — إنهما أصليتان. هذا وحده
                يميّزها.»
              </p>
              <div className={styles.testiPerson}>
                <div className={styles.testiAvatar}>خ</div>
                <div>
                  <p className={styles.testiName}>د. خالد ر.</p>
                  <p className={styles.testiRole}>مدير مدرسة، تونس</p>
                </div>
              </div>
            </div>
            <div className={styles.testiBubble}>
              <p className={styles.stars}>★★★★★</p>
              <p className={styles.testiQuote}>
                «بنى أول لعبة تعمل فعليًا خلال أسبوعين. مدرّب الذكاء الاصطناعي
                أكثر صبرًا مني.»
              </p>
              <div className={styles.testiPerson}>
                <div className={styles.testiAvatar}>س</div>
                <div>
                  <p className={styles.testiName}>سارة أ.</p>
                  <p className={styles.testiRole}>وليّة أمر، صفاقس</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SECURITY & COMPLIANCE ================= */}
      <div className={styles.tracksSec}>
        <div className="container">
          <div className={styles.tracksHead}>
            <p className="eyebrow">الأمان والامتثال</p>
            <h2>بيانات يمكن لقسم تقنية المعلومات لديكم الموافقة عليها</h2>
            <p style={{ color: 'rgba(41,57,74,0.7)', maxWidth: 520, margin: '10px auto 0' }}>
              مبنية على خصوصية الطالب كإعداد افتراضي، لا كإضافة لاحقة.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginTop: 44 }}>
            {[
              {
                title: 'بيانات الطالب محمية',
                desc: 'تجمع حسابات الطلاب فقط ما يلزم لتشغيل الدروس وتتبّع التقدّم — لا تُباع أبدًا ولا تُستخدم للإعلانات.',
              },
              {
                title: 'صلاحيات حسب الدور',
                desc: 'يرى المعلّمون فصولهم فقط، وترى الإدارة المدرسة كاملة، ويرى الطلاب أعمالهم الخاصة فقط.',
              },
              {
                title: 'خيارات استضافة إقليمية',
                desc: 'تتوفّر خيارات لمكان تخزين البيانات للمؤسسات ذات المتطلبات الإقليمية.',
              },
              {
                title: 'جهة اتصال مخصّصة',
                desc: 'تحصل خطط المؤسسات على جهة اتصال مخصّصة لأسئلة البيانات والأمان — لا طابور دعم عام.',
              },
            ].map((item) => (
              <div key={item.title} style={{ background: '#fff', border: '1px solid #E4E9E7', borderRadius: 18, padding: '24px 22px' }}>
                <div
                  style={{
                    width: 36, height: 36, borderRadius: 10, background: '#EAF6F3',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
                  }}
                >
                  <svg width={17} height={17} viewBox="0 0 20 20">
                    <path d="M10 2 L17 5 V10 C17 14 14 17 10 18 C6 17 3 14 3 10 V5 Z" fill="#1FB8A6" />
                  </svg>
                </div>
                <p style={{ fontWeight: 700, fontSize: 15.5, color: '#0D2B32', margin: '0 0 8px' }}>{item.title}</p>
                <p style={{ fontSize: 13.5, color: 'rgba(41,57,74,0.7)', lineHeight: 1.55, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(41,57,74,0.6)', marginTop: 28 }}>
            أسئلة لقسم تقنية المعلومات أو المشتريات لديكم؟ <a href="mailto:hello@plulai.com" style={{ color: '#1FB8A6', fontWeight: 600 }}>راسلونا</a> للحصول على وثائق التعامل مع البيانات.
          </p>
        </div>
      </div>

      {/* ================= FAQ ================= */}
      <div className={styles.tracksSec}>
        <div className="container" style={{ maxWidth: 760 }}>
          <div className={styles.tracksHead}>
            <p className="eyebrow">الأسئلة الشائعة</p>
            <h2>أسئلة متكرّرة من المدارس</h2>
          </div>

          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              {
                q: 'ما الأجهزة أو المتصفّحات التي نحتاجها؟',
                a: 'تعمل Plulai على أي متصفّح حديث — Chrome أو Safari أو Edge — على أجهزة Chromebook أو الحواسيب المحمولة أو الأجهزة اللوحية. لا حاجة لأي تثبيت.',
              },
              {
                q: 'كيف يتم التعامل مع بيانات الطالب؟',
                a: 'نجمع فقط ما يلزم لتشغيل الدروس وتتبّع التقدّم. لا تُباع البيانات أبدًا ولا تُستخدم للإعلانات. راجع قسم الأمان والامتثال أعلاه، أو راسلونا للحصول على الوثائق الكاملة.',
              },
              {
                q: 'كم يستغرق التأهيل؟',
                a: 'تنتقل معظم المدارس من العرض التجريبي إلى فصل تجريبي فعلي خلال أسبوع، وإلى التطبيق الكامل خلال شهر. تشمل الباقة جلسة تدريب قصيرة للمعلّمين.',
              },
              {
                q: 'هل تناسب الدروس مدة الحصّة الدراسية العادية؟',
                a: 'نعم — الدروس مصمَّمة بوحدات مدتها ١٥ دقيقة، لتناسب حصّة دراسية أو نشاطًا بعد المدرسة دون جدولة إضافية.',
              },
              {
                q: 'كيف تعمل الفوترة للمؤسسات؟',
                a: 'تُفوتَر خطط المؤسسات حسب عدد المقاعد ومدة الفصل الدراسي، مع فوترة مرنة. احجز عرضًا تجريبيًا وسنُعدّ لكم عرض سعر.',
              },
              {
                q: 'هل يحتاج المعلّمون خلفية في البرمجة؟',
                a: 'لا. يحصل المعلّمون على جلسة تأهيل قصيرة، والدروس مصمَّمة لتُدار ذاتيًا — يتولّى مدرّب الذكاء الاصطناعي معظم التوجيه الفردي.',
              },
            ].map((item, i) => {
              const isOpen = openFaq === i
              return (
                <div key={item.q} style={{ border: '1px solid #E4E9E7', borderRadius: 14, background: '#fff', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    style={{
                      width: '100%', textAlign: 'right', background: 'none', border: 'none', cursor: 'pointer',
                      padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      fontSize: 15, fontWeight: 600, color: '#0D2B32', fontFamily: 'inherit',
                    }}
                  >
                    {item.q}
                    <span
                      style={{
                        transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform .2s ease',
                        fontSize: 20, color: '#1FB8A6', flexShrink: 0, marginRight: 12, lineHeight: 1,
                      }}
                    >
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <p style={{ margin: 0, padding: '0 20px 18px', fontSize: 14, lineHeight: 1.6, color: 'rgba(41,57,74,0.7)' }}>
                      {item.a}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ================= FINAL CTA ================= */}
      <div className={styles.finalCta}>
        <div className="container">
          <h2 className={styles.finalCtaTitle}>مستعدّون لإدخال Plulai إلى مدرستكم؟</h2>
          <p className={styles.finalCtaText}>
            انضموا إلى المدارس والمؤسسات التي تبني الجيل القادم من مبدعي منطقة
            الشرق الأوسط وشمال أفريقيا.
          </p>
          <div className={styles.finalCtas}>
            <a href="#schools">
              <button className="btn btn-cta">احجز عرضًا تجريبيًا &larr;</button>
            </a>
            <a href="mailto:hello@plulai.com">
              <button className="btn btn-outline btn-outline--on-dark">تحدّث مع فريقنا</button>
            </a>
          </div>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerGrid}>
            <div>
              <div className="wordmark">
                <span className="brand-mark">/</span>
                <span>Plulai</span>
              </div>
              <p className={styles.footerBrandText}>
                نبني بناة الغد، اليوم — لمنطقة الشرق الأوسط وشمال أفريقيا.
              </p>
            </div>
            <div className={styles.footerCol}>
              <p className={styles.footerColTitle}>المنتج</p>
              <a href="#tracks">المسارات</a>
            </div>
            <div className={styles.footerCol}>
              <p className={styles.footerColTitle}>المدارس</p>
              <a href="/ar/schools">نظرة عامة</a>
              <a href="mailto:hello@plulai.com">اطلب عرضًا توضيحيًا</a>
            </div>
            <div className={styles.footerCol}>
              <p className={styles.footerColTitle}>الشركة</p>
              <a href="#">من نحن</a>
              <a href="/">English</a>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span>© 2026 Plulai للتعليم.</span>
            <span>الخصوصية · الشروط</span>
          </div>
        </div>
      </footer>
    </main>
  )
}

function LockIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 14 14">
      <rect x="3" y="6" width="8" height="6" rx="1" fill="#9AB5B0" />
      <path d="M4.5 6 V4 a2.5 2.5 0 0 1 5 0 V6" stroke="#9AB5B0" strokeWidth={1.6} fill="none" />
    </svg>
  )
}