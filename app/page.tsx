
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

// ── Data ──────────────────────────────────────────────────────────────────────

const QUIZ_STEPS = [
  {
    id: 'age',
    question: "How old are you?",
    options: [
      { label: '6–8 years',   value: 'mini',   emoji: '🌱' },
      { label: '9–11 years',  value: 'junior', emoji: '🚀' },
      { label: '12–14 years', value: 'pro',    emoji: '⚡' },
      { label: '15–18 years', value: 'expert', emoji: '🔥' },
    ],
  },
  {
    id: 'interest',
    question: "What sounds most fun?",
    options: [
      { label: 'Build apps & games', value: 'coding', emoji: '💻' },
      { label: 'AI & robots',        value: 'ai',     emoji: '🤖' },
      { label: 'Start a business',   value: 'bizz',   emoji: '💡' },
      { label: 'ALL of it!',         value: 'all',    emoji: '🏆' },
    ],
  },
  {
    id: 'goal',
    question: "What does your parent care about?",
    options: [
      { label: 'Useful screen time', value: 'screen', emoji: '📱' },
      { label: 'Future career',      value: 'career', emoji: '💼' },
      { label: 'Real confidence',    value: 'conf',   emoji: '💪' },
      { label: 'Actual skills',      value: 'skills', emoji: '🛠️' },
    ],
  },
]

const TRACK_RESULT: Record<string, { title: string; desc: string; emoji: string; color: string }> = {
  coding: { emoji: '💻', title: 'Coding Track',    color: '#58CC02', desc: 'Python, web dev & game design. First real program by week 2!' },
  ai:     { emoji: '🤖', title: 'AI Track',        color: '#1CB0F6', desc: 'Build real AI projects. By month 2 you have your own ML model!' },
  bizz:   { emoji: '💡', title: 'Startup Track',   color: '#FF9600', desc: 'From idea to investor pitch. Win school competitions!' },
  all:    { emoji: '🏆', title: 'Full Curriculum', color: '#FF4B4B', desc: 'All 3 tracks — the ultimate future-skills package.' },
}

const PROJECTS = [
  { age: 9,  country: '🇦🇪', project: 'A working calculator app in Python',     track: 'Coding', weeks: 3,  color: '#58CC02' },
  { age: 11, country: '🇸🇦', project: 'An AI chatbot that answers school Qs',   track: 'AI',     weeks: 6,  color: '#1CB0F6' },
  { age: 13, country: '🇶🇦', project: 'A startup pitch that won school finals',  track: 'Startup',weeks: 8,  color: '#FF9600' },
  { age: 10, country: '🇰🇼', project: "A website for their mum's business",      track: 'Coding', weeks: 4,  color: '#58CC02' },
  { age: 14, country: '🇦🇪', project: 'An ML model that sorts recycling photos', track: 'AI',     weeks: 7,  color: '#1CB0F6' },
  { age: 12, country: '🇧🇭', project: 'A fully-pitched mobile app to VCs',       track: 'Startup',weeks: 9,  color: '#FF9600' },
]

const TESTIMONIALS = [
  { name:'Ahmed K.',  age:13, flag:'🇦🇪', text:'I built my first AI chatbot in 2 weeks. My teacher shared it with the whole class!', avatar:'🧑‍💻', streak:47 },
  { name:'Sara M.',   age:10, flag:'🇸🇦', text:'21-day streak! I learn every night instead of watching YouTube. My parents love it.', avatar:'👩‍🎨', streak:21 },
  { name:'Nour R.',   age:11, flag:'🇰🇼', text:'I won my school startup competition with what I learned here. The judges were shocked!', avatar:'🦸', streak:33 },
]

const FAQ = [
  { q:'Is Plulai really free?',             a:'Yes — genuinely free forever. No credit card, no expiry. The free plan covers the first module of every track. Upgrade to Pro anytime for all 200+ lessons.' },
  { q:'What age is it for?',                a:'Ages 6–18. The platform auto-adapts: Mini Explorers (6–8), Junior Creators (9–11), Pro Explorers (12–14) and Tech Experts (15–18) all get age-appropriate content.' },
  { q:'Does it really support Arabic?',     a:'Real Arabic — not Google Translate. Full RTL interface and an AI coach that teaches natively in Arabic. Built for the GCC first.' },
  { q:'How long are the lessons?',          a:'15–25 minutes each. Designed to fit after school. The streak system encourages one lesson a day — most kids end up doing two.' },
  { q:'Is it safe for my child?',           a:'100% safe. No ads, ever. AI responses filtered for child safety. Parents control the account and get weekly progress emails. Zero data sold.' },
  { q:'How is it different from Scratch?',  a:'Scratch is a great starter — Plulai goes further. Personal AI coach, Arabic support, real project portfolio, and an entrepreneurship track that Scratch simply does not have.' },
]

// ── Quiz component ─────────────────────────────────────────────────────────────

