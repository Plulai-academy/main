// app/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { PAGE_SEO, SEO_CONFIG } from '@/lib/seo/config'

export const metadata: Metadata = {
  title:       PAGE_SEO.home.title,
  description: PAGE_SEO.home.description,
  alternates:  { canonical: PAGE_SEO.home.canonical },
  openGraph: {
    title:       PAGE_SEO.home.title,
    description: PAGE_SEO.home.description,
    url:         PAGE_SEO.home.canonical,
  },
}

const STATS = [
  // { value: '1,000+', label: 'Kids Learning',     emoji: '👦' },
  { value: '6',      label: 'GCC Countries',      emoji: '🌍' },
  { value: '200+',   label: 'Lessons',            emoji: '📚' },
  { value: '4.9★',   label: 'Average Rating',     emoji: '⭐' },
]

const FEATURES = [
  { emoji:'🤖', title:'Personal AI Coach',       desc:'Your child gets their own AI mentor that speaks their language, adapts to their age, and explains things like a patient tutor — available 24/7.',   color:'from-accent4/20 to-accent5/20', border:'border-accent4/20' },
  { emoji:'🎮', title:'Gamified Like Duolingo',  desc:'XP points, daily streaks, skill trees, badges and level-ups keep kids motivated and coming back every day.',                                        color:'from-accent1/20 to-accent2/20', border:'border-accent1/20' },
  { emoji:'🌍', title:'Built for UAE & GCC',     desc:'Full Arabic RTL interface and bilingual AI coaching. Content designed for kids in Dubai, Riyadh, Doha, Kuwait City and Muscat.',                   color:'from-accent3/20 to-accent4/20', border:'border-accent3/20' },
  { emoji:'💻', title:'3 Power Tracks',          desc:'Master Coding, Artificial Intelligence and Entrepreneurship — the 3 skills every future leader in the GCC needs right now.',                        color:'from-accent5/20 to-accent1/20', border:'border-accent5/20' },
  { emoji:'🏆', title:'Real Projects',           desc:"Kids don't just do exercises. They build real apps, AI projects and startup pitches — creating a portfolio they're proud of.",                      color:'from-accent2/20 to-accent3/20', border:'border-accent2/20' },
  { emoji:'📊', title:'Parent Dashboard',        desc:'Parents and teachers track progress, streaks, XP and badges in real time. Stay involved without hovering.',                                        color:'from-accent4/20 to-accent3/20', border:'border-accent4/20' },
]

const TRACKS = [
  {
    id: 'coding',
    emoji: '💻',
    title: 'Coding Track',
    subtitle: 'For future developers',
    desc: 'From "Hello World" to building real web apps and games. Kids learn Python, HTML, and how to think like a programmer.',
    skills: ['Python Basics', 'Web Development', 'Game Design', 'App Building'],
    color: 'from-accent4/10 to-accent5/10',
    border: 'border-accent4/30',
    badge: 'accent4',
  },
  {
    id: 'ai',
    emoji: '🧠',
    title: 'AI Track',
    subtitle: 'For future innovators',
    desc: 'Kids learn what AI really is, how machine learning works, and build their own AI projects — no PhD required.',
    skills: ['What is AI?', 'Machine Learning', 'AI Ethics', 'Build an AI Project'],
    color: 'from-accent5/10 to-accent1/10',
    border: 'border-accent5/30',
    badge: 'accent5',
  },
  {
    id: 'entrepreneurship',
    emoji: '💡',
    title: 'Entrepreneurship Track',
    subtitle: 'For future founders',
    desc: 'From idea to pitch. Kids learn how to validate ideas, build products, and present them — UAE startup culture built in.',
    skills: ['Idea Generation', 'Market Research', 'Build a MVP', 'Pitch Your Startup'],
    color: 'from-accent3/10 to-accent4/10',
    border: 'border-accent3/30',
    badge: 'accent3',
  },
]

