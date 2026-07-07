// File: page.tsx
// Placement: app/page.tsx

import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      {/* ================= NAV ================= */}
      <nav className={styles.nav}>
        <div className={`container ${styles.navRow}`}>
          <div className="flex items-center gap-2">
            <div className="brand-mark">/</div>
            <span className="font-display" style={{ fontWeight: 800, fontSize: 17, color: "var(--raw-depth)" }}>
              Plulai
            </span>
          </div>
          <div className={styles.navLinks}>
            <a href="#tracks">Tracks</a>
            <a href="#schools">For Schools</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div className={styles.navRight}>
            <a href="/login" style={{ fontSize: 13, color: "var(--raw-depth)", fontWeight: 600 }}>
              Log in
            </a>
            <button className="btn btn-dark">Try a free lesson &#8594;</button>
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <div className={styles.hero}>
        <div className={styles.heroWatermark}>/</div>
        <div className={`container ${styles.heroGrid}`}>
          <div>
            <div className={styles.statBadge}>
              <span className={styles.statDot} />
              150+ learners across the GCC
            </div>
            <h1 className={styles.heroTitle}>
              Where kids learn to code, think in AI, and build their first business.
            </h1>
            <p className={styles.heroSub}>
              15 minutes a day, taught in real Arabic or English — with an AI coach
              built around how kids actually learn.
            </p>
            <div className={styles.ctaRow}>
              <button className="btn btn-cta">Try a free lesson &#8594;</button>
              <button className="btn btn-outline">Book a live intro call</button>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <MarjanMascot size={280} />
            <div className={styles.floatBadge} style={{ top: 0, left: -10 }}>
              <svg width="20" height="20" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="8" fill="#FFB930" />
              </svg>
              <div>
                <div className={styles.floatBadgeTitle}>4-pearl streak</div>
                <div className={styles.floatBadgeSub}>One more today</div>
              </div>
            </div>
            <div className={styles.floatBadge} style={{ bottom: 20, right: -20 }}>
              <svg width="20" height="20" viewBox="0 0 20 20">
                <path d="M10 2 L17 7 L17 18 L3 18 L3 7 Z" fill="#1FB8A6" />
              </svg>
              <div>
                <div className={styles.floatBadgeTitle}>Level 5 reached</div>
                <div className={styles.floatBadgeSub}>Faris · Coding</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.divider}>
        <svg viewBox="0 0 1440 70" preserveAspectRatio="none">
          <path
            d="M0,30 C240,80 480,0 720,25 C960,50 1200,10 1440,35 L1440,70 L0,70 Z"
            fill="#F6F3EA"
          />
        </svg>
      </div>

      {/* ================= TRACKS: pearl cluster ================= */}
      <div id="tracks" className={styles.tracksSec}>
        <div className="container">
          <div className={`${styles.tracksHead} text-center`}>
            <div className="eyebrow text-center">Three tracks</div>
            <h2>Pick a starting point</h2>
          </div>
          <div className={styles.pearlCluster}>
            <div className={styles.pearlItem}>
              <div className={`${styles.pearlCircle} ${styles.pearlCircleMd}`}>
                <span className="font-mono" style={{ fontWeight: 700, fontSize: 22, color: "#053D35" }}>
                  {"{ }"}
                </span>
              </div>
              <div className="tag-mono tag-mono--gold">AGES 6–17</div>
              <div className={styles.pearlName}>Coding</div>
              <div className={styles.pearlDesc}>
                Blocks to real Python — build actual apps and games.
              </div>
              <div className={styles.pearlCta}>180+ lessons →</div>
            </div>

            <div className={styles.pearlItem}>
              <div className={`${styles.pearlCircle} ${styles.pearlCircleLg}`}>
                <span className="font-mono" style={{ fontWeight: 700, fontSize: 26, color: "#402F12" }}>
                  AI
                </span>
              </div>
              <div className="tag-mono tag-mono--gold">AGES 10–18</div>
              <div className={styles.pearlName}>AI &amp; Future Tech</div>
              <div className={styles.pearlDesc}>
                How AI actually works — prompting, data, real ML basics.
              </div>
              <div className={styles.pearlCta}>160+ lessons →</div>
            </div>

            <div className={styles.pearlItem}>
              <div className={`${styles.pearlCircle} ${styles.pearlCircleSm}`}>
                <svg width="26" height="26" viewBox="0 0 20 20">
                  <rect x="2" y="12" width="4" height="6" fill="#fff" />
                  <rect x="8" y="7" width="4" height="11" fill="#fff" />
                  <rect x="14" y="2" width="4" height="16" fill="#fff" />
                </svg>
              </div>
              <div className="tag-mono tag-mono--gold">AGES 12–18</div>
              <div className={styles.pearlName}>Entrepreneurship</div>
              <div className={styles.pearlDesc}>
                Launch a first small venture — pricing, marketing, pitch.
              </div>
              <div className={styles.pearlCta}>140+ lessons →</div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= PATH SECTION ================= */}
      <div className={styles.pathSec}>
        <div className="container">
          <div className="eyebrow" style={{ color: "var(--raw-sungold)" }}>
            The pearl path
          </div>
          <h2 style={{ color: "var(--raw-pearlwhite)" }}>
            A path that shows exactly what&apos;s next
          </h2>
          <p style={{ color: "#8FA8A3", maxWidth: 500, marginTop: 10, fontSize: 14.5 }}>
            Every finished lesson cracks open a guaranteed reward — never a random one.
          </p>

          <div className={styles.mapGrid}>
            <div>
              <div className={styles.mapNodes}>
                <div className={`${styles.mapNode} path-node path-node--done`}>
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path
                      d="M3 8 L7 12 L13 4"
                      stroke="#053D35"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className={styles.mapLine} />
                <div className={`${styles.mapNode} ${styles.mapNodeCurrent} path-node path-node--current`}>
                  <span className="font-mono" style={{ fontWeight: 700, fontSize: 13, color: "#4A3403" }}>
                    /
                  </span>
                </div>
                <div className={styles.mapLine} />
                <LockNode />
                <div className={styles.mapLine} />
                <LockNode />
              </div>

              <div className={styles.hudRow}>
                <div className={styles.hudChip}>
                  Pearls this week
                  <b>4 / 5</b>
                </div>
                <div className={styles.hudChip}>
                  XP to next level
                  <b>240 / 300</b>
                </div>
              </div>

              <div className={styles.moduleCard}>
                <div className={styles.moduleTitle}>Build your first app</div>
                <div className={styles.moduleSub}>Module 1 · 6 lessons · 2 of 6 complete</div>
                <div className={styles.progTrack}>
                  <div className={styles.progFill} />
                </div>
              </div>

              <button className="btn btn-cta" style={{ marginTop: 24 }}>
                Start the path &#8594;
              </button>
            </div>

            <div className={styles.featureList}>
              <FeatureRow title="15 minutes, not 30" desc="Sized for an actual daily habit.">
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="6.5" stroke="#8FA8A3" strokeWidth="1.5" fill="none" />
                  <path d="M8 4.5 V8 L10.5 9.5" stroke="#8FA8A3" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
              </FeatureRow>
              <FeatureRow title="A personal AI tutor" desc="Adapts to pace and language, in the moment.">
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <path d="M2 3 h12 v7 h-6 l-3 3 v-3 h-3 z" fill="#8FA8A3" />
                </svg>
              </FeatureRow>
              <FeatureRow title="Guaranteed pearl rewards" desc="No loot boxes — every lesson pays off the same way.">
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="6" fill="#D4A24C" />
                  <circle cx="8" cy="8" r="2.5" fill="#123A42" />
                </svg>
              </FeatureRow>
              <FeatureRow title="Real projects" desc="Every module ends with something to show.">
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <rect x="2" y="2" width="7" height="7" fill="#8FA8A3" />
                  <rect x="7" y="7" width="7" height="7" fill="#5C7873" />
                </svg>
              </FeatureRow>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SCHOOLS ================= */}
      <div id="schools" className={styles.schoolsSec}>
        <div className={`container ${styles.schoolsGrid}`}>
          <div>
            <div className="pill" style={{ marginBottom: 18 }}>
              For Schools &amp; Institutions
            </div>
            <h2>Bring Plulai into your classroom.</h2>
            <p style={{ color: "#5C7873", maxWidth: 500, marginTop: 10, fontSize: 14.5 }}>
              A curriculum your teachers can run — with a dashboard that flags who&apos;s
              stuck before report cards do.
            </p>
            <div className={styles.schoolsList}>
              <div className={styles.schoolsItem}>
                <b>Bulk seats, 50–5,000</b>
                <span>Regional pricing, flexible billing.</span>
              </div>
              <div className={styles.schoolsItem}>
                <b>Arabic + English curriculum</b>
                <span>Structured around the UAE&apos;s National AI Curriculum.</span>
              </div>
              <div className={styles.schoolsItem}>
                <b>Dedicated support</b>
                <span>Onboarding, training, a named success contact.</span>
              </div>
            </div>
            <div className={styles.ctaRow}>
              <button className="btn btn-dark">Explore for schools &#8594;</button>
              <button className="btn btn-outline">Download brochure</button>
            </div>
          </div>

          <div className={styles.dashMock}>
            <div className={styles.dashBar}>
              <div className={styles.dashDot} />
              <div className={styles.dashDot} />
              <div className={styles.dashDot} />
            </div>
            <div style={{ color: "#F6F3EA", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, marginBottom: 14 }}>
              Grade 5B — Coding Track
            </div>
            <RosterRow name="Sara K." pct="80%" />
            <RosterRow name="Ali M." pct="45%" />
            <RosterRow name="Fatima R." pct="92%" />
            <RosterRow name="Yousef A." pct="15%" stuck />
          </div>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className={styles.statsSec}>
        <div className={`container ${styles.statsRow}`}>
          <Stat num="150+" label="Active learners" />
          <Stat num="500+" label="Bite-sized lessons" />
          <Stat num="9+" label="Partner schools" />
          <Stat num="9.2/10" label="User satisfaction" />
        </div>
      </div>

      <div className={styles.divider}>
        <svg viewBox="0 0 1440 70" preserveAspectRatio="none">
          <path
            d="M0,40 C300,0 600,70 900,30 C1100,5 1300,45 1440,20 L1440,70 L0,70 Z"
            fill="#1FB8A6"
          />
        </svg>
      </div>

      {/* ================= TESTIMONIALS ================= */}
      <div className={styles.testiSec}>
        <div className="container">
          <div className="eyebrow text-center" style={{ color: "var(--raw-depth)", opacity: 0.7 }}>
            Loved by parents &amp; principals
          </div>
          <h2 className="text-center">What people are saying</h2>
          <div className={styles.testiCluster}>
            <Testimonial
              quote="My 9-year-old asks to do his lesson after school. I never thought I'd see that with coding."
              name="Layla M."
              role="Parent, Riyadh"
              initial="L"
            />
            <Testimonial
              quote="The Arabic isn't translated — it's native. That alone sets it apart in this region."
              name="Dr. Khalid R."
              role="Principal, Doha"
              initial="D"
            />
            <Testimonial
              quote="He built his first working game in two weeks. The AI tutor is more patient than I ever am."
              name="Sara A."
              role="Parent, Dubai"
              initial="S"
            />
          </div>
        </div>
      </div>

      {/* ================= PRICING ================= */}
      <div id="pricing" className={styles.pricingSec}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: 10 }}>
            <div className="eyebrow text-center">Simple &amp; fair</div>
            <h2>Pick your plan</h2>
          </div>

          <svg
            width="500"
            height="60"
            viewBox="0 0 500 60"
            style={{ display: "block", margin: "50px auto 0" }}
          >
            <path d="M40 30 Q250 -10 460 30" fill="none" stroke="#D9E4E1" strokeWidth="2" />
            <circle cx="60" cy="27" r="10" fill="#1FB8A6" />
            <circle cx="250" cy="12" r="16" fill="#D4A24C" />
            <circle cx="440" cy="27" r="12" fill="#0D2B32" />
          </svg>

          <div className={styles.priceRow}>
            <div className={styles.pricePanel}>
              <div className={styles.planName}>Explorer</div>
              <div className={styles.planPrice}>Free</div>
              <div className={styles.planNote}>No card, no time limit</div>
              <div className={styles.planFeatures}>
                <span>
                  <span className="pearl-dot pearl-dot--xs" style={{ background: "var(--raw-reef)" }} />
                  First 5 lessons
                </span>
                <span>
                  <span className="pearl-dot pearl-dot--xs" style={{ background: "var(--raw-reef)" }} />
                  Coding basics
                </span>
              </div>
              <button className="btn btn-outline btn-block">Try free</button>
            </div>

            <div className={`${styles.pricePanel} ${styles.heroPlan}`}>
              <div className={styles.planName}>Prodigy · most popular</div>
              <div className={styles.planPrice}>
                $70<span style={{ fontSize: 13, opacity: 0.7 }}>/mo</span>
              </div>
              <div className={styles.planNote}>14 days free, then $70/mo</div>
              <div className={styles.planFeatures}>
                <span>
                  <span className="pearl-dot pearl-dot--xs" style={{ background: "var(--raw-sungold)" }} />
                  All three tracks
                </span>
                <span>
                  <span className="pearl-dot pearl-dot--xs" style={{ background: "var(--raw-sungold)" }} />
                  Unlimited AI tutor
                </span>
                <span>
                  <span className="pearl-dot pearl-dot--xs" style={{ background: "var(--raw-sungold)" }} />
                  Weekly parent summary
                </span>
              </div>
              <button className="btn btn-cta btn-block">Start free trial</button>
            </div>

            <div className={styles.pricePanel}>
              <div className={styles.planName}>Institution</div>
              <div className={styles.planPrice}>Custom</div>
              <div className={styles.planNote}>Schools, 50+ seats</div>
              <div className={styles.planFeatures}>
                <span>
                  <span className="pearl-dot pearl-dot--xs" style={{ background: "var(--raw-reef)" }} />
                  Teacher dashboard
                </span>
                <span>
                  <span className="pearl-dot pearl-dot--xs" style={{ background: "var(--raw-reef)" }} />
                  Bulk seat pricing
                </span>
              </div>
              <button className="btn btn-outline btn-block">Contact sales</button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= FINAL CTA ================= */}
      <div className={styles.finalCta}>
        <div className="container">
          <div className={styles.finalCtaTitle}>Ready to give them a head start?</div>
          <p className={styles.finalCtaText}>
            Join the families and schools building the next generation of GCC creators.
          </p>
          <div className={styles.finalCtas}>
            <button className="btn btn-cta">Try a free lesson &#8594;</button>
            <button className="btn btn-outline btn-outline--on-dark">Book a live intro call</button>
          </div>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerGrid}>
            <div>
              <div className="flex items-center gap-2">
                <div className="brand-mark">/</div>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, color: "var(--raw-pearlwhite)" }}>
                  Plulai
                </span>
              </div>
              <p className={styles.footerBrandText}>
                Building tomorrow&apos;s builders, today — made for the GCC.
              </p>
            </div>
            <div className={styles.footerCol}>
              <h5 className={styles.footerColTitle}>Product</h5>
              <a href="#tracks">Tracks</a>
              <a href="#pricing">Pricing</a>
            </div>
            <div className={styles.footerCol}>
              <h5 className={styles.footerColTitle}>Schools</h5>
              <a href="#schools">Overview</a>
              <a href="/schools/demo">Request demo</a>
            </div>
            <div className={styles.footerCol}>
              <h5 className={styles.footerColTitle}>Company</h5>
              <a href="/about">About</a>
              <a href="/ar">العربية</a>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span>© 2026 Plulai Education.</span>
            <span>Privacy · Terms</span>
          </div>
        </div>
      </footer>
    </>
  );
}