function Quiz() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string,string>>({})
  const [selected, setSelected] = useState<string|null>(null)
  const q = QUIZ_STEPS[step - 1]
  const result = TRACK_RESULT[answers.interest ?? 'coding']

  function next() {
    if (!selected) return
    const na = { ...answers, [q.id]: selected }
    setAnswers(na)
    setSelected(null)
    setStep(step < QUIZ_STEPS.length ? step + 1 : 4)
  }

  if (step === 0) return (
    <div style={{ textAlign:'center' }}>
      <div style={{ fontSize:'3.5rem', marginBottom:16 }}>🎯</div>
      <h3 style={{ fontFamily:'var(--font)', fontSize:'1.4rem', fontWeight:900, color:'#fff', marginBottom:10 }}>
        Find your perfect track!
      </h3>
      <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'0.9rem', marginBottom:24, fontWeight:600 }}>
        3 quick questions · takes 30 seconds
      </p>
      <button onClick={() => setStep(1)} style={{
        background:'#fff', color:'#58CC02', border:'none', borderRadius:16,
        padding:'14px 36px', fontFamily:'var(--font)', fontWeight:900,
        fontSize:'1rem', cursor:'pointer', boxShadow:'0 4px 0 #d4d4d4',
        transition:'transform 0.1s',
      }}
        onMouseDown={e => (e.currentTarget.style.transform='translateY(2px)')}
        onMouseUp={e => (e.currentTarget.style.transform='translateY(0)')}
      >
        Let&apos;s go! 🚀
      </button>
    </div>
  )

  if (step === 4) return (
    <div style={{ textAlign:'center' }}>
      <div style={{ fontSize:'3.5rem', marginBottom:12 }}>🎉</div>
      <p style={{ fontFamily:'var(--font)', fontSize:'0.7rem', fontWeight:900, letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(255,255,255,0.6)', marginBottom:8 }}>
        Your track is ready!
      </p>
      <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:20, padding:'20px 24px', marginBottom:20, border:'2px solid rgba(255,255,255,0.25)' }}>
        <div style={{ fontSize:'2.5rem', marginBottom:8 }}>{result.emoji}</div>
        <div style={{ fontFamily:'var(--font)', fontWeight:900, fontSize:'1.2rem', color:'#fff', marginBottom:6 }}>{result.title}</div>
        <div style={{ fontSize:'0.85rem', color:'rgba(255,255,255,0.75)', fontWeight:600 }}>{result.desc}</div>
      </div>
      <Link href="/auth/signup" style={{
        display:'block', background:'#fff', color:'#58CC02', borderRadius:16,
        padding:'14px', fontFamily:'var(--font)', fontWeight:900, fontSize:'1rem',
        textDecoration:'none', boxShadow:'0 4px 0 #d4d4d4', marginBottom:12,
      }}>
        Start for free! 🎯
      </Link>
      <button onClick={() => { setStep(0); setAnswers({}); setSelected(null) }}
        style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:'0.8rem', fontWeight:700 }}>
        Start over
      </button>
    </div>
  )

  const progress = Math.round((step / QUIZ_STEPS.length) * 100)
  return (
    <div>
      {/* Progress */}
      <div style={{ display:'flex', gap:6, marginBottom:20 }}>
        {QUIZ_STEPS.map((_, i) => (
          <div key={i} style={{ flex:1, height:6, borderRadius:999, background: i < step ? '#fff' : 'rgba(255,255,255,0.25)', transition:'background 0.3s' }} />
        ))}
      </div>
      <p style={{ fontFamily:'var(--font)', fontWeight:900, fontSize:'1.1rem', color:'#fff', marginBottom:16 }}>{q.question}</p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
        {q.options.map(opt => (
          <button key={opt.value} onClick={() => setSelected(opt.value)} style={{
            background: selected === opt.value ? '#fff' : 'rgba(255,255,255,0.12)',
            border: selected === opt.value ? '3px solid #fff' : '3px solid rgba(255,255,255,0.2)',
            borderRadius:16, padding:'16px 12px', cursor:'pointer', textAlign:'left',
            transition:'all 0.15s', transform: selected === opt.value ? 'scale(1.02)' : 'scale(1)',
          }}>
            <div style={{ fontSize:'1.6rem', marginBottom:6 }}>{opt.emoji}</div>
            <div style={{ fontFamily:'var(--font)', fontWeight:800, fontSize:'0.85rem',
              color: selected === opt.value ? '#58CC02' : '#fff', lineHeight:1.2 }}>
              {opt.label}
            </div>
          </button>
        ))}
      </div>
      <button onClick={next} disabled={!selected} style={{
        width:'100%', padding:'14px', borderRadius:16, border:'none',
        fontFamily:'var(--font)', fontWeight:900, fontSize:'1rem', cursor: selected ? 'pointer' : 'not-allowed',
        background: selected ? '#fff' : 'rgba(255,255,255,0.2)',
        color: selected ? '#58CC02' : 'rgba(255,255,255,0.4)',
        boxShadow: selected ? '0 4px 0 #d4d4d4' : 'none',
        transition:'all 0.15s',
      }}>
        {step === QUIZ_STEPS.length ? 'See my track →' : 'Continue →'}
      </button>
    </div>
  )
}

// ── Streak badge ──────────────────────────────────────────────────────────────
function StreakBadge({ n }: { n: number }) {
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:4,
      background:'#FFF3CD', border:'2px solid #FF9600', borderRadius:999,
      padding:'3px 10px', fontSize:'0.72rem', fontWeight:900, color:'#FF9600' }}>
      🔥 {n}-day streak
    </div>
  )
}