const TESTIMONIALS = [
  { name:'Ahmed K.',  age:13, country:'🇦🇪 Dubai',    text:'I built my first AI chatbot in 2 weeks! Plulai made it so easy and fun. My teacher was impressed.',       avatar:'🧑‍💻' },
  { name:'Sara M.',   age:10, country:'🇸🇦 Riyadh',   text:"I love the streak system. I've learned coding for 21 days in a row! My parents are so proud.",             avatar:'👩‍🎨' },
  { name:'Yousef A.', age:15, country:'🇶🇦 Doha',     text:'The AI coach explains things like a friend, not a boring textbook. I actually look forward to studying.',   avatar:'🧑‍🚀' },
  { name:'Nour R.',   age:11, country:'🇰🇼 Kuwait',   text:"I won my school's startup competition using what I learned on Plulai! The entrepreneurship track is 🔥",     avatar:'🦸'   },
  { name:'Zaid T.',   age:14, country:'🇦🇪 Abu Dhabi', text:'Finally an edtech app that feels like a game. I finished the whole Python track in 3 months.',             avatar:'🤖'   },
  { name:'Lina K.',   age:9,  country:'🇧🇭 Bahrain',  text:"I made a website for my mum's shop using what I learned. She was amazed that I could do that!",            avatar:'👩‍💻' },
]

const GCC = [
  { flag:'🇦🇪', name:'UAE',           city:'Dubai & Abu Dhabi' },
  { flag:'🇸🇦', name:'Saudi Arabia',  city:'Riyadh & Jeddah'  },
  { flag:'🇶🇦', name:'Qatar',         city:'Doha'              },
  { flag:'🇰🇼', name:'Kuwait',        city:'Kuwait City'       },
  { flag:'🇧🇭', name:'Bahrain',       city:'Manama'            },
  { flag:'🇴🇲', name:'Oman',          city:'Muscat'            },
]

const FAQ = [
  { q: 'What is Plulai?',         a: 'Plulai is the #1 edtech platform for kids aged 6-18 in the UAE and GCC. Kids learn coding, AI and entrepreneurship through a personal AI coach, gamified lessons, XP points and real projects — all in English and Arabic.' },
  { q: 'Is Plulai free?',         a: 'Yes! Plulai offers a free plan with no credit card required. Kids can start learning coding, AI and entrepreneurship immediately. We also offer a Pro plan with unlimited access to all 200+ lessons.' },
  { q: 'What age is Plulai for?', a: 'Plulai is designed for children aged 6 to 18. The platform automatically adapts — Mini Explorers (6-8), Junior Creators (9-11), Pro Explorers (12-14) and Tech Experts (15-18) each get age-appropriate content.' },
  { q: 'Does Plulai support Arabic?', a: 'Yes! Plulai has a full Arabic right-to-left interface and an AI coach that teaches entirely in Arabic. It is the only edtech platform built region-first for the UAE, Saudi Arabia, Qatar and the wider GCC.' },
  { q: 'What does Plulai teach?', a: 'Plulai teaches three tracks: Coding (Python, web development, games), Artificial Intelligence (ML, AI projects, ethics) and Entrepreneurship (startup ideas, MVPs, pitching). Each track has 60+ lessons.' },
  { q: 'How is Plulai different from other edtech apps?', a: "Unlike generic global platforms, Plulai is built specifically for the GCC. The content references UAE culture and context, the AI coach speaks Arabic, and the curriculum is designed to prepare kids for the UAE's Vision 2031 economy." },
]