/* ============================================================
   Small local components — worth splitting into /components
   once the page stabilizes; kept inline here to match the
   two-file scope of this request.
   ============================================================ */

function LockNode() {
  return (
    <div className="path-node path-node--locked" style={{ width: 44, height: 44 }}>
      <svg width="14" height="14" viewBox="0 0 14 14">
        <rect x="3" y="6" width="8" height="6" rx="1" fill="#5C7873" />
        <path d="M4.5 6 V4 a2.5 2.5 0 0 1 5 0 V6" stroke="#5C7873" strokeWidth="1.6" fill="none" />
      </svg>
    </div>
  );
}

function FeatureRow({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex" style={{ gap: 14, alignItems: "flex-start" }}>
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          background: "#123A42",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {children}
      </div>
      <div>
        <b style={{ fontFamily: "var(--font-display)", fontSize: 14, display: "block", marginBottom: 2 }}>
          {title}
        </b>
        <span style={{ fontSize: 12.5, color: "#8FA8A3" }}>{desc}</span>
      </div>
    </div>
  );
}

function RosterRow({ name, pct, stuck }: { name: string; pct: string; stuck?: boolean }) {
  return (
    <div
      className="flex justify-between"
      style={{ padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: 11.5, color: "#C7DDD8" }}
    >
      <span>
        {name} {stuck && <span style={{ color: "var(--raw-gold)" }}>· stuck</span>}
      </span>
      <span>{pct}</span>
    </div>
  );
}

