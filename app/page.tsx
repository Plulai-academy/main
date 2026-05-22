'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

// ── Quiz data ─────────────────────────────────────────────────────────────────
const QUIZ_STEPS = [
  {
    id: 'age',
    question: "How old is your child?",
    options: [
      { label: '6–8',   value: 'mini',   emoji: '🌱', desc: 'Mini Explorer' },
      { label: '9–11',  value: 'junior', emoji: '🚀', desc: 'Junior Creator' },
      { label: '12–14', value: 'pro',    emoji: '⚡', desc: 'Pro Explorer'  },
      { label: '15–18', value: 'expert', emoji: '🔥', desc: 'Tech Expert'   },
    ],
  },
  {
    id: 'interest',
    question: "What excites them most?",
    options: [
      { label: 'Building apps',    value: 'coding', emoji: '💻', desc: 'Coding track'    },
      { label: 'AI & smart tech',  value: 'ai',     emoji: '🧠', desc: 'AI track'        },
      { label: 'Starting a biz',   value: 'bizz',   emoji: '💡', desc: 'Startup track'   },
      { label: 'All three!',       value: 'all',    emoji: '🏆', desc: 'Full curriculum' },
    ],
  },
  {
    id: 'goal',
    question: "What matters most to you?",
    options: [
      { label: 'Screen time with purpose', value: 'screen', emoji: '📱', desc: '' },
      { label: 'Career advantage',         value: 'career', emoji: '💼', desc: '' },
      { label: 'Build confidence',         value: 'conf',   emoji: '💪', desc: '' },
      { label: 'Real skills, not theory',  value: 'skills', emoji: '🔧', desc: '' },
    ],
  },
]
const TRACK_RESULT: Record<string, { title: string; desc: string; emoji: string }> = {
  coding: { emoji: '💻', title: 'Coding Track',    desc: 'Python, web dev & game design. Builds real apps in week 2.' },
  ai:     { emoji: '🧠', title: 'AI Track',        desc: 'Machine learning, AI ethics & their own AI project by month 2.' },
  bizz:   { emoji: '💡', title: 'Startup Track',   desc: 'MVP building & pitching — UAE style. Win school competitions.' },
  all:    { emoji: '🏆', title: 'Full Curriculum', desc: 'All 3 tracks — the complete future-skills package.' },
}

const PROJECTS = [
  { age: 9,  country: '🇦🇪', project: 'A working calculator app in Python',     track: 'Coding', weeks: 3 },
  { age: 11, country: '🇸🇦', project: 'An AI chatbot that answers school Qs',   track: 'AI',     weeks: 6 },
  { age: 13, country: '🇶🇦', project: 'A startup pitch that won school finals',  track: 'Startup',weeks: 8 },
  { age: 10, country: '🇰🇼', project: "A website for their mum's business",      track: 'Coding', weeks: 4 },
  { age: 14, country: '🇦🇪', project: 'An ML model that sorts recycling photos', track: 'AI',     weeks: 7 },
  { age: 12, country: '🇧🇭', project: 'A fully-pitched mobile app idea to VCs',  track: 'Startup',weeks: 9 },
]

const KID_TESTIMONIALS = [
  { name:'Ahmed K.',  age:13, country:'🇦🇪 Dubai',     text:'I built my first AI chatbot in 2 weeks. My teacher shared it with the whole class.', result:'Built an AI chatbot in 2 weeks'  },
  { name:'Sara M.',   age:10, country:'🇸🇦 Riyadh',    text:'21-day streak! I learn for 20 mins every night instead of watching YouTube.',         result:'21-day streak and counting'     },
  { name:'Yousef A.', age:15, country:'🇶🇦 Doha',      text:'The AI explains things like a friend. I ask the same question 5 times and it never gets frustrated.', result:'Finished full Python track' },
  { name:'Nour R.',   age:11, country:'🇰🇼 Kuwait',    text:"I won my school's startup competition. Judges said they couldn't believe an 11-year-old made that pitch.", result:'Won school competition' },
  { name:'Lina K.',   age:9,  country:'🇧🇭 Bahrain',   text:"I made a real website for my mum's shop. She showed all her friends.", result:'Launched a live website' },
]

const FAQ = [
  { q:'What exactly is Plulai?',               a:"Plulai is the #1 edtech platform for kids aged 6–18 in the GCC. Kids learn coding, AI and entrepreneurship through a personal AI coach, 200+ lessons, and real projects — in English and Arabic." },
  { q:'Is it really free?',                    a:"Yes — genuinely free. No credit card, no expiry. The free plan covers the first module of each track. Pro unlocks all 200+ lessons and the full portfolio system." },
  { q:'Does it actually support Arabic?',      a:"Real Arabic — not Google Translate. Full RTL interface and an AI coach that teaches natively in Arabic. The only edtech platform built region-first for the GCC." },
  { q:'How long are the lessons?',             a:"15–25 minutes each. Designed to fit after school without replacing homework time. The streak system encourages one lesson per day — most kids end up doing two." },
  { q:'How is it different from Code.org?',    a:"Those are great starters. Plulai goes further: a personalised AI coach, Arabic support, GCC cultural context, a real project portfolio, and an entrepreneurship track." },
  { q:'Is it safe for my child?',              a:"Yes. No ads — ever. AI responses are filtered for child safety. Parents control the account and receive weekly summaries. Your child's data is never sold." },
]