// ── XP bar ────────────────────────────────────────────────────────────────────
function XPBar({ label, pct, color }: { label:string; pct:number; color:string }) {
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <span style={{ fontSize:'0.78rem', fontWeight:800 }}>{label}</span>
        <span style={{ fontSize:'0.72rem', fontWeight:700, color:'#777' }}>{pct}%</span>
      </div>
      <div style={{ background:'#E5E5E5', borderRadius:999, height:10, overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, height:'100%', background:color, borderRadius:999, transition:'width 1s ease' }} />
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [openFaq, setOpenFaq] = useState<number|null>(null)
  const [count, setCount] = useState(1247)

  useEffect(() => {
    const s = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', s, { passive:true })
    return () => window.removeEventListener('scroll', s)
  }, [])

  // Live learner count ticks up
  useEffect(() => {
    const id = setInterval(() => setCount(c => c + Math.floor(Math.random() * 2)), 8000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap');
        :root { --font: 'Nunito', sans-serif; }
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html { scroll-behavior:smooth; }
        body { background:#fff; color:#1f1f1f; font-family:var(--font); overflow-x:hidden; }

        @keyframes bounce-in {
          0%   { transform:scale(0.8); opacity:0; }
          60%  { transform:scale(1.05); }
          100% { transform:scale(1); opacity:1; }
        }
        @keyframes float {
          0%,100% { transform:translateY(0); }
          50%      { transform:translateY(-10px); }
        }
        @keyframes wiggle {
          0%,100% { transform:rotate(-3deg); }
          50%      { transform:rotate(3deg); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes marquee {
          0%   { transform:translateX(0); }
          100% { transform:translateX(-50%); }
        }
        @keyframes pulse-green {
          0%,100% { box-shadow:0 0 0 0 rgba(88,204,2,0.4); }
          50%      { box-shadow:0 0 0 8px rgba(88,204,2,0); }
        }

        .btn-green {
          display:inline-block; background:#58CC02; color:#fff;
          border:none; border-radius:16px; padding:16px 40px;
          font-family:var(--font); font-weight:900; font-size:1.05rem;
          cursor:pointer; text-decoration:none;
          box-shadow:0 6px 0 #46A302;
          transition:transform 0.1s, box-shadow 0.1s;
          letter-spacing:0.01em;
        }
        .btn-green:hover  { transform:translateY(-2px); box-shadow:0 8px 0 #46A302; }
        .btn-green:active { transform:translateY(4px);  box-shadow:0 2px 0 #46A302; }

        .btn-outline {
          display:inline-block; background:#fff; color:#1f1f1f;
          border:3px solid #E5E5E5; border-radius:16px; padding:13px 36px;
          font-family:var(--font); font-weight:900; font-size:1rem;
          cursor:pointer; text-decoration:none;
          box-shadow:0 4px 0 #E5E5E5;
          transition:transform 0.1s, box-shadow 0.1s;
        }
        .btn-outline:hover  { transform:translateY(-2px); box-shadow:0 6px 0 #E5E5E5; border-color:#ccc; }
        .btn-outline:active { transform:translateY(3px);  box-shadow:0 1px 0 #E5E5E5; }

        .card {
          background:#fff; border:3px solid #E5E5E5; border-radius:24px;
          padding:28px; transition:transform 0.2s, box-shadow 0.2s;
          box-shadow:0 4px 0 #E5E5E5;
        }
        .card:hover { transform:translateY(-4px); box-shadow:0 8px 0 #E5E5E5; }

        .track-card {
          border-radius:24px; padding:32px; transition:transform 0.2s, box-shadow 0.2s;
          cursor:default;
        }
        .track-card:hover { transform:translateY(-6px); }

        .nav-pill {
          font-family:var(--font); font-size:0.85rem; font-weight:800;
          color:#777; text-decoration:none; padding:8px 16px; border-radius:12px;
          transition:background 0.15s, color 0.15s;
        }
        .nav-pill:hover { background:#F7F7F7; color:#1f1f1f; }

        .section-title {
          font-family:var(--font); font-weight:900;
          font-size:clamp(1.8rem,4vw,2.8rem);
          color:#1f1f1f; line-height:1.15; letter-spacing:-0.02em;
        }
        .section-sub {
          font-size:1rem; color:#777; font-weight:700; line-height:1.6;
        }

        .live-dot { display:inline-block; width:8px; height:8px; border-radius:50%;
          background:#58CC02; animation:pulse-green 2s infinite; }

        .emoji-float { animation:float 3s ease-in-out infinite; display:inline-block; }
        .emoji-wiggle { animation:wiggle 2s ease-in-out infinite; display:inline-block; }

        .faq-item { border:3px solid #E5E5E5; border-radius:20px; overflow:hidden; margin-bottom:12px; }
        .faq-q { width:100%; background:#fff; border:none; padding:20px 24px;
          font-family:var(--font); font-weight:800; font-size:1rem; color:#1f1f1f;
          cursor:pointer; display:flex; justify-content:space-between; align-items:center;
          text-align:left; transition:background 0.15s; }
        .faq-q:hover { background:#F7F7F7; }
        .faq-a { padding:0 24px 20px; font-size:0.9rem; color:#555; line-height:1.7; font-weight:700; }

        @media (max-width:768px) {
          .hide-mobile { display:none !important; }
          .hero-grid { grid-template-columns:1fr !important; }
          .tracks-grid { grid-template-columns:1fr !important; }
          .projects-grid { grid-template-columns:1fr 1fr !important; }
          .steps-grid { grid-template-columns:1fr !important; }
          .testi-grid { grid-template-columns:1fr !important; }
          .pricing-grid { grid-template-columns:1fr !important; }
          .footer-grid { grid-template-columns:1fr !important; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:999,
        padding:'12px 24px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        background: scrolled ? 'rgba(255,255,255,0.97)' : '#fff',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        borderBottom: scrolled ? '3px solid #E5E5E5' : '3px solid transparent',
        transition:'all 0.3s',
      }}>
        <div style={{ fontFamily:'var(--font)', fontWeight:900, fontSize:'1.5rem', color:'#58CC02', letterSpacing:'-0.02em' }}>
          🚀 Plulai
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <a href="#tracks"  className="nav-pill hide-mobile">Tracks</a>
          <a href="#stories" className="nav-pill hide-mobile">Stories</a>
          <a href="#faq"     className="nav-pill hide-mobile">FAQ</a>
          <Link href="/auth/login" className="nav-pill" style={{ marginLeft:8 }}>Log in</Link>
          <Link href="/auth/signup" className="btn-green" style={{ padding:'10px 24px', fontSize:'0.9rem', marginLeft:4 }}>
            Start free →
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ paddingTop:100, paddingBottom:80, paddingLeft:24, paddingRight:24, maxWidth:1200, margin:'0 auto' }}>
        <div className="hero-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center' }}>

          {/* Left */}
          <div style={{ animation:'fadeUp 0.6s ease both' }}>
            {/* Live badge */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#F0FDE4', border:'3px solid #58CC02', borderRadius:999, padding:'6px 16px', marginBottom:24 }}>
              <span className="live-dot" />
              <span style={{ fontWeight:900, fontSize:'0.82rem', color:'#46A302' }}>
                {count.toLocaleString()} kids learning right now
              </span>
            </div>

            <h1 style={{ fontFamily:'var(--font)', fontWeight:900, fontSize:'clamp(2.4rem,5vw,3.6rem)', lineHeight:1.1, letterSpacing:'-0.03em', marginBottom:20 }}>
              The app that makes<br />
              <span style={{ color:'#58CC02' }}>your kid a builder</span><br />
              not just a scroller 📱
            </h1>

            <p style={{ fontSize:'1.05rem', color:'#555', fontWeight:700, lineHeight:1.65, marginBottom:32, maxWidth:480 }}>
              AI coach · 200+ lessons · Real projects · English & Arabic.
              Kids aged 6–18 learn coding, AI and startup skills — 15 minutes a day.
            </p>

            <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:28 }}>
              <Link href="/auth/signup" className="btn-green" style={{ fontSize:'1.1rem', padding:'18px 44px' }}>
                Start for free 🎉
              </Link>
              <a href="#quiz" className="btn-outline">
                Find my track 🎯
              </a>
            </div>

            {/* Trust chips */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {[
                '✅ Free forever plan',
                '✅ No credit card',
                '✅ Arabic & English',
                '✅ Ages 6–18',
                '✅ No ads ever',
              ].map(t => (
                <span key={t} style={{ background:'#F7F7F7', border:'2px solid #E5E5E5', borderRadius:999, padding:'5px 14px', fontSize:'0.78rem', fontWeight:800, color:'#555' }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Right — gamified card */}
          <div style={{ animation:'bounce-in 0.7s 0.2s ease both', opacity:0, animationFillMode:'both' }}>
            <div style={{ background:'linear-gradient(145deg,#58CC02,#46A302)', borderRadius:28, padding:32, boxShadow:'0 20px 60px rgba(88,204,2,0.3)', position:'relative', overflow:'hidden' }}>
              {/* Stars decoration */}
              <div style={{ position:'absolute', top:16, right:16, fontSize:'1.5rem', animation:'wiggle 2s ease-in-out infinite' }}>⭐</div>
              <div style={{ position:'absolute', bottom:16, left:16, fontSize:'1.2rem', animation:'float 2.5s ease-in-out infinite' }}>✨</div>

              {/* Profile row */}
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
                <div style={{ width:52, height:52, borderRadius:16, background:'rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem' }}>🧑‍💻</div>
                <div>
                  <div style={{ fontFamily:'var(--font)', fontWeight:900, fontSize:'1rem', color:'#fff' }}>Ahmed, age 13 🇦🇪</div>
                  <div style={{ display:'flex', gap:8, marginTop:4 }}>
                    <StreakBadge n={47} />
                  </div>
                </div>
              </div>

              {/* XP bars */}
              <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:16, padding:16, marginBottom:16 }}>
                <XPBar label="🐍 Python" pct={78} color="#fff" />
                <XPBar label="🤖 AI Basics" pct={54} color="#FFF3CD" />
                <XPBar label="💡 Startup Thinking" pct={32} color="#FFD4D4" />
              </div>

              {/* Achievement */}
              <div style={{ background:'rgba(255,255,255,0.2)', borderRadius:14, padding:'12px 16px', display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ fontSize:'2rem' }}>🏆</div>
                <div>
                  <div style={{ fontFamily:'var(--font)', fontWeight:900, fontSize:'0.85rem', color:'#fff' }}>Achievement Unlocked!</div>
                  <div style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.8)', fontWeight:700 }}>Built first Python app · +300 XP</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div style={{ background:'#1f1f1f', padding:'16px 0', overflow:'hidden' }}>
        <div style={{ display:'flex' }}>
          <div style={{ display:'flex', gap:0, width:'max-content', animation:'marquee 25s linear infinite' }}>
            {[...Array(2)].flatMap(() =>
              ['🐍 Python','🤖 AI Projects','🌐 Web Dev','💡 Startup Skills','🎮 Game Design','📊 Data Science','⚡ Prompt Engineering','🌍 Arabic & English','🏗️ App Building','🔐 Cybersecurity'].map((item, i) => (
                <span key={item+i} style={{ display:'flex', alignItems:'center', gap:8, padding:'0 28px', fontFamily:'var(--font)', fontWeight:800, fontSize:'0.88rem', whiteSpace:'nowrap',
                  color: i % 2 === 0 ? '#58CC02' : 'rgba(255,255,255,0.7)' }}>
                  {item}
                  <span style={{ color:'rgba(255,255,255,0.2)', fontSize:'1rem' }}>✦</span>
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <section style={{ maxWidth:1200, margin:'0 auto', padding:'60px 24px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
          {[
            { emoji:'👨‍👩‍👧', value:'1,000+', label:'GCC Families', color:'#58CC02' },
            { emoji:'📚', value:'200+',   label:'Lessons',      color:'#1CB0F6' },
            { emoji:'⭐', value:'4.9',    label:'Parent Rating', color:'#FF9600' },
            { emoji:'🌍', value:'6',      label:'Countries',     color:'#FF4B4B' },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign:'center' }}>
              <div style={{ fontSize:'2rem', marginBottom:8 }}>{s.emoji}</div>
              <div style={{ fontFamily:'var(--font)', fontWeight:900, fontSize:'2rem', color:s.color, letterSpacing:'-0.02em' }}>{s.value}</div>
              <div style={{ fontSize:'0.82rem', color:'#777', fontWeight:800, marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRACKS ── */}
      <section id="tracks" style={{ maxWidth:1200, margin:'0 auto', padding:'40px 24px 80px' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div style={{ fontSize:'2.5rem', marginBottom:12 }} className="emoji-float">🗺️</div>
          <h2 className="section-title" style={{ marginBottom:12 }}>Choose your adventure</h2>
          <p className="section-sub">Every track leads to real skills. Most kids try all three!</p>
        </div>

        <div className="tracks-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
          {[
            { emoji:'💻', title:'Coding Track',  sub:'For future developers', color:'#58CC02', bg:'#F0FDE4', border:'#58CC02',
              outcome:'Real app in 3 months', skills:['Python','Web Dev','Game Design','App Building'],
              desc:'From zero to building real apps and games. Week 2: first working program.' },
            { emoji:'🤖', title:'AI Track',      sub:'For future innovators', color:'#1CB0F6', bg:'#E8F7FD', border:'#1CB0F6',
              outcome:'Working AI project', skills:['What is AI?','Machine Learning','AI Ethics','Build an AI'],
              desc:'Actually build AI — not just read about it. Your own ML project by month 2.' },
            { emoji:'💡', title:'Startup Track', sub:'For future founders',   color:'#FF9600', bg:'#FFF8ED', border:'#FF9600',
              outcome:'Pitch + MVP in 3 months', skills:['Idea Generation','Market Research','Build MVP','Pitch'],
              desc:'From first idea to polished investor pitch. Win school competitions!' },
          ].map(t => (
            <div key={t.title} className="track-card" style={{ background:t.bg, border:`3px solid ${t.border}33`, boxShadow:`0 6px 0 ${t.border}33` }}>
              <div style={{ fontSize:'2.8rem', marginBottom:12 }}>{t.emoji}</div>
              <div style={{ fontFamily:'var(--font)', fontWeight:900, fontSize:'1.3rem', color:t.color, marginBottom:4 }}>{t.title}</div>
              <div style={{ fontSize:'0.75rem', fontWeight:800, color:'#777', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>{t.sub}</div>
              <div style={{ background:t.color, color:'#fff', borderRadius:10, padding:'8px 14px', fontSize:'0.8rem', fontWeight:900, marginBottom:16, display:'inline-block' }}>
                ✓ {t.outcome}
              </div>
              <p style={{ fontSize:'0.88rem', color:'#555', fontWeight:700, lineHeight:1.6, marginBottom:16 }}>{t.desc}</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {t.skills.map(s => (
                  <span key={s} style={{ background:'rgba(255,255,255,0.8)', border:`2px solid ${t.border}44`, borderRadius:999, padding:'3px 12px', fontSize:'0.75rem', fontWeight:800, color:t.color }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign:'center', marginTop:40 }}>
          <Link href="/auth/signup" className="btn-green" style={{ fontSize:'1.05rem' }}>
            Start any track for free 🎯
          </Link>
          <p style={{ fontSize:'0.8rem', color:'#777', fontWeight:700, marginTop:12 }}>No commitment. Switch tracks anytime.</p>
        </div>
      </section>

      {/* ── QUIZ ── */}
      <section id="quiz" style={{ background:'linear-gradient(135deg,#58CC02,#1CB0F6)', padding:'80px 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center' }}
          className="hero-grid">
          <div>
            <div style={{ fontSize:'3rem', marginBottom:16 }} className="emoji-wiggle">🎯</div>
            <h2 style={{ fontFamily:'var(--font)', fontWeight:900, fontSize:'clamp(1.8rem,4vw,2.6rem)', color:'#fff', marginBottom:16, letterSpacing:'-0.02em', lineHeight:1.15 }}>
              Not sure where to start?
            </h2>
            <p style={{ fontSize:'1rem', color:'rgba(255,255,255,0.85)', fontWeight:700, lineHeight:1.65 }}>
              Take a 30-second quiz and get a personalised track recommendation for your child. Free, no account needed.
            </p>
          </div>
          <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:28, padding:28, backdropFilter:'blur(10px)', border:'3px solid rgba(255,255,255,0.3)' }}>
            <Quiz />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ maxWidth:1200, margin:'0 auto', padding:'80px 24px' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div style={{ fontSize:'2.5rem', marginBottom:12 }}>🚀</div>
          <h2 className="section-title" style={{ marginBottom:12 }}>From zero to builder in 3 steps</h2>
          <p className="section-sub">No setup. No downloads. Works right now on any device.</p>
        </div>

        <div className="steps-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
          {[
            { n:1, emoji:'🎯', title:'Find your track', desc:"60-second quiz → personalised curriculum matched to your child's age and interests.", time:'60 seconds', color:'#58CC02' },
            { n:2, emoji:'🤖', title:'Meet your AI coach', desc:"Personal AI tutor says hello in English or Arabic and kicks off lesson 1. Adapts to your level.", time:'Day 1', color:'#1CB0F6' },
            { n:3, emoji:'🏆', title:'Build something real', desc:"Week 2: first real project. Month 3: a full portfolio of apps, AI tools and pitches.", time:'Week 2', color:'#FF9600' },
          ].map((s, i) => (
            <div key={i} className="card" style={{ textAlign:'center', position:'relative' }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:s.color, display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:'var(--font)', fontWeight:900, color:'#fff', fontSize:'1.1rem', margin:'0 auto 16px' }}>{s.n}</div>
              <div style={{ fontSize:'2.5rem', marginBottom:12 }}>{s.emoji}</div>
              <h3 style={{ fontFamily:'var(--font)', fontWeight:900, fontSize:'1.05rem', marginBottom:8 }}>{s.title}</h3>
              <p style={{ fontSize:'0.88rem', color:'#555', fontWeight:700, lineHeight:1.65, marginBottom:16 }}>{s.desc}</p>
              <span style={{ background:s.color+'22', border:`2px solid ${s.color}44`, borderRadius:999, padding:'4px 14px', fontSize:'0.75rem', fontWeight:900, color:s.color }}>
                {s.time}
              </span>
              {i < 2 && <div style={{ position:'absolute', top:'40%', right:-18, fontSize:'1.5rem', color:'#E5E5E5', fontWeight:900, zIndex:1 }} className="hide-mobile">→</div>}
            </div>
          ))}
        </div>

        <div style={{ textAlign:'center', marginTop:40 }}>
          <Link href="/auth/signup" className="btn-green">Start step 1 — free! 🎉</Link>
        </div>
      </section>

      {/* ── WHAT KIDS BUILD ── */}
      <section id="projects" style={{ background:'#F7F7F7', padding:'80px 24px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ fontSize:'2.5rem', marginBottom:12 }}>🏗️</div>
            <h2 className="section-title" style={{ marginBottom:12 }}>What kids build on Plulai</h2>
            <p className="section-sub">Not exercises. Not theory. Things that actually exist in the world.</p>
          </div>

          <div className="projects-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {PROJECTS.map((p, i) => (
              <div key={i} className="card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <span style={{ background:p.color+'22', border:`2px solid ${p.color}44`, borderRadius:999, padding:'3px 12px', fontSize:'0.72rem', fontWeight:900, color:p.color }}>
                    {p.track}
                  </span>
                  <span style={{ fontSize:'0.75rem', color:'#777', fontWeight:800 }}>Week {p.weeks}</span>
                </div>
                <p style={{ fontFamily:'var(--font)', fontWeight:800, fontSize:'0.95rem', color:'#1f1f1f', marginBottom:12, lineHeight:1.4 }}>
                  &ldquo;{p.project}&rdquo;
                </p>
                <div style={{ display:'flex', gap:6, fontSize:'0.78rem', color:'#777', fontWeight:800 }}>
                  <span>{p.country}</span><span>·</span><span>Age {p.age}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign:'center', marginTop:40 }}>
            <Link href="/auth/signup" className="btn-green">Start building — free 🏗️</Link>
            <p style={{ fontSize:'0.8rem', color:'#777', fontWeight:700, marginTop:12 }}>Your child&apos;s first project: ready by end of week 2.</p>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="stories" style={{ maxWidth:1200, margin:'0 auto', padding:'80px 24px' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div style={{ fontSize:'2.5rem', marginBottom:12 }}>💛</div>
          <h2 className="section-title" style={{ marginBottom:12 }}>Real kids. Real results.</h2>
          <p className="section-sub">Every kid has a story like these. This is the norm.</p>
        </div>

        <div className="testi-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="card" style={{ position:'relative' }}>
              <div style={{ display:'flex', gap:'0.5rem', color:'#FF9600', fontSize:'1rem', marginBottom:12 }}>{'⭐'.repeat(5)}</div>
              <StreakBadge n={t.streak} />
              <p style={{ fontFamily:'var(--font)', fontWeight:700, fontSize:'0.92rem', color:'#1f1f1f', lineHeight:1.65, margin:'16px 0', fontStyle:'italic' }}>
                &ldquo;{t.text}&rdquo;
              </p>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:44, height:44, borderRadius:14, background:'#F0FDE4', border:'3px solid #58CC02', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem' }}>
                  {t.avatar}
                </div>
                <div>
                  <div style={{ fontFamily:'var(--font)', fontWeight:900, fontSize:'0.88rem' }}>{t.name}, age {t.age}</div>
                  <div style={{ fontSize:'0.78rem', color:'#777', fontWeight:800 }}>{t.flag}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── GCC ── */}
      <section style={{ background:'#1f1f1f', padding:'80px 24px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ fontSize:'2.5rem', marginBottom:12 }} className="emoji-float">🌍</div>
            <h2 style={{ fontFamily:'var(--font)', fontWeight:900, fontSize:'clamp(1.8rem,4vw,2.6rem)', color:'#fff', marginBottom:12 }}>
              The GCC&apos;s #1 kids&apos; edtech platform
            </h2>
            <p style={{ fontSize:'1rem', color:'rgba(255,255,255,0.6)', fontWeight:700 }}>
              Built for the region first — real Arabic, real culture, real relevance.
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:12, marginBottom:40 }}>
            {[
              { flag:'🇦🇪', name:'UAE',     city:'Dubai & Abu Dhabi' },
              { flag:'🇸🇦', name:'Saudi',   city:'Riyadh & Jeddah'  },
              { flag:'🇶🇦', name:'Qatar',   city:'Doha'              },
              { flag:'🇰🇼', name:'Kuwait',  city:'Kuwait City'       },
              { flag:'🇧🇭', name:'Bahrain', city:'Manama'            },
              { flag:'🇴🇲', name:'Oman',    city:'Muscat'            },
            ].map(c => (
              <div key={c.name} style={{ background:'rgba(255,255,255,0.06)', border:'2px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'20px 12px', textAlign:'center', transition:'background 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.background='rgba(88,204,2,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background='rgba(255,255,255,0.06)')}>
                <div style={{ fontSize:'2.2rem', marginBottom:8 }}>{c.flag}</div>
                <div style={{ fontFamily:'var(--font)', fontWeight:900, fontSize:'0.8rem', color:'#fff', marginBottom:4 }}>{c.name}</div>
                <div style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.4)', fontWeight:700 }}>{c.city}</div>
              </div>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }} className="pricing-grid">
            <div style={{ background:'rgba(88,204,2,0.1)', border:'3px solid rgba(88,204,2,0.3)', borderRadius:24, padding:28 }}>
              <div style={{ fontSize:'2rem', marginBottom:12 }}>🌐</div>
              <h3 style={{ fontFamily:'var(--font)', fontWeight:900, fontSize:'1.1rem', color:'#fff', marginBottom:8 }}>Real Arabic, not translated</h3>
              <p style={{ fontSize:'0.88rem', color:'rgba(255,255,255,0.6)', fontWeight:700, lineHeight:1.65 }}>
                Full RTL interface. AI coach that teaches natively in Arabic. The only platform built for Arabic-speaking kids first.
              </p>
            </div>
            <div style={{ background:'rgba(28,176,246,0.1)', border:'3px solid rgba(28,176,246,0.3)', borderRadius:24, padding:28 }}>
              <div style={{ fontSize:'2rem', marginBottom:12 }}>🎓</div>
              <h3 style={{ fontFamily:'var(--font)', fontWeight:900, fontSize:'1.1rem', color:'#fff', marginBottom:8 }}>Aligned with UAE Vision 2031</h3>
              <p style={{ fontSize:'0.88rem', color:'rgba(255,255,255,0.6)', fontWeight:700, lineHeight:1.65 }}>
                AI, coding, and entrepreneurship are the three pillars the GCC economy demands from the next generation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ maxWidth:900, margin:'0 auto', padding:'80px 24px' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div style={{ fontSize:'2.5rem', marginBottom:12 }}>💰</div>
          <h2 className="section-title" style={{ marginBottom:12 }}>Start free. Upgrade when ready.</h2>
          <p className="section-sub">No pressure. The free plan is genuinely useful.</p>
        </div>

        <div className="pricing-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          {/* Free */}
          <div style={{ border:'3px solid #58CC02', borderRadius:24, padding:36, position:'relative', boxShadow:'0 8px 0 #46A30233' }}>
            <div style={{ position:'absolute', top:-16, left:'50%', transform:'translateX(-50%)', background:'#58CC02', color:'#fff', borderRadius:999, padding:'4px 20px', fontFamily:'var(--font)', fontWeight:900, fontSize:'0.78rem', whiteSpace:'nowrap' }}>
              Most parents start here ⭐
            </div>
            <div style={{ fontSize:'2rem', marginBottom:12 }}>🎁</div>
            <div style={{ fontFamily:'var(--font)', fontWeight:900, fontSize:'1.4rem', marginBottom:4 }}>Free</div>
            <div style={{ fontFamily:'var(--font)', fontWeight:900, fontSize:'3rem', color:'#58CC02', lineHeight:1, marginBottom:4 }}>$0</div>
            <div style={{ fontSize:'0.8rem', color:'#777', fontWeight:700, marginBottom:28 }}>forever · no card needed</div>
            {['First module of each track','Personal AI coach','XP & streak system','Parent dashboard','Arabic & English','Any device'].map(f => (
              <div key={f} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <span style={{ color:'#58CC02', fontWeight:900 }}>✓</span>
                <span style={{ fontSize:'0.88rem', fontWeight:700 }}>{f}</span>
              </div>
            ))}
            <Link href="/auth/signup" className="btn-green" style={{ display:'block', textAlign:'center', marginTop:24, padding:'14px' }}>
              🚀 Start free now
            </Link>
          </div>

          {/* Pro */}
          <div style={{ border:'3px solid #E5E5E5', borderRadius:24, padding:36, boxShadow:'0 6px 0 #E5E5E5' }}>
            <div style={{ fontSize:'2rem', marginBottom:12 }}>⚡</div>
            <div style={{ fontFamily:'var(--font)', fontWeight:900, fontSize:'1.4rem', marginBottom:4 }}>Pro</div>
            <div style={{ fontFamily:'var(--font)', fontWeight:900, fontSize:'3rem', color:'#1f1f1f', lineHeight:1, marginBottom:4 }}>$79</div>
            <div style={{ fontSize:'0.8rem', color:'#777', fontWeight:700, marginBottom:28 }}>per month · cancel anytime</div>
            {['All 200+ lessons unlocked','Advanced AI coaching','Full portfolio system','Live project feedback','Certificate of completion','Priority support'].map(f => (
              <div key={f} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <span style={{ color:'#1CB0F6', fontWeight:900 }}>✓</span>
                <span style={{ fontSize:'0.88rem', fontWeight:700, color:'#555' }}>{f}</span>
              </div>
            ))}
            <Link href="/auth/signup?plan=pro" className="btn-outline" style={{ display:'block', textAlign:'center', marginTop:24, padding:'14px' }}>
              Start with Pro →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ maxWidth:760, margin:'0 auto', padding:'40px 24px 80px' }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ fontSize:'2.5rem', marginBottom:12 }}>🤔</div>
          <h2 className="section-title" style={{ marginBottom:12 }}>Questions? We got answers.</h2>
        </div>
        {FAQ.map((item, i) => (
          <div key={i} className="faq-item">
            <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <span>{item.q}</span>
              <span style={{ fontSize:'1.4rem', color:'#58CC02', transition:'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'none', display:'inline-block', marginLeft:16, flexShrink:0 }}>+</span>
            </button>
            {openFaq === i && <div className="faq-a">{item.a}</div>}
          </div>
        ))}
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ background:'linear-gradient(135deg,#58CC02 0%,#46A302 100%)', padding:'80px 24px', textAlign:'center' }}>
        <div style={{ maxWidth:680, margin:'0 auto' }}>
          <div style={{ fontSize:'4rem', marginBottom:20 }} className="emoji-float">🚀</div>
          <h2 style={{ fontFamily:'var(--font)', fontWeight:900, fontSize:'clamp(2rem,5vw,3rem)', color:'#fff', marginBottom:16, letterSpacing:'-0.02em', lineHeight:1.15 }}>
            The best time to start<br />was yesterday.
          </h2>
          <p style={{ fontSize:'1rem', color:'rgba(255,255,255,0.85)', fontWeight:700, marginBottom:36, lineHeight:1.65 }}>
            Join 1,247 kids across UAE, Saudi Arabia, Qatar, Kuwait, Bahrain and Oman who are already building the skills that matter.
          </p>
          <Link href="/auth/signup" style={{
            display:'inline-block', background:'#fff', color:'#58CC02',
            border:'none', borderRadius:16, padding:'18px 52px',
            fontFamily:'var(--font)', fontWeight:900, fontSize:'1.15rem',
            cursor:'pointer', textDecoration:'none',
            boxShadow:'0 6px 0 rgba(0,0,0,0.15)',
            transition:'transform 0.1s, box-shadow 0.1s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow='0 8px 0 rgba(0,0,0,0.15)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform='translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow='0 6px 0 rgba(0,0,0,0.15)'; }}
          >
            🎉 Claim your free spot now
          </Link>
          <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:12, marginTop:24 }}>
            {['✅ Free forever','✅ No credit card','✅ Arabic & English','✅ Ages 6–18','✅ No ads ever'].map(t => (
              <span key={t} style={{ background:'rgba(255,255,255,0.2)', borderRadius:999, padding:'5px 14px', fontSize:'0.78rem', fontWeight:800, color:'#fff' }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:'3px solid #E5E5E5', padding:'48px 24px', background:'#fff' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div className="footer-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:40, marginBottom:40 }}>
            <div>
              <div style={{ fontFamily:'var(--font)', fontWeight:900, fontSize:'1.4rem', color:'#58CC02', marginBottom:12 }}>🚀 Plulai</div>
              <p style={{ fontSize:'0.82rem', color:'#777', fontWeight:700, lineHeight:1.65 }}>
                The #1 edtech platform for kids in the GCC. Coding, AI & Startup skills for ages 6–18.
              </p>
            </div>
            {[
              { title:'Platform', links:[['Find a Track','#quiz'],['Projects','#projects'],['Pricing','/pricing'],['Sign Up Free','/auth/signup']] },
              { title:'Countries', links:[['🇦🇪 UAE','#'],['🇸🇦 Saudi Arabia','#'],['🇶🇦 Qatar','#'],['🇰🇼 Kuwait','#']] },
              { title:'Company', links:[['Contact','mailto:hello@plulai.com'],['Partners','mailto:partners@plulai.com'],['Schools','mailto:schools@plulai.com']] },
            ].map(col => (
              <div key={col.title}>
                <p style={{ fontFamily:'var(--font)', fontWeight:900, fontSize:'0.85rem', marginBottom:14 }}>{col.title}</p>
                {col.links.map(([label, href]) => (
                  <a key={label} href={href} style={{ display:'block', fontSize:'0.82rem', color:'#777', fontWeight:700, textDecoration:'none', marginBottom:8, transition:'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color='#1f1f1f')}
                    onMouseLeave={e => (e.currentTarget.style.color='#777')}>{label}</a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop:'2px solid #E5E5E5', paddingTop:20, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <p style={{ fontSize:'0.8rem', color:'#aaa', fontWeight:700 }}>© {new Date().getFullYear()} Plulai · Built with ❤️ for the GCC</p>
            <a href="mailto:hello@plulai.com" style={{ fontSize:'0.8rem', color:'#aaa', fontWeight:700, textDecoration:'none' }}>hello@plulai.com</a>
          </div>
        </div>
      </footer>
    </>
  )
}