function Stat({ num, label }: { num: string; label: string }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 34, color: "var(--raw-coral)" }}>
        {num}
      </div>
      <div style={{ fontSize: 12, color: "#5C7873", marginTop: 4 }}>{label}</div>
    </div>
  );
}

function Testimonial({
  quote,
  name,
  role,
  initial,
}: {
  quote: string;
  name: string;
  role: string;
  initial: string;
}) {
  return (
    <div style={{
      background: "#fff", borderRadius: "20px 20px 20px 4px", padding: 24, width: 270,
      boxShadow: "0 14px 30px rgba(8,63,56,0.15)",
    }}>
      <div style={{ color: "var(--raw-sungold)", fontSize: 13, marginBottom: 12, letterSpacing: 2 }}>★★★★★</div>
      <div style={{ fontSize: 13, color: "var(--raw-ink)", lineHeight: 1.6, marginBottom: 16 }}>&quot;{quote}&quot;</div>
      <div className="flex items-center gap-2">
        <div style={{
          width: 32, height: 32, borderRadius: "50%", background: "var(--raw-depth)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "var(--raw-gold)",
        }}>
          {initial}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--raw-depth)" }}>{name}</div>
          <div style={{ fontSize: 10.5, color: "#8FA8A3" }}>{role}</div>
        </div>
      </div>
    </div>
  );
}