// ── Marquee items ─────────────────────────────────────────────────────────────
const MARQUEE = [
  '🐍 Python', '🧠 Machine Learning', '🌐 Web Dev', '💡 Startup Thinking',
  '🤖 AI Projects', '🎮 Game Design', '📊 Data Science', '⚡ Prompt Engineering',
  '🔐 Cybersecurity', '🏗️ App Building', '📱 Mobile Dev', '🌍 Arabic & English',
]

// ── Quiz ──────────────────────────────────────────────────────────────────────
function TrackQuiz() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const currentQ = QUIZ_STEPS[step - 1]
  const progress = step === 0 ? 0 : Math.round((step / QUIZ_STEPS.length) * 100)
  const result = TRACK_RESULT[answers.interest ?? 'coding']

  function next() {
    if (!selected) return
    const na = { ...answers, [currentQ.id]: selected }
    setAnswers(na)
    setSelected(null)
    setStep(step < QUIZ_STEPS.length ? step + 1 : 4)
  }

  if (step === 0) return (
    <div style={{ textAlign:'center', padding:'32px 0' }}>
      <div style={{ fontSize:'3rem', marginBottom:16 }}>🎯</div>
      <h3 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.4rem,3vw,2rem)', color:'var(--ink)', marginBottom:12, fontWeight:900, letterSpacing:'-0.03em' }}>Find your child&apos;s track</h3>
      <p style={{ color:'var(--ink-muted)', fontSize:'0.9rem', marginBottom:28, fontWeight:500 }}>3 questions · 60 seconds · personalised plan</p>
      <button onClick={() => setStep(1)} style={{ background:'var(--lime)', color:'var(--ink)', padding:'14px 36px', borderRadius:999, fontWeight:900, fontSize:'1rem', border:'none', cursor:'pointer', letterSpacing:'-0.01em' }}>
        Build my child&apos;s plan →
      </button>
    </div>
  )

  if (step === 4) return (
    <div style={{ textAlign:'center', padding:'32px 0' }}>
      <div style={{ fontSize:'3rem', marginBottom:16 }}>🎉</div>
      <p style={{ color:'var(--lime)', fontSize:'0.7rem', fontWeight:900, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:8 }}>Plan ready</p>
      <h3 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.4rem,3vw,2rem)', color:'var(--ink)', marginBottom:8, fontWeight:900, letterSpacing:'-0.03em' }}>{result.emoji} {result.title}</h3>
      <p style={{ color:'var(--ink-muted)', fontSize:'0.88rem', marginBottom:28, maxWidth:320, margin:'0 auto 28px' }}>{result.desc}</p>
      <div style={{ background:'rgba(0,0,0,0.05)', borderRadius:999, height:4, maxWidth:320, margin:'0 auto 8px', overflow:'hidden' }}>
        <div style={{ background:'var(--lime)', height:'100%', width:'75%', borderRadius:999 }} />
      </div>
      <p style={{ color:'var(--ink-muted)', fontSize:'0.72rem', fontWeight:700, marginBottom:24 }}>75% complete — create your free account</p>
      <Link href="/auth/signup" style={{ display:'inline-block', background:'var(--ink)', color:'var(--paper)', padding:'14px 32px', borderRadius:999, fontWeight:900, fontSize:'0.95rem', textDecoration:'none', letterSpacing:'-0.01em' }}>
        🚀 Unlock plan — free
      </Link>
      <div style={{ marginTop:12 }}>
        <button onClick={() => { setStep(0); setAnswers({}); setSelected(null) }} style={{ background:'none', border:'none', color:'var(--ink-muted)', fontSize:'0.8rem', cursor:'pointer', textDecoration:'underline' }}>Start over</button>
      </div>
    </div>
  )

  return (
    <div style={{ padding:'8px 0' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <div style={{ flex:1, background:'rgba(0,0,0,0.07)', borderRadius:999, height:3, overflow:'hidden' }}>
          <div style={{ background:'var(--lime)', height:'100%', width:`${progress}%`, borderRadius:999, transition:'width 0.4s ease' }} />
        </div>
        <span style={{ color:'var(--ink-muted)', fontSize:'0.7rem', fontWeight:800 }}>{progress}%</span>
      </div>
      <p style={{ color:'var(--ink-muted)', fontSize:'0.7rem', fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:6 }}>Step {step} of {QUIZ_STEPS.length}</p>
      <h3 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.2rem,2.5vw,1.6rem)', color:'var(--ink)', marginBottom:20, fontWeight:900, letterSpacing:'-0.03em' }}>{currentQ.question}</h3>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
        {currentQ.options.map(opt => (
          <button key={opt.value} onClick={() => setSelected(opt.value)} style={{
            textAlign:'left', borderRadius:16, padding:'16px',
            border: selected === opt.value ? '2px solid var(--ink)' : '2px solid rgba(0,0,0,0.1)',
            background: selected === opt.value ? 'var(--ink)' : 'transparent',
            color: selected === opt.value ? 'var(--paper)' : 'var(--ink)',
            cursor:'pointer', transition:'all 0.15s ease',
          }}>
            <div style={{ fontSize:'1.4rem', marginBottom:6 }}>{opt.emoji}</div>
            <div style={{ fontWeight:800, fontSize:'0.85rem', lineHeight:1.2 }}>{opt.label}</div>
            {opt.desc && <div style={{ fontSize:'0.72rem', opacity:0.6, marginTop:3, fontWeight:600 }}>{opt.desc}</div>}
          </button>
        ))}
      </div>
      <button onClick={next} disabled={!selected} style={{
        width:'100%', padding:'14px', borderRadius:999, fontWeight:900, fontSize:'0.95rem',
        border:'none', cursor: selected ? 'pointer' : 'not-allowed',
        background: selected ? 'var(--ink)' : 'rgba(0,0,0,0.1)',
        color: selected ? 'var(--paper)' : 'var(--ink-muted)',
        transition:'all 0.15s',
      }}>
        {step === QUIZ_STEPS.length ? 'See my child\'s plan →' : 'Next →'}
      </button>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const navBg = scrollY > 60

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,700;1,6..72,400&display=swap');

        :root {
          --font-display: 'Bebas Neue', sans-serif;
          --font-ui:      'Syne', sans-serif;
          --font-body:    'Newsreader', serif;
          --ink:          #0d0d0d;
          --ink-muted:    #5a5a5a;
          --paper:        #f5f0e8;
          --paper2:       #ede8e0;
          --lime:         #c8f04d;
          --lime-dark:    #a8d030;
          --red:          #e8342a;
          --blue:         #1a3fe8;
          --sand:         #d4c4a0;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: var(--paper); color: var(--ink); font-family: var(--font-body); overflow-x: hidden; }

        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(32px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes float {
          0%,100% { transform: translateY(0px) rotate(-2deg); }
          50%      { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes grain {
          0%,100% { transform: translate(0,0); }
          10%     { transform: translate(-2%,-3%); }
          20%     { transform: translate(3%,1%); }
          30%     { transform: translate(-1%,4%); }
          40%     { transform: translate(2%,-2%); }
          50%     { transform: translate(-3%,2%); }
          60%     { transform: translate(2%,3%); }
          70%     { transform: translate(-2%,-1%); }
          80%     { transform: translate(1%,-3%); }
          90%     { transform: translate(-1%,2%); }
        }

        .grain-overlay {
          position: fixed; inset:0; z-index:1000; pointer-events:none;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          animation: grain 0.5s steps(1) infinite;
        }

        .hero-text {
          font-family: var(--font-display);
          font-size: clamp(5rem, 14vw, 14rem);
          line-height: 0.88;
          letter-spacing: -0.01em;
          color: var(--ink);
          animation: fadeUp 0.8s ease both;
        }
        .hero-text .accent { color: var(--lime); -webkit-text-stroke: 3px var(--ink); }

        .marquee-track { display:flex; gap:0; width:max-content; animation: marquee 28s linear infinite; }
        .marquee-item  { display:flex; align-items:center; gap:12px; padding:0 32px; font-family:var(--font-ui); font-size:0.85rem; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; white-space:nowrap; }
        .marquee-sep   { color: var(--lime-dark); font-size:1.2rem; }

        .tag { display:inline-block; background:var(--ink); color:var(--paper); font-family:var(--font-ui); font-size:0.65rem; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; padding:5px 14px; border-radius:999px; }
        .tag.outline { background:transparent; color:var(--ink); border:2px solid var(--ink); }
        .tag.lime { background:var(--lime); color:var(--ink); }

        .section-label { font-family:var(--font-ui); font-size:0.65rem; font-weight:800; letter-spacing:0.18em; text-transform:uppercase; color:var(--ink-muted); }

        .big-number { font-family:var(--font-display); font-size:clamp(3rem,6vw,6rem); line-height:1; color:var(--ink); letter-spacing:-0.01em; }

        .project-card:hover { transform:translateY(-4px) rotate(0.5deg); }

        .faq-q { font-family:var(--font-ui); font-weight:700; font-size:1rem; cursor:pointer; display:flex; justify-content:space-between; align-items:center; padding:20px 0; border-bottom:1px solid rgba(0,0,0,0.08); }
        .faq-a { font-size:0.9rem; line-height:1.7; color:var(--ink-muted); padding:0 0 20px; font-weight:400; }

        .cta-pill { display:inline-block; background:var(--ink); color:var(--paper); font-family:var(--font-ui); font-weight:800; font-size:0.9rem; letter-spacing:0.01em; padding:16px 36px; border-radius:999px; text-decoration:none; transition:transform 0.2s, box-shadow 0.2s; }
        .cta-pill:hover { transform:translateY(-2px); box-shadow:0 8px 32px rgba(0,0,0,0.2); }
        .cta-pill.lime { background:var(--lime); color:var(--ink); }

        .nav-link { font-family:var(--font-ui); font-size:0.8rem; font-weight:700; color:var(--ink-muted); text-decoration:none; letter-spacing:0.02em; transition:color 0.15s; }
        .nav-link:hover { color:var(--ink); }

        @media (max-width: 768px) {
          .hero-text { font-size: clamp(4rem, 18vw, 7rem); }
          .hide-mobile { display: none !important; }
        }
      `}</style>

      {/* Film grain */}
      <div className="grain-overlay" />

      {/* ── NAV ── */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:500,
        padding:'16px 32px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        background: navBg ? 'rgba(245,240,232,0.95)' : 'transparent',
        backdropFilter: navBg ? 'blur(12px)' : 'none',
        borderBottom: navBg ? '1px solid rgba(0,0,0,0.06)' : 'none',
        transition:'all 0.3s ease',
      }}>
        <div style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', letterSpacing:'0.02em', color:'var(--ink)', lineHeight:1 }}>PLULAI</div>
        <div style={{ display:'flex', alignItems:'center', gap:32 }}>
          <a href="#tracks"    className="nav-link hide-mobile">Tracks</a>
          <a href="#projects"  className="nav-link hide-mobile">Projects</a>
          <a href="#stories"   className="nav-link hide-mobile">Stories</a>
          <a href="#faq"       className="nav-link hide-mobile">FAQ</a>
          <Link href="/auth/login"  className="nav-link" style={{ marginLeft:8 }}>Log in</Link>
          <Link href="/auth/signup" className="cta-pill" style={{ padding:'10px 24px', fontSize:'0.8rem' }}>Start free →</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{ minHeight:'100vh', padding:'140px 40px 80px', maxWidth:1400, margin:'0 auto', position:'relative', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>

        {/* Top line */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:40, flexWrap:'wrap', gap:16 }}>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <span className="tag">Ages 6–18</span>
            <span className="tag outline">GCC & MENA</span>
            <span className="tag lime">🔴 43 spots left</span>
          </div>
          <div style={{ fontFamily:'var(--font-ui)', fontSize:'0.78rem', fontWeight:700, color:'var(--ink-muted)', letterSpacing:'0.04em' }}>
            <span style={{ color:'var(--ink)', fontWeight:900 }}>1,247 kids</span> learning right now
          </div>
        </div>

        {/* Big headline */}
        <div style={{ marginBottom:40 }}>
          <h1 className="hero-text" style={{ animationDelay:'0.1s' }}>
            YOUR<br />
            CHILD&apos;S<br />
            <span className="accent">PEERS</span><br />
            ARE<br />
            BUILDING<br />
            THE FUTURE
          </h1>
        </div>

        {/* Bottom row */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:24, alignItems:'end', animation:'fadeUp 0.8s 0.3s ease both', opacity:0, animationFillMode:'both' }}>
          <div>
            <p style={{ fontFamily:'var(--font-body)', fontSize:'clamp(1rem,1.5vw,1.15rem)', lineHeight:1.65, color:'var(--ink-muted)', fontStyle:'italic', maxWidth:340 }}>
              Kids in Singapore, Dubai and Riyadh are building apps, AI tools and startup pitches. Plulai is the 15-minutes-a-day habit that puts your child in the first group.
            </p>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:'5rem', animation:'float 4s ease-in-out infinite' }}>🚀</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <Link href="/auth/signup" className="cta-pill lime" style={{ fontSize:'1.05rem', padding:'18px 40px' }}>
              Claim free spot →
            </Link>
            <p style={{ fontFamily:'var(--font-ui)', fontSize:'0.7rem', color:'var(--ink-muted)', marginTop:10, fontWeight:600 }}>No credit card · English & Arabic</p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position:'absolute', bottom:32, left:'50%', transform:'translateX(-50%)', fontFamily:'var(--font-ui)', fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--ink-muted)', display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
          <div style={{ width:1, height:48, background:'linear-gradient(to bottom, transparent, var(--ink-muted))' }} />
          scroll
        </div>
      </section>

      {/* ── MARQUEE STRIP ── */}
      <div style={{ background:'var(--ink)', padding:'20px 0', overflow:'hidden', borderTop:'1px solid rgba(255,255,255,0.05)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display:'flex', overflow:'hidden' }}>
          <div className="marquee-track">
            {[...MARQUEE, ...MARQUEE].map((item, i) => (
              <span key={i} className="marquee-item" style={{ color: i % 3 === 0 ? 'var(--lime)' : 'rgba(255,255,255,0.7)' }}>
                {item}
                <span className="marquee-sep">✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <section style={{ maxWidth:1400, margin:'0 auto', padding:'80px 40px', display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:2, borderTop:'1px solid rgba(0,0,0,0.08)', borderBottom:'1px solid rgba(0,0,0,0.08)' }}>
        {[
          { value:'1,247', label:'Kids online now', live:true },
          { value:'200+',  label:'Lessons built' },
          { value:'4.9★',  label:'Parent rating' },
          { value:'6',     label:'GCC countries' },
        ].map((s, i) => (
          <div key={i} style={{ padding:'40px 32px', borderLeft: i > 0 ? '1px solid rgba(0,0,0,0.08)' : 'none' }}>
            {s.live && (
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--lime-dark)', animation:'grain 0.8s steps(1) infinite' }} />
                <span style={{ fontFamily:'var(--font-ui)', fontSize:'0.62rem', fontWeight:800, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--lime-dark)' }}>LIVE</span>
              </div>
            )}
            <div className="big-number">{s.value}</div>
            <div style={{ fontFamily:'var(--font-ui)', fontSize:'0.75rem', fontWeight:700, color:'var(--ink-muted)', marginTop:6, letterSpacing:'0.04em', textTransform:'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── TRACKS ── */}
      <section id="tracks" style={{ maxWidth:1400, margin:'0 auto', padding:'100px 40px' }}>
        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:56, flexWrap:'wrap', gap:16 }}>
          <div>
            <p className="section-label" style={{ marginBottom:12 }}>Three paths · One platform</p>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(3rem,7vw,7rem)', lineHeight:0.9, letterSpacing:'-0.01em', color:'var(--ink)' }}>
              WHICH<br />FUTURE?
            </h2>
          </div>
          <p style={{ fontFamily:'var(--font-body)', fontSize:'1rem', color:'var(--ink-muted)', maxWidth:340, lineHeight:1.7, fontStyle:'italic' }}>
            Every path leads to skills the GCC economy will pay a premium for in 2030. Most kids end up doing all three.
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16 }}>
          {[
            { id:'coding',  emoji:'💻', title:'Coding',    sub:'For future developers',  outcome:'Real web app + game portfolio in 3 months', desc:'From zero to building real apps and games. Python, HTML, logical thinking — explained simply, practised daily. Week 2 kids write their first working program.', skills:['Python','Web Development','Game Design','App Building'], bg:'#0d0d0d', fg:'#f5f0e8', accent:'#c8f04d' },
            { id:'ai',      emoji:'🧠', title:'AI',        sub:'For future innovators',   outcome:'Working AI project they built themselves',    desc:'Not watching AI videos — actually building AI. By month 2, your child has their own machine learning project.', skills:['What is AI?','Machine Learning','AI Ethics','Build an AI Project'], bg:'#1a3fe8', fg:'#f5f0e8', accent:'#c8f04d' },
            { id:'startup', emoji:'💡', title:'Startup',   sub:'For future founders',     outcome:'Full startup pitch + MVP in 3 months',        desc:'From first idea to polished investor pitch. Same startup thinking used in DIFC — adapted for young minds.', skills:['Idea Generation','Market Research','Build a MVP','Pitch Your Startup'], bg:'#c8f04d', fg:'#0d0d0d', accent:'#0d0d0d' },
          ].map((t) => (
            <div key={t.id} style={{ background:t.bg, borderRadius:24, padding:40, display:'flex', flexDirection:'column', minHeight:460, transition:'transform 0.2s ease' }}
              onMouseEnter={e => (e.currentTarget.style.transform='translateY(-4px)')}
              onMouseLeave={e => (e.currentTarget.style.transform='translateY(0)')}>
              <div style={{ fontSize:'2.5rem', marginBottom:20 }}>{t.emoji}</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2.5rem,4vw,4rem)', color:t.fg, lineHeight:0.9, marginBottom:8 }}>{t.title}</div>
              <div style={{ fontFamily:'var(--font-ui)', fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:t.accent, marginBottom:16, opacity:0.8 }}>{t.sub}</div>
              <div style={{ background: t.fg === '#f5f0e8' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', borderRadius:12, padding:'12px 16px', marginBottom:20 }}>
                <p style={{ fontFamily:'var(--font-ui)', fontSize:'0.75rem', fontWeight:800, color:t.accent, letterSpacing:'0.02em' }}>✓ {t.outcome}</p>
              </div>
              <p style={{ fontFamily:'var(--font-body)', fontSize:'0.88rem', color: t.fg === '#f5f0e8' ? 'rgba(245,240,232,0.6)' : 'rgba(13,13,13,0.6)', lineHeight:1.65, marginBottom:'auto', fontStyle:'italic' }}>{t.desc}</p>
              <div style={{ marginTop:24, display:'flex', flexWrap:'wrap', gap:6 }}>
                {t.skills.map(s => (
                  <span key={s} style={{ fontFamily:'var(--font-ui)', fontSize:'0.68rem', fontWeight:700, padding:'4px 12px', borderRadius:999, border:`1px solid ${t.fg === '#f5f0e8' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`, color: t.fg === '#f5f0e8' ? 'rgba(245,240,232,0.7)' : 'rgba(13,13,13,0.7)' }}>{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── QUIZ ── */}
      <section id="quiz" style={{ background:'var(--lime)', padding:'80px 40px' }}>
        <div style={{ maxWidth:1000, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center' }}>
          <div>
            <p className="section-label" style={{ marginBottom:16 }}>Personalised for your child</p>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(3rem,6vw,6rem)', lineHeight:0.9, color:'var(--ink)', marginBottom:24 }}>
              BUILD<br />YOUR<br />PLAN
            </h2>
            <p style={{ fontFamily:'var(--font-body)', fontSize:'1rem', color:'var(--ink-muted)', lineHeight:1.7, fontStyle:'italic' }}>
              Three questions. Sixty seconds. A personalised curriculum that fits exactly where your child is right now.
            </p>
          </div>
          <div style={{ background:'var(--paper)', borderRadius:24, padding:36 }}>
            <TrackQuiz />
          </div>
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section id="projects" style={{ maxWidth:1400, margin:'0 auto', padding:'100px 40px' }}>
        <div style={{ marginBottom:56 }}>
          <p className="section-label" style={{ marginBottom:12 }}>Not theory. Real output.</p>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(3rem,7vw,7rem)', lineHeight:0.9, letterSpacing:'-0.01em', color:'var(--ink)' }}>
            WHAT KIDS<br />BUILD HERE
          </h2>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16 }}>
          {PROJECTS.map((p, i) => (
            <div key={i} className="project-card" style={{
              border:'1px solid rgba(0,0,0,0.1)', borderRadius:20, padding:28,
              transition:'transform 0.2s ease, box-shadow 0.2s ease',
              cursor:'default',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow='0 16px 40px rgba(0,0,0,0.1)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow='none' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <span style={{
                  fontFamily:'var(--font-ui)', fontSize:'0.65rem', fontWeight:800,
                  padding:'4px 12px', borderRadius:999, letterSpacing:'0.08em', textTransform:'uppercase',
                  background: p.track==='Coding' ? '#0d0d0d' : p.track==='AI' ? '#1a3fe8' : '#c8f04d',
                  color:       p.track==='Startup' ? '#0d0d0d' : '#f5f0e8',
                }}>{p.track}</span>
                <span style={{ fontFamily:'var(--font-ui)', fontSize:'0.72rem', color:'var(--ink-muted)', fontWeight:700 }}>Week {p.weeks}</span>
              </div>
              <p style={{ fontFamily:'var(--font-body)', fontSize:'1rem', fontWeight:700, color:'var(--ink)', marginBottom:16, lineHeight:1.4, fontStyle:'italic' }}>&ldquo;{p.project}&rdquo;</p>
              <div style={{ display:'flex', gap:8, fontFamily:'var(--font-ui)', fontSize:'0.72rem', color:'var(--ink-muted)', fontWeight:700 }}>
                <span>{p.country}</span><span>·</span><span>Age {p.age}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign:'center', marginTop:48 }}>
          <Link href="/auth/signup" className="cta-pill" style={{ fontSize:'1rem', padding:'18px 48px' }}>
            Start building — free →
          </Link>
          <p style={{ fontFamily:'var(--font-ui)', fontSize:'0.72rem', color:'var(--ink-muted)', marginTop:12, fontWeight:600 }}>Your child&apos;s first project is ready by end of week 2.</p>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background:'var(--paper2)', borderTop:'1px solid rgba(0,0,0,0.06)', borderBottom:'1px solid rgba(0,0,0,0.06)', padding:'100px 40px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ marginBottom:56, textAlign:'center' }}>
            <p className="section-label" style={{ marginBottom:12 }}>Simple to start</p>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(3rem,6vw,6rem)', lineHeight:0.9, color:'var(--ink)' }}>3 STEPS</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:2 }}>
            {[
              { n:'01', emoji:'🎯', title:'Find your track',       desc:"Take the 60-second quiz. Get a curriculum matched to your child's age and interests.", time:'60 seconds' },
              { n:'02', emoji:'🤖', title:'Meet the AI coach',     desc:"Your child's personal AI tutor starts lesson 1 in English or Arabic. Adapts to their level automatically.", time:'Day 1' },
              { n:'03', emoji:'🏆', title:'Build something real',  desc:'By week 2, your child completes their first real project. By month 3, a full portfolio.', time:'Week 2' },
            ].map((s, i) => (
              <div key={i} style={{ padding:'48px 40px', borderLeft: i > 0 ? '1px solid rgba(0,0,0,0.08)' : 'none' }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'5rem', color:'rgba(0,0,0,0.06)', lineHeight:1, marginBottom:16 }}>{s.n}</div>
                <div style={{ fontSize:'2rem', marginBottom:16 }}>{s.emoji}</div>
                <h3 style={{ fontFamily:'var(--font-ui)', fontWeight:800, fontSize:'1.1rem', marginBottom:12, color:'var(--ink)' }}>{s.title}</h3>
                <p style={{ fontFamily:'var(--font-body)', fontSize:'0.9rem', color:'var(--ink-muted)', lineHeight:1.7, marginBottom:20, fontStyle:'italic' }}>{s.desc}</p>
                <span style={{ fontFamily:'var(--font-ui)', fontSize:'0.7rem', fontWeight:800, padding:'4px 14px', borderRadius:999, background:'var(--ink)', color:'var(--paper)', letterSpacing:'0.06em' }}>{s.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="stories" style={{ maxWidth:1400, margin:'0 auto', padding:'100px 40px' }}>
        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:56, flexWrap:'wrap', gap:16 }}>
          <div>
            <p className="section-label" style={{ marginBottom:12 }}>1,000+ kids · 1 pattern</p>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(3rem,6vw,6rem)', lineHeight:0.9, color:'var(--ink)' }}>
              REAL<br />RESULTS
            </h2>
          </div>
          <Link href="/auth/signup" className="cta-pill lime">See more stories →</Link>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16 }}>
          {KID_TESTIMONIALS.slice(0,3).map((t, i) => (
            <div key={i} style={{ background: i === 1 ? 'var(--ink)' : 'var(--paper2)', borderRadius:20, padding:32, border:'1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, background: i === 1 ? 'var(--lime)' : 'var(--ink)', color: i === 1 ? 'var(--ink)' : 'var(--paper)', borderRadius:999, padding:'4px 12px', marginBottom:20 }}>
                <span style={{ fontFamily:'var(--font-ui)', fontSize:'0.68rem', fontWeight:800, letterSpacing:'0.06em' }}>✓ {t.result}</span>
              </div>
              <p style={{ fontFamily:'var(--font-body)', fontSize:'1rem', color: i === 1 ? 'rgba(245,240,232,0.85)' : 'var(--ink)', lineHeight:1.65, marginBottom:24, fontStyle:'italic' }}>&ldquo;{t.text}&rdquo;</p>
              <div style={{ fontFamily:'var(--font-ui)', fontSize:'0.78rem', fontWeight:800, color: i === 1 ? 'var(--lime)' : 'var(--ink-muted)' }}>{t.name}, age {t.age} · {t.country}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:16 }}>
          {KID_TESTIMONIALS.slice(3).map((t, i) => (
            <div key={i} style={{ background:'var(--paper2)', borderRadius:20, padding:32, border:'1px solid rgba(0,0,0,0.06)', display:'flex', gap:24 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'var(--ink)', color:'var(--paper)', borderRadius:999, padding:'4px 12px', marginBottom:16 }}>
                  <span style={{ fontFamily:'var(--font-ui)', fontSize:'0.68rem', fontWeight:800 }}>✓ {t.result}</span>
                </div>
                <p style={{ fontFamily:'var(--font-body)', fontSize:'0.95rem', color:'var(--ink)', lineHeight:1.65, marginBottom:16, fontStyle:'italic' }}>&ldquo;{t.text}&rdquo;</p>
                <div style={{ fontFamily:'var(--font-ui)', fontSize:'0.78rem', fontWeight:800, color:'var(--ink-muted)' }}>{t.name}, age {t.age} · {t.country}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── GCC MAP ── */}
      <section style={{ background:'var(--ink)', padding:'100px 40px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center' }}>
            <div>
              <p style={{ fontFamily:'var(--font-ui)', fontSize:'0.65rem', fontWeight:800, letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:16 }}>Built for the region</p>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(3rem,6vw,6rem)', lineHeight:0.9, color:'#f5f0e8', marginBottom:32 }}>
                THE GCC&apos;S<br />#1 EDTECH<br />PLATFORM
              </h2>
              <p style={{ fontFamily:'var(--font-body)', fontSize:'1rem', color:'rgba(245,240,232,0.6)', lineHeight:1.7, fontStyle:'italic', marginBottom:36 }}>
                The only kids&apos; platform built region-first — culturally relevant, fully bilingual, designed for the GCC&apos;s next generation. Real Arabic, not translated.
              </p>
              <Link href="/auth/signup" className="cta-pill lime" style={{ fontSize:'0.95rem' }}>Join the region →</Link>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }}>
              {[
                { flag:'🇦🇪', name:'UAE',          city:'Dubai & Abu Dhabi' },
                { flag:'🇸🇦', name:'Saudi Arabia', city:'Riyadh & Jeddah'  },
                { flag:'🇶🇦', name:'Qatar',        city:'Doha'              },
                { flag:'🇰🇼', name:'Kuwait',       city:'Kuwait City'       },
                { flag:'🇧🇭', name:'Bahrain',      city:'Manama'            },
                { flag:'🇴🇲', name:'Oman',         city:'Muscat'            },
              ].map(c => (
                <div key={c.name} style={{ background:'rgba(255,255,255,0.04)', borderRadius:16, padding:20, textAlign:'center', border:'1px solid rgba(255,255,255,0.07)', transition:'background 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.background='rgba(200,240,77,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background='rgba(255,255,255,0.04)')}>
                  <div style={{ fontSize:'2rem', marginBottom:8 }}>{c.flag}</div>
                  <div style={{ fontFamily:'var(--font-ui)', fontWeight:800, fontSize:'0.78rem', color:'#f5f0e8' }}>{c.name}</div>
                  <div style={{ fontFamily:'var(--font-ui)', fontSize:'0.65rem', color:'rgba(255,255,255,0.4)', marginTop:4, fontWeight:600 }}>{c.city}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ maxWidth:800, margin:'0 auto', padding:'100px 40px' }}>
        <p className="section-label" style={{ marginBottom:16 }}>Everything parents ask</p>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(3rem,6vw,5rem)', lineHeight:0.9, color:'var(--ink)', marginBottom:56 }}>FAQ</h2>
        <div>
          {FAQ.map((item, i) => (
            <div key={i}>
              <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width:'100%', background:'none', border:'none', textAlign:'left', color:'var(--ink)' }}>
                <span>{item.q}</span>
                <span style={{ fontSize:'1.4rem', color:'var(--ink-muted)', transition:'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'none', display:'inline-block', flexShrink:0, marginLeft:16 }}>+</span>
              </button>
              {openFaq === i && (
                <div className="faq-a">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ background:'var(--paper2)', borderTop:'1px solid rgba(0,0,0,0.06)', padding:'100px 40px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <p className="section-label" style={{ marginBottom:16, textAlign:'center' }}>Simple pricing</p>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(3rem,6vw,5rem)', lineHeight:0.9, color:'var(--ink)', textAlign:'center', marginBottom:56 }}>
            START FREE.<br />UPGRADE WHEN READY.
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div style={{ background:'var(--ink)', borderRadius:24, padding:40, position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:20, right:20, background:'var(--lime)', color:'var(--ink)', fontFamily:'var(--font-ui)', fontSize:'0.62rem', fontWeight:900, padding:'4px 12px', borderRadius:999, letterSpacing:'0.08em' }}>MOST POPULAR</div>
              <div style={{ fontSize:'2rem', marginBottom:16 }}>🎁</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'2rem', color:'#f5f0e8', marginBottom:4 }}>FREE</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'4rem', color:'#f5f0e8', lineHeight:1, marginBottom:4 }}>$0</div>
              <div style={{ fontFamily:'var(--font-ui)', fontSize:'0.72rem', color:'rgba(245,240,232,0.4)', fontWeight:600, marginBottom:32 }}>forever · no card needed</div>
              {['First module of each track','Personal AI coach','XP & streak system','Parent dashboard','Arabic & English','Any device'].map(f => (
                <div key={f} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <span style={{ color:'var(--lime)', fontWeight:900, fontSize:'0.9rem' }}>✓</span>
                  <span style={{ fontFamily:'var(--font-ui)', fontSize:'0.82rem', color:'rgba(245,240,232,0.8)', fontWeight:600 }}>{f}</span>
                </div>
              ))}
              <Link href="/auth/signup" style={{ display:'block', marginTop:32, background:'var(--lime)', color:'var(--ink)', textAlign:'center', padding:'16px', borderRadius:999, fontFamily:'var(--font-ui)', fontWeight:900, textDecoration:'none', fontSize:'0.9rem' }}>
                🚀 Start free now
              </Link>
            </div>
            <div style={{ background:'var(--paper)', border:'1px solid rgba(0,0,0,0.1)', borderRadius:24, padding:40, opacity:0.85 }}>
              <div style={{ fontSize:'2rem', marginBottom:16 }}>⚡</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'2rem', color:'var(--ink)', marginBottom:4 }}>PRO</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'4rem', color:'var(--ink)', lineHeight:1, marginBottom:4 }}>$79</div>
              <div style={{ fontFamily:'var(--font-ui)', fontSize:'0.72rem', color:'var(--ink-muted)', fontWeight:600, marginBottom:32 }}>per month · cancel anytime</div>
              {['All 200+ lessons','Advanced AI coaching','Full portfolio system','Live project feedback','Completion certificate','Priority support'].map(f => (
                <div key={f} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <span style={{ color:'var(--ink)', fontWeight:900, fontSize:'0.9rem' }}>✓</span>
                  <span style={{ fontFamily:'var(--font-ui)', fontSize:'0.82rem', color:'var(--ink-muted)', fontWeight:600 }}>{f}</span>
                </div>
              ))}
              <Link href="/auth/signup?plan=pro" style={{ display:'block', marginTop:32, background:'transparent', color:'var(--ink)', textAlign:'center', padding:'16px', borderRadius:999, fontFamily:'var(--font-ui)', fontWeight:900, textDecoration:'none', fontSize:'0.9rem', border:'2px solid var(--ink)' }}>
                Start with Pro →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding:'120px 40px', textAlign:'center', background:'var(--ink)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(200,240,77,0.08) 0%, transparent 70%)' }} />
        <div style={{ position:'relative', zIndex:1, maxWidth:900, margin:'0 auto' }}>
          <p className="section-label" style={{ color:'rgba(255,255,255,0.4)', marginBottom:24 }}>The best time was yesterday</p>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(4rem,10vw,10rem)', lineHeight:0.88, color:'#f5f0e8', marginBottom:32, letterSpacing:'-0.01em' }}>
            START<br />RIGHT<br /><span style={{ color:'var(--lime)' }}>NOW.</span>
          </h2>
          <p style={{ fontFamily:'var(--font-body)', fontSize:'1.05rem', color:'rgba(245,240,232,0.5)', marginBottom:48, fontStyle:'italic', maxWidth:480, margin:'0 auto 48px' }}>
            Join 1,247 kids across UAE, Saudi Arabia, Qatar, Kuwait, Bahrain and Oman who are already building the skills that matter.
          </p>
          <Link href="/auth/signup" className="cta-pill lime" style={{ fontSize:'1.1rem', padding:'20px 56px' }}>
            Claim your free spot →
          </Link>
          <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:16, marginTop:32 }}>
            {['✅ Free forever','✅ No credit card','✅ Arabic & English','✅ Ages 6–18','✅ No ads ever'].map(t => (
              <span key={t} style={{ fontFamily:'var(--font-ui)', fontSize:'0.72rem', fontWeight:700, color:'rgba(255,255,255,0.3)' }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:'#090909', padding:'60px 40px', borderTop:'1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth:1400, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:40 }}>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'2.4rem', color:'#f5f0e8', letterSpacing:'0.02em', marginBottom:8 }}>PLULAI</div>
            <p style={{ fontFamily:'var(--font-ui)', fontSize:'0.72rem', color:'rgba(255,255,255,0.3)', fontWeight:600, maxWidth:220, lineHeight:1.6 }}>The #1 edtech platform for kids in the GCC. Ages 6–18.</p>
          </div>
          <div style={{ display:'flex', gap:48, flexWrap:'wrap' }}>
            {[
              { title:'Platform', links:[{l:'Find a Track',h:'#quiz'},{l:'Projects',h:'#projects'},{l:'Pricing',h:'/pricing'},{l:'Sign Up Free',h:'/auth/signup'}] },
              { title:'Countries', links:[{l:'🇦🇪 UAE',h:'#'},{l:'🇸🇦 Saudi',h:'#'},{l:'🇶🇦 Qatar',h:'#'},{l:'🇰🇼 Kuwait',h:'#'}] },
              { title:'Company', links:[{l:'Contact',h:'mailto:hello@plulai.com'},{l:'Partners',h:'mailto:partners@plulai.com'},{l:'Schools',h:'mailto:schools@plulai.com'}] },
            ].map(col => (
              <div key={col.title}>
                <p style={{ fontFamily:'var(--font-ui)', fontSize:'0.7rem', fontWeight:900, color:'rgba(255,255,255,0.5)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:16 }}>{col.title}</p>
                {col.links.map(lk => (
                  <a key={lk.l} href={lk.h} style={{ display:'block', fontFamily:'var(--font-ui)', fontSize:'0.8rem', color:'rgba(255,255,255,0.3)', textDecoration:'none', marginBottom:10, fontWeight:600, transition:'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color='rgba(255,255,255,0.8)')}
                    onMouseLeave={e => (e.currentTarget.style.color='rgba(255,255,255,0.3)')}>{lk.l}</a>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div style={{ maxWidth:1400, margin:'40px auto 0', paddingTop:24, borderTop:'1px solid rgba(255,255,255,0.05)', display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <p style={{ fontFamily:'var(--font-ui)', fontSize:'0.72rem', color:'rgba(255,255,255,0.2)', fontWeight:600 }}>
            © {new Date().getFullYear()} Plulai · Built with ❤️ for the GCC
          </p>
          <a href="mailto:hello@plulai.com" style={{ fontFamily:'var(--font-ui)', fontSize:'0.72rem', color:'rgba(255,255,255,0.2)', fontWeight:600, textDecoration:'none' }}>hello@plulai.com</a>
        </div>
      </footer>
    </>
  )
}