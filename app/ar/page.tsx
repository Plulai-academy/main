// File: page.tsx
// Placement: app/ar/page.tsx
//
// Reuses ../page.module.css as-is — that file uses logical
// inline-start/end CSS properties plus flex/grid, which mirror
// automatically under dir="rtl". The .arRoot class (applied below)
// bottom of page.module.css swaps in an Arabic font stack.
// Only the two absolutely-positioned hero float badges needed
// manual left/right mirroring since those are inline styles.

'use client'

import { useState } from 'react'
import Marjan from '@/components/brand/Marjan'
import styles from '../page.module.css'

export default function LandingPageAr() {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <main dir="rtl" lang="ar" className={styles.arRoot}>
      {/* ================= NAV ================= */}
      <nav className={styles.nav}>
        <div className="container">
          <div className={styles.navRow}>
            <a href="/ar" className="wordmark">
              <span className="brand-mark">/</span>
              <span>Plulai</span>
            </a>

            <div className={styles.navLinks}>
              <a href="#tracks">المسارات</a>
              <a href="#schools">للمدارس</a>
              <a href="#pricing">الأسعار</a>
            </div>

            <div className={styles.navRight}>
              <a href="/ar/auth/login">تسجيل الدخول</a>
              <a href="/ar/auth/signup"><button className="btn btn-dark">جرّب درسًا مجانيًا &larr;</button></a>
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
            <a href="#tracks" onClick={() => setNavOpen(false)}>المسارات</a>
            <a href="#schools" onClick={() => setNavOpen(false)}>للمدارس</a>
            <a href="#pricing" onClick={() => setNavOpen(false)}>الأسعار</a>
            <div className={styles.mobilePanelDivider} />
            <a href="/ar/auth/login" onClick={() => setNavOpen(false)}>تسجيل الدخول</a>
            <a href="/ar/auth/signup" onClick={() => setNavOpen(false)}>
              <button className="btn btn-cta btn-block">جرّب درسًا مجانيًا &larr;</button>
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
                +150 متعلمًا في دول الخليج
              </div>
              <h1 className={styles.heroTitle}>
                حيث يتعلّم الأطفال البرمجة، والتفكير بأسلوب الذكاء الاصطناعي، وبناء أول مشروع تجاري لهم.
              </h1>
              <p className={styles.heroSub}>
                ١٥ دقيقة يوميًا، بالعربية أو الإنجليزية — مع مدرّب ذكاء اصطناعي مصمَّم على طريقة تعلّم الأطفال الحقيقية.
              </p>
              <div className={styles.ctaRow}>
                <a href="/ar/auth/signup"><button className="btn btn-cta">جرّب درسًا مجانيًا &larr;</button></a>
                <a href="mailto:hello@plulai.com"><button className="btn btn-outline">احجز مكالمة تعريفية مباشرة</button></a>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <Marjan mood="neutral" size={280} />

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
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.partnerTile} />
            ))}
          </div>
          <p className={styles.partnersSub}>
            مدارس · برامج كشفية · مراكز مجتمعية وتدريبية
          </p>
        </div>
      </div>

      {/* ================= TRACKS: pearl cluster ================= */}
      <div id="tracks" className={styles.tracksSec}>
        <div className="container">
          <div className={styles.tracksHead}>
            <p className="eyebrow">ثلاثة مسارات</p>
            <h2>اختر نقطة الانطلاق</h2>
          </div>

          <div className={styles.pearlCluster}>
            <div className={styles.pearlItem}>
              <div className={`${styles.pearlCircle} ${styles.pearlCircleMd}`}>
                <span className="font-mono" style={{ fontWeight: 700, fontSize: 22, color: '#053D35' }}>{'{ }'}</span>
              </div>
              <p className={styles.pearlName}>البرمجة</p>
              <p className={styles.pearlDesc}>من المكعبات إلى بايثون الحقيقية — ابنِ تطبيقات وألعابًا فعلية.</p>
              <p className={styles.pearlCta}>+180 درسًا ←</p>
            </div>
            <div className={styles.pearlItem}>
              <div className={`${styles.pearlCircle} ${styles.pearlCircleLg}`}>
                <span className="font-mono" style={{ fontWeight: 700, fontSize: 26, color: '#402F12' }}>AI</span>
              </div>
              <p className={styles.pearlName}>الذكاء الاصطناعي وتقنيات المستقبل</p>
              <p className={styles.pearlDesc}>كيف يعمل الذكاء الاصطناعي فعليًا — الأوامر، البيانات، وأساسيات التعلّم الآلي.</p>
              <p className={styles.pearlCta}>+160 درسًا ←</p>
            </div>
            <div className={styles.pearlItem}>
              <div className={`${styles.pearlCircle} ${styles.pearlCircleSm}`}>
                <svg width={26} height={26} viewBox="0 0 20 20">
                  <rect x="2" y="12" width="4" height="6" fill="#fff" />
                  <rect x="8" y="7" width="4" height="11" fill="#fff" />
                  <rect x="14" y="2" width="4" height="16" fill="#fff" />
                </svg>
              </div>
              <p className={styles.pearlName}>ريادة الأعمال</p>
              <p className={styles.pearlDesc}>أطلق أول مشروع تجاري صغير — التسعير، التسويق، والعرض التقديمي.</p>
              <p className={styles.pearlCta}>+140 درسًا ←</p>
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

          {/* Placeholder examples — swap in real student projects
              (with parental consent) before this section goes live. */}
          <div className={styles.projectGrid}>
            <div className={styles.projectCard}>
              <div className={styles.projectIcon} style={{ background: '#17D9C0' }} />
              <span className="tag-mono tag-mono--reef">البرمجة</span>
              <p className={styles.projectTitle} style={{ marginTop: 12 }}>بيكسل رانر</p>
              <p className={styles.projectDesc}>
                لعبة منصّات جانبية بُنيت بالكامل ضمن مسار البرمجة — رسومات متحركة،
                تصادمات، ونظام نقاط فعّال.
              </p>
              <p className={styles.projectStudent}>عمر، ١١ سنة</p>
            </div>
            <div className={styles.projectCard}>
              <div className={styles.projectIcon} style={{ background: '#D4A24C' }} />
              <span className="tag-mono tag-mono--gold">الذكاء الاصطناعي وتقنيات المستقبل</span>
              <p className={styles.projectTitle} style={{ marginTop: 12 }}>مقترح الوصفات</p>
              <p className={styles.projectDesc}>
                أداة ذكاء اصطناعي صغيرة تقترح وصفات عشاء بناءً على المكوّنات التي
                تكتبها — بُنيت ضمن مسار الذكاء الاصطناعي.
              </p>
              <p className={styles.projectStudent}>لينا، ١٤ سنة</p>
            </div>
            <div className={styles.projectCard}>
              <div className={styles.projectIcon} style={{ background: '#FF6B57' }} />
              <span className="tag-mono tag-mono--warn">ريادة الأعمال</span>
              <p className={styles.projectTitle} style={{ marginTop: 12 }}>متجر الملصقات</p>
              <p className={styles.projectDesc}>
                خطة تسعير وتسويق أولى لمشروع ملصقات حقيقي، قُدِّمت في نهاية مسار
                ريادة الأعمال.
              </p>
              <p className={styles.projectStudent}>يوسف، ١٥ سنة</p>
            </div>
          </div>
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
              <a href="/ar/auth/signup">
                <button className="btn btn-cta" style={{ marginTop: 24 }}>
                  ابدأ المسار &larr;
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
                  <b>منهج عربي وإنجليزي</b>
                  <span>مبني حول منهج الذكاء الاصطناعي الوطني الإماراتي.</span>
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

      {/* ================= STATS ================= */}
      <div className={styles.statsSec}>
        <div className="container">
          <div className={styles.statsRow}>
            <div><div className={styles.statNum}>150+</div><div className={styles.statLabel}>متعلم نشط</div></div>
            <div><div className={styles.statNum}>500+</div><div className={styles.statLabel}>درس مصغّر</div></div>
            <div><div className={styles.statNum}>9+</div><div className={styles.statLabel}>مدرسة شريكة</div></div>
            <div><div className={styles.statNum}>9.2/10</div><div className={styles.statLabel}>رضا المستخدمين</div></div>
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
                  <p className={styles.testiRole}>وليّة أمر، الرياض</p>
                </div>
              </div>
            </div>
            <div className={styles.testiBubble}>
              <p className={styles.stars}>★★★★★</p>
              <p className={styles.testiQuote}>
                «اللغة العربية ليست مترجمة — إنها أصلية. هذا وحده يميّزها في
                المنطقة.»
              </p>
              <div className={styles.testiPerson}>
                <div className={styles.testiAvatar}>خ</div>
                <div>
                  <p className={styles.testiName}>د. خالد ر.</p>
                  <p className={styles.testiRole}>مدير مدرسة، الدوحة</p>
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
                  <p className={styles.testiRole}>وليّة أمر، دبي</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= PRICING ================= */}
      <div id="pricing" className={styles.pricingSec}>
        <div className="container">
          <p className="eyebrow" style={{ textAlign: 'center' }}>بسيط وعادل</p>
          <h2 style={{ textAlign: 'center' }}>اختر خطتك</h2>

          <svg width={500} height={60} viewBox="0 0 500 60" style={{ margin: '50px auto 0', display: 'block', maxWidth: '100%' }}>
            <path d="M40 30 Q250 -10 460 30" fill="none" stroke="#D9E4E1" strokeWidth={2} />
            <circle cx={60} cy={27} r={10} fill="#1FB8A6" />
            <circle cx={250} cy={12} r={16} fill="#D4A24C" />
            <circle cx={440} cy={27} r={12} fill="#0D2B32" />
          </svg>

          <div className={styles.priceRow}>
            <div className={styles.pricePanel}>
              <p className={styles.planName}>المستكشف</p>
              <p className={styles.planPrice}>مجانًا</p>
              <p className={styles.planNote}>بلا بطاقة، وبلا حد زمني</p>
              <div className={styles.planFeatures}>
                <span>أول ٥ دروس</span>
                <span>أساسيات البرمجة</span>
              </div>
              <button className="btn btn-outline btn-block">جرّب مجانًا</button>
            </div>

            <div className={`${styles.pricePanel} ${styles.heroPlan}`}>
              <p className={styles.planName}>الموهوب · الأكثر رواجًا</p>
              <p className={styles.planPrice}>$70<span style={{ fontSize: 13, opacity: 0.7 }}>/شهريًا</span></p>
              <p className={styles.planNote}>١٤ يومًا مجانًا، ثم $70/شهريًا</p>
              <div className={styles.planFeatures}>
                <span>المسارات الثلاثة كاملة</span>
                <span>مدرّب ذكاء اصطناعي غير محدود</span>
                <span>ملخّص أسبوعي لولي الأمر</span>
              </div>
              <button className="btn btn-cta btn-block">ابدأ التجربة المجانية</button>
            </div>

            <div className={styles.pricePanel}>
              <p className={styles.planName}>المؤسسات</p>
              <p className={styles.planPrice}>مخصّص</p>
              <p className={styles.planNote}>للمدارس، +٥٠ مقعد</p>
              <div className={styles.planFeatures}>
                <span>لوحة تحكم للمعلّم</span>
                <span>تسعير جماعي للمقاعد</span>
              </div>
              <button className="btn btn-outline btn-block">تواصل مع المبيعات</button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= FINAL CTA ================= */}
      <div className={styles.finalCta}>
        <div className="container">
          <h2 className={styles.finalCtaTitle}>مستعد لمنحهم انطلاقة مبكرة؟</h2>
          <p className={styles.finalCtaText}>
            انضم إلى العائلات والمدارس التي تبني الجيل القادم من مبدعي الخليج.
          </p>
          <div className={styles.finalCtas}>
            <a href="/ar/auth/signup">
              <button className="btn btn-cta">جرّب درسًا مجانيًا &larr;</button>
            </a>
            <a href="mailto:hello@plulai.com">
              <button className="btn btn-outline btn-outline--on-dark">احجز مكالمة تعريفية مباشرة</button>
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
                نبني بناة الغد، اليوم — مصمَّم لدول الخليج.
              </p>
            </div>
            <div className={styles.footerCol}>
              <p className={styles.footerColTitle}>المنتج</p>
              <a href="#tracks">المسارات</a>
              <a href="#pricing">الأسعار</a>
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