function MarjanMascot({ size = 200 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <path d="M 40 145 L 20 158 L 10 175" fill="none" stroke="#0FA894" strokeWidth="8" strokeLinecap="round" />
      <path d="M 55 155 L 40 175 L 34 192" fill="none" stroke="#0FA894" strokeWidth="8" strokeLinecap="round" />
      <path d="M 160 145 L 180 158 L 190 175" fill="none" stroke="#0FA894" strokeWidth="8" strokeLinecap="round" />
      <path d="M 145 155 L 160 175 L 166 192" fill="none" stroke="#0FA894" strokeWidth="8" strokeLinecap="round" />
      <path
        d="M 32 138 C 24 88 50 42 100 34 C 150 42 176 88 168 138 C 168 148 160 154 152 154 L 48 154 C 40 154 32 148 32 138 Z"
        fill="#D4A24C"
      />
      <path d="M 92 42 Q 100 30 108 42 Q 100 52 92 42 Z" fill="#B8863A" />
      <circle cx="128" cy="78" r="10" fill="#FFB930" stroke="#B8863A" strokeWidth="2" />
      <ellipse cx="100" cy="162" rx="32" ry="22" fill="#17D9C0" />
      <path d="M 96 132 L 112 106" stroke="#D4A24C" strokeWidth="5" strokeLinecap="round" />
      <path d="M 82 140 C 78 122 76 108 76 96" fill="none" stroke="#0D2B32" strokeWidth="5" strokeLinecap="round" />
      <path d="M 118 140 C 122 122 124 108 124 96" fill="none" stroke="#0D2B32" strokeWidth="5" strokeLinecap="round" />
      <circle cx="76" cy="92" r="10" fill="#F6F3EA" />
      <circle cx="124" cy="92" r="10" fill="#F6F3EA" />
      <circle cx="77" cy="93" r="5" fill="#0D2B32" />
      <circle cx="125" cy="93" r="5" fill="#0D2B32" />
      <circle cx="46" cy="178" r="15" fill="#FF6B57" />
      <circle cx="55" cy="170" r="11" fill="#EAF7F4" />
      <circle cx="154" cy="178" r="15" fill="#FF6B57" />
      <circle cx="145" cy="170" r="11" fill="#EAF7F4" />
    </svg>
  );
}