export default function LandingPage() {
  return (
    <div className="relative z-10 min-h-screen">

      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 lg:px-12 py-3 md:py-4 glass border-b border-white/5">
        <div className="font-fredoka text-2xl bg-gradient-to-r from-accent2 to-accent1 bg-clip-text text-transparent">
          Plulai
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-muted">
          <a href="#tracks"   className="hover:text-white transition-colors">Tracks</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#gcc"      className="hover:text-white transition-colors">GCC</a>
          <a href="#faq"      className="hover:text-white transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Link href="/auth/login"  className="hidden md:block text-sm font-bold text-muted hover:text-white transition-colors">Log In</Link>
          <Link href="/auth/signup" className="px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-accent4 to-accent5 hover:-translate-y-0.5 transition-all shadow-lg shadow-accent4/20">
            Start Free →
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-28 md:pt-36 pb-16 md:pb-24 px-4 md:px-6 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-accent2/10 border border-accent2/25 rounded-full px-3 py-1.5 md:px-4 md:py-2 text-xs font-bold text-accent2 mb-6 md:mb-8">
          🌟 #1 Edtech Platform for Kids in the UAE & GCC
        </div>

        <h1 className="font-fredoka text-4xl sm:text-5xl lg:text-7xl leading-tight mb-5 md:mb-6">
          <span className="bg-gradient-to-r from-accent2 via-accent1 to-accent5 bg-clip-text text-transparent">
            Coding, AI & Entrepreneurship
          </span>
          <br />
          <span className="text-white">for Kids in the UAE 🚀</span>
        </h1>

        <p className="text-muted text-base md:text-lg lg:text-xl font-semibold max-w-2xl mx-auto mb-3 leading-relaxed">
          <strong className="text-white">Plulai</strong> is the gamified edtech platform that teaches kids aged 6–18 the skills of the future —
          through a personal <strong className="text-white">AI coach</strong>, 200+ lessons, and real projects.
          In <strong className="text-white">English and Arabic.</strong>
        </p>
        <p className="text-muted text-xs md:text-sm font-bold mb-8 md:mb-10">
          Trusted by 1,000+ kids across UAE, Saudi Arabia, Qatar, Kuwait, Bahrain & Oman
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-12 md:mb-16">
          <Link
            href="/auth/signup"
            className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-2xl font-extrabold text-lg md:text-xl text-white bg-gradient-to-r from-accent3 to-accent4 shadow-[0_0_40px_rgba(107,203,119,0.3)] hover:-translate-y-1 transition-all animate-glow-pulse"
          >
            🚀 Start Learning Free
          </Link>
          <a
            href="#tracks"
            className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-2xl font-extrabold text-base md:text-lg text-muted bg-card border border-white/10 hover:text-white transition-all"
          >
            ▶ See the Curriculum
          </a>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {STATS.map(s => (
            <div key={s.label} className="bg-card border border-white/5 rounded-2xl p-4 md:p-5 text-center">
              <div className="text-xl md:text-2xl mb-1 md:mb-2">{s.emoji}</div>
              <div className="font-fredoka text-2xl md:text-3xl text-white">{s.value}</div>
              <div className="text-muted text-xs md:text-sm font-bold mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tracks ── */}
      <section id="tracks" className="py-16 md:py-24 px-4 md:px-6 max-w-6xl mx-auto">
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center mb-3 md:mb-4">
          3 Tracks. 1 Future. 🏆
        </h2>
        <p className="text-center text-muted font-semibold mb-10 md:mb-16 text-base md:text-lg max-w-2xl mx-auto">
          Every kid follows their passion. All three tracks teach the skills that matter most for careers in 2030 and beyond.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
          {TRACKS.map(t => (
            <div key={t.id} className={`bg-gradient-to-br ${t.color} border ${t.border} rounded-3xl p-6 md:p-8 flex flex-col hover:-translate-y-1 transition-all`}>
              <div className="text-4xl md:text-5xl mb-3 md:mb-4">{t.emoji}</div>
              <h3 className="font-fredoka text-xl md:text-2xl mb-1">{t.title}</h3>
              <p className="text-muted text-xs font-bold uppercase tracking-widest mb-3 md:mb-4">{t.subtitle}</p>
              <p className="text-muted text-sm font-semibold leading-relaxed mb-5 md:mb-6">{t.desc}</p>
              <ul className="space-y-2 mt-auto">
                {t.skills.map(s => (
                  <li key={s} className="flex items-center gap-2 text-sm font-bold">
                    <span className="text-accent3">✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-16 md:py-24 px-4 md:px-6 max-w-6xl mx-auto">
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center mb-3 md:mb-4">
          Why Kids Love Plulai 🌟
        </h2>
        <p className="text-center text-muted font-semibold mb-10 md:mb-16 text-base md:text-lg max-w-2xl mx-auto">
          Built specifically for the UAE and GCC — in their language, at their level, with their culture in mind.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {FEATURES.map((f, i) => (
            <div key={i} className={`bg-gradient-to-br ${f.color} border ${f.border} rounded-3xl p-6 md:p-7 hover:-translate-y-1 transition-all`}>
              <div className="text-3xl md:text-4xl mb-3 md:mb-4">{f.emoji}</div>
              <h3 className="font-fredoka text-lg md:text-xl mb-2">{f.title}</h3>
              <p className="text-muted text-sm font-semibold leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── GCC ── */}
      <section id="gcc" className="py-16 md:py-24 px-4 md:px-6 max-w-5xl mx-auto">
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center mb-3 md:mb-4">
          The GCC&apos;s #1 Edtech Platform 🌍
        </h2>
        <p className="text-center text-muted font-semibold mb-10 md:mb-16 text-base md:text-lg max-w-2xl mx-auto">
          The only kids&apos; learning platform built region-first — culturally relevant, fully bilingual, and designed for the GCC&apos;s next generation.
        </p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 mb-8 md:mb-12">
          {GCC.map(c => (
            <div key={c.name} className="bg-card border border-white/5 rounded-2xl p-3 md:p-4 text-center hover:border-white/15 transition-all">
              <div className="text-3xl md:text-4xl mb-1 md:mb-2">{c.flag}</div>
              <div className="font-extrabold text-xs mb-0.5 md:mb-1">{c.name}</div>
              <div className="text-muted text-xs font-bold hidden sm:block">{c.city}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <div className="bg-gradient-to-r from-accent4/10 to-accent5/10 border border-accent4/20 rounded-3xl p-6 md:p-8">
            <div className="text-3xl md:text-4xl mb-3 md:mb-4">🌐</div>
            <h3 className="font-fredoka text-xl md:text-2xl mb-2 md:mb-3">Full Arabic Support</h3>
            <p className="text-muted font-semibold leading-relaxed text-sm md:text-base">
              Complete Arabic RTL interface. AI coach that teaches entirely in Arabic. The only edtech platform built for Arabic-speaking kids first.
            </p>
          </div>
          <div className="bg-gradient-to-r from-accent3/10 to-accent4/10 border border-accent3/20 rounded-3xl p-6 md:p-8">
            <div className="text-3xl md:text-4xl mb-3 md:mb-4">🎓</div>
            <h3 className="font-fredoka text-xl md:text-2xl mb-2 md:mb-3">Aligned with UAE Vision</h3>
            <p className="text-muted font-semibold leading-relaxed text-sm md:text-base">
              Curriculum designed to prepare kids for UAE Vision 2031 — the skills economy that demands AI, coding and entrepreneurship from the next generation.
            </p>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="stories" className="py-16 md:py-24 px-4 md:px-6 max-w-5xl mx-auto">
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center mb-3 md:mb-4">
          Kids Across the GCC Love Plulai 💛
        </h2>
        <p className="text-center text-muted font-semibold mb-10 md:mb-16 text-base md:text-lg">Real stories from real kids in UAE, Saudi Arabia, Qatar, Kuwait and Bahrain.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-card border border-white/5 rounded-3xl p-5 md:p-7">
              <div className="flex gap-1 text-accent2 mb-3 md:mb-4">{'⭐'.repeat(5)}</div>
              <p className="text-white font-semibold leading-relaxed mb-4 md:mb-5 italic text-sm">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-card2 flex items-center justify-center text-lg md:text-xl">{t.avatar}</div>
                <div>
                  <div className="font-extrabold text-sm">{t.name}, age {t.age}</div>
                  <div className="text-muted text-xs font-bold">{t.country}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-16 md:py-24 px-4 md:px-6 max-w-3xl mx-auto">
        <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl text-center mb-3 md:mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-center text-muted font-semibold mb-10 md:mb-16 text-base md:text-lg">Everything parents ask about Plulai.</p>
        <div className="space-y-3 md:space-y-4">
          {FAQ.map((item, i) => (
            <details key={i} className="bg-card border border-white/5 rounded-2xl group">
              <summary className="flex items-center justify-between px-5 py-4 md:px-6 md:py-5 cursor-pointer font-bold text-white list-none text-sm md:text-base">
                <span>{item.q}</span>
                <span className="text-muted group-open:rotate-180 transition-transform text-lg ml-3 shrink-0">▾</span>
              </summary>
              <p className="px-5 pb-4 md:px-6 md:pb-5 text-muted font-semibold text-sm leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 md:py-24 px-4 md:px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-5xl md:text-6xl mb-5 md:mb-6 animate-bounce-slow">🚀</div>
          <h2 className="font-fredoka text-3xl md:text-4xl lg:text-5xl mb-4 md:mb-5">
            Give Your Child the Skills of the Future
          </h2>
          <p className="text-muted font-semibold text-base md:text-lg mb-3">
            Join 1,000+ kids in UAE, Saudi Arabia, Qatar and Kuwait who are already learning coding, AI and entrepreneurship on Plulai.
          </p>
          <p className="text-muted text-xs md:text-sm font-bold mb-8 md:mb-10">Free to start. No credit card. Arabic & English. Ages 6–18.</p>
          <Link
            href="/auth/signup"
            className="inline-block w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 rounded-2xl font-extrabold text-lg md:text-xl text-white bg-gradient-to-r from-accent3 to-accent4 shadow-[0_0_40px_rgba(107,203,119,0.3)] hover:-translate-y-1 transition-all"
          >
            🎉 Join Free — Start Learning Today
          </Link>
          <p className="text-muted text-xs font-bold mt-5 md:mt-6 opacity-70">
            Trusted by parents & teachers across the GCC • COPPA compliant • Safe for kids
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-10 md:py-12 px-4 md:px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div>
              <div className="font-fredoka text-2xl bg-gradient-to-r from-accent2 to-accent1 bg-clip-text text-transparent mb-2">Plulai</div>
              <p className="text-muted text-xs font-bold max-w-xs leading-relaxed">
                The #1 edtech platform for kids in the UAE & GCC. Coding, AI & Entrepreneurship for ages 6-18.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-xs font-bold text-muted w-full md:w-auto">
              <div>
                <p className="text-white mb-3 font-extrabold">Platform</p>
                <div className="space-y-2">
                  <a href="#tracks"   className="block hover:text-white transition-colors">Tracks</a>
                  <a href="#features" className="block hover:text-white transition-colors">Features</a>
                  <Link href="/pricing"       className="block hover:text-white transition-colors">Pricing</Link>
                  <Link href="/auth/signup"   className="block hover:text-white transition-colors">Sign Up Free</Link>
                </div>
              </div>
              <div>
                <p className="text-white mb-3 font-extrabold">Countries</p>
                <div className="space-y-2">
                  {['🇦🇪 UAE','🇸🇦 Saudi Arabia','🇶🇦 Qatar','🇰🇼 Kuwait','🇧🇭 Bahrain','🇴🇲 Oman'].map(c => (
                    <p key={c}>{c}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted text-xs font-bold text-center md:text-left">© {new Date().getFullYear()} Plulai. Built with ❤️ in the UAE. The #1 edtech startup for kids in the GCC.</p>
            <p className="text-muted text-xs font-bold">
              <a href="mailto:hello@plulai.com" className="hover:text-white transition-colors">hello@plulai.com</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}