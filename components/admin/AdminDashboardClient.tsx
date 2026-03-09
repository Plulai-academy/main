'use client'
// components/admin/AdminDashboardClient.tsx
// Full analytics dashboard: KPIs, charts, user table, breakdowns.
// Uses inline SVG charts — no external chart library needed.
import type { CSSProperties, ChangeEvent } from 'react'
import { useState, useMemo } from 'react'

// ── Types ──────────────────────────────────────────────────────
interface Stats {
  kpis:              Kpis
  signupChart:       { date: string; signups: number }[]
  lessonChart:       { date: string; count: number }[]
  topSkills:         { title: string; emoji: string; track: string; count: number }[]
  countryBreakdown:  { country: string; count: number }[]
  byLang:            Record<string, number>
  byAge:             Record<string, number>
  streakBuckets:     Record<string, number>
  users:             User[]
  generatedAt:       string
}
interface Kpis {
  totalUsers: number; paidUsers: number; trialingUsers: number; expiredUsers: number
  activeToday: number; activeWeek: number; mrr: number; convRate: number
  lessonsLast30: number; badgesLast30: number; avgXP: number; avgStreak: number
}
interface User {
  id: string; email: string; name: string; avatar: string
  country: string; language: string; age_group: string
  status: 'paid' | 'trial' | 'expired'
  xp: number; level: number; streak: number
  last_active: string | null; joined: string; onboarded: boolean
}

// ── Helpers ────────────────────────────────────────────────────
const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
const ago = (s: string | null) => {
  if (!s) return '—'
  const d = Math.floor((Date.now() - new Date(s).getTime()) / 86400000)
  return d === 0 ? 'Today' : d === 1 ? 'Yesterday' : `${d}d ago`
}
const statusColor: Record<string, string> = {
  paid:    '#6bcb77',
  trial:   '#4d96ff',
  expired: '#ff6b6b',
}
const trackColor: Record<string, string> = {
  coding:          '#4d96ff',
  ai:              '#c77dff',
  entrepreneurship:'#ffd93d',
}
const COUNTRY_FLAG: Record<string, string> = {
  AE: '🇦🇪', SA: '🇸🇦', KW: '🇰🇼', QA: '🇶🇦', BH: '🇧🇭', OM: '🇴🇲',
  EG: '🇪🇬', JO: '🇯🇴', LB: '🇱🇧', US: '🇺🇸', GB: '🇬🇧', FR: '🇫🇷',
}

// ── Sparkline SVG ──────────────────────────────────────────────
function Sparkline({ data, color = '#4d96ff', h = 40 }: { data: number[]; color?: string; h?: number }) {
  if (data.length < 2) return null
  const max = Math.max(...data, 1)
  const w   = 120
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`g${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts.join(' ')} ${w},${h}`} fill={`url(#g${color.replace('#','')})`} />
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Bar chart SVG ──────────────────────────────────────────────
function BarChart({ data, color = '#4d96ff' }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1)
  const w = 600, h = 160, barW = Math.max(4, (w / data.length) - 3)
  return (
    <svg viewBox={`0 0 ${w} ${h + 20}`} style={{ width: '100%', height: h + 20 }}>
      {data.map((d, i) => {
        const bh = Math.max(2, (d.value / max) * h)
        const x  = (i / data.length) * w + 1
        return (
          <g key={i}>
            <rect x={x} y={h - bh} width={barW} height={bh} rx="3" fill={color} opacity="0.8" />
            {i % 7 === 0 && (
              <text x={x + barW / 2} y={h + 14} textAnchor="middle" fontSize="9" fill="#555577">
                {d.label.slice(5)}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ── KPI Card ───────────────────────────────────────────────────
function KPICard({ label, value, sub, sparkData, color = '#4d96ff', prefix = '', suffix = '' }:
  { label: string; value: number | string; sub?: string; sparkData?: number[]; color?: string; prefix?: string; suffix?: string }) {
  return (
    <div style={{
      background: '#12121f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20,
      padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 4, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#555577', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
        {prefix}{typeof value === 'number' ? fmt(value) : value}{suffix}
      </div>
      {sub && <div style={{ fontSize: 12, color: '#666688', fontWeight: 600 }}>{sub}</div>}
      {sparkData && (
        <div style={{ position: 'absolute', bottom: 12, right: 12, opacity: 0.6 }}>
          <Sparkline data={sparkData} color={color} />
        </div>
      )}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${color}, transparent)`, borderRadius: '20px 20px 0 0',
      }} />
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────
export default function AdminDashboardClient({ data }: { data: Stats }) {
  const [tab,    setTab]    = useState<'overview' | 'users' | 'engagement'>('overview')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'paid' | 'trial' | 'expired'>('all')
  const [sort,   setSort]   = useState<'joined' | 'xp' | 'streak' | 'last_active'>('joined')
  const [page,   setPage]   = useState(0)
  const PAGE_SIZE = 25

  const { kpis, signupChart, lessonChart, topSkills, countryBreakdown, byLang, byAge, streakBuckets, users } = data

  // ── Filtered + sorted user table ──────────────────────────
  const filteredUsers = useMemo(() => {
    let u = users
    if (filter !== 'all') u = u.filter(x => x.status === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      u = u.filter(x => x.email.toLowerCase().includes(q) || x.name.toLowerCase().includes(q))
    }
    u = [...u].sort((a, b) => {
      if (sort === 'xp')          return b.xp - a.xp
      if (sort === 'streak')      return b.streak - a.streak
      if (sort === 'last_active') return (b.last_active ?? '').localeCompare(a.last_active ?? '')
      return b.joined.localeCompare(a.joined)
    })
    return u
  }, [users, filter, search, sort])

  const pageUsers  = filteredUsers.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE)

  const signupSpark  = signupChart.map(d => d.signups)
  const lessonSparkData = lessonChart.map(d => d.count)
  const totalLangUsers = Object.values(byLang).reduce((a, b) => a + b, 0)

  // ── Style helpers ──────────────────────────────────────────
  const S = {
    page:    { minHeight: '100vh', background: '#080810', color: '#fff', fontFamily: "'Inter', system-ui, sans-serif" } as CSSProperties,
    header:  { background: '#0d0d1a', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' } as CSSProperties,
    main:    { padding: '32px', maxWidth: 1400, margin: '0 auto' } as CSSProperties,
    grid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 } as CSSProperties,
    card:    { background: '#12121f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 24 } as CSSProperties,
    tab:     (active: boolean) => ({
      padding: '10px 20px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer',
      background: active ? 'rgba(77,150,255,0.15)' : 'transparent',
      color:      active ? '#4d96ff' : '#555577',
      border:     active ? '1px solid rgba(77,150,255,0.3)' : '1px solid transparent',
    } as CSSProperties),
  }

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>🚀</span>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>Plulai Admin</div>
            <div style={{ fontSize: 12, color: '#555577' }}>
              Last updated {new Date(data.generatedAt).toLocaleTimeString()}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['overview', 'users', 'engagement'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={S.tab(tab === t)}>
              {t === 'overview' ? '📊 Overview' : t === 'users' ? '👥 Users' : '🎯 Engagement'}
            </button>
          ))}
        </div>
        <a href="/api/admin/signout" style={{ fontSize: 13, color: '#555577', textDecoration: 'none' }}>Sign out →</a>
      </div>

      <div style={S.main}>

        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && (<>

          {/* KPI grid */}
          <div style={S.grid}>
            <KPICard label="MRR" value={kpis.mrr} prefix="$" color="#6bcb77" sparkData={signupSpark} sub={`${kpis.paidUsers} paid users`} />
            <KPICard label="Total Users" value={kpis.totalUsers} color="#4d96ff" sparkData={signupSpark} sub={`+${signupChart.slice(-7).reduce((s,d)=>s+d.signups,0)} this week`} />
            <KPICard label="Trial → Paid" value={kpis.convRate} suffix="%" color="#ffd93d" sub={`${kpis.paidUsers} paid of ${kpis.trialingUsers + kpis.paidUsers} trialed`} />
            <KPICard label="Active Today" value={kpis.activeToday} color="#ff6b6b" sub={`${kpis.activeWeek} this week`} />
            <KPICard label="Lessons / 30d" value={kpis.lessonsLast30} color="#c77dff" sparkData={lessonSparkData} sub={`${kpis.badgesLast30} badges earned`} />
            <KPICard label="Avg XP" value={kpis.avgXP} color="#ffd93d" sub={`Avg streak: ${kpis.avgStreak}d`} />
          </div>

          {/* Subscription status pills */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
            {[
              { label: '🟢 Paid',    count: kpis.paidUsers,     color: '#6bcb77' },
              { label: '🔵 Trial',   count: kpis.trialingUsers, color: '#4d96ff' },
              { label: '🔴 Expired', count: kpis.expiredUsers,  color: '#ff6b6b' },
            ].map(s => (
              <div key={s.label} style={{
                background: `${s.color}15`, border: `1px solid ${s.color}40`,
                borderRadius: 999, padding: '8px 18px', fontSize: 14, fontWeight: 700,
              }}>
                {s.label} <span style={{ color: s.color }}>{s.count}</span>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
            <div style={S.card}>
              <div style={{ fontWeight: 800, marginBottom: 16 }}>📈 Daily Signups (30d)</div>
              <BarChart data={signupChart.map(d => ({ label: d.date, value: d.signups }))} color="#4d96ff" />
            </div>
            <div style={S.card}>
              <div style={{ fontWeight: 800, marginBottom: 16 }}>📚 Lessons Completed (30d)</div>
              <BarChart data={lessonChart.map(d => ({ label: d.date, value: d.count }))} color="#c77dff" />
            </div>
          </div>

          {/* Country + Language breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
            <div style={S.card}>
              <div style={{ fontWeight: 800, marginBottom: 16 }}>🌍 Top Countries</div>
              {countryBreakdown.map(c => (
                <div key={c.country} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 14 }}>
                  <span>{COUNTRY_FLAG[c.country] ?? '🌐'} {c.country}</span>
                  <span style={{ fontWeight: 800, color: '#4d96ff' }}>{c.count}</span>
                </div>
              ))}
            </div>
            <div style={S.card}>
              <div style={{ fontWeight: 800, marginBottom: 16 }}>🗣️ Languages</div>
              {Object.entries(byLang).map(([lang, count]) => (
                <div key={lang} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700 }}>{{ en: '🇬🇧 English', ar: '🇸🇦 Arabic', fr: '🇫🇷 French' }[lang] ?? lang}</span>
                    <span style={{ color: '#8888bb' }}>{Math.round((count / totalLangUsers) * 100)}%</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 999 }}>
                    <div style={{ height: 6, width: `${(count / totalLangUsers) * 100}%`, background: '#4d96ff', borderRadius: 999 }} />
                  </div>
                </div>
              ))}
              <div style={{ fontWeight: 800, marginTop: 20, marginBottom: 16 }}>🧒 Age Groups</div>
              {Object.entries(byAge).map(([ag, count]) => (
                <div key={ag} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13 }}>
                  <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{ag}</span>
                  <span style={{ color: '#ffd93d', fontWeight: 800 }}>{count}</span>
                </div>
              ))}
            </div>
            <div style={S.card}>
              <div style={{ fontWeight: 800, marginBottom: 16 }}>🔥 Streak Distribution</div>
              {Object.entries(streakBuckets).map(([bucket, count]) => {
                const total = Object.values(streakBuckets).reduce((a, b) => a + b, 0)
                const pct   = total > 0 ? (count / total) * 100 : 0
                return (
                  <div key={bucket} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                      <span style={{ fontWeight: 700 }}>{bucket} days</span>
                      <span style={{ color: '#8888bb' }}>{count} ({Math.round(pct)}%)</span>
                    </div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 999 }}>
                      <div style={{ height: 5, width: `${pct}%`, background: '#ff6b6b', borderRadius: 999 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>)}

        {/* ── USERS TAB ── */}
        {tab === 'users' && (<>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(0) }}
              placeholder="Search name or email..."
              style={{
                background: '#12121f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                padding: '10px 16px', color: '#fff', fontSize: 14, width: 240, outline: 'none',
              }}
            />
            {(['all', 'paid', 'trial', 'expired'] as const).map(f => (
              <button key={f} onClick={() => { setFilter(f); setPage(0) }} style={{
                padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                background: filter === f ? statusColor[f] ?? '#4d96ff' : 'rgba(255,255,255,0.05)',
                color: filter === f ? '#fff' : '#8888bb',
                border: 'none', textTransform: 'capitalize',
              }}>
                {f} {f !== 'all' && `(${users.filter(u => u.status === f).length})`}
              </button>
            ))}
            <select
              value={sort}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setSort(e.target.value as any)}
              style={{ marginLeft: 'auto', background: '#12121f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none' }}
            >
              <option value="joined">Sort: Newest</option>
              <option value="xp">Sort: XP</option>
              <option value="streak">Sort: Streak</option>
              <option value="last_active">Sort: Last Active</option>
            </select>
          </div>

          {/* Table */}
          <div style={{ background: '#12121f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#0d0d1a', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['User', 'Status', 'Country', 'Lang', 'Age', 'XP', 'Level', 'Streak', 'Last Active', 'Joined'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: '#555577', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageUsers.map((u: User, i: number) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 20 }}>{u.avatar}</span>
                        <div>
                          <div style={{ fontWeight: 700, color: '#fff' }}>{u.name}</div>
                          <div style={{ color: '#555577', fontSize: 11 }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800,
                        background: `${statusColor[u.status]}20`, color: statusColor[u.status],
                        textTransform: 'capitalize',
                      }}>{u.status}</span>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#8888bb' }}>{COUNTRY_FLAG[u.country] ?? '🌐'} {u.country}</td>
                    <td style={{ padding: '10px 14px', color: '#8888bb', textTransform: 'uppercase', fontSize: 11 }}>{u.language}</td>
                    <td style={{ padding: '10px 14px', color: '#8888bb', textTransform: 'capitalize' }}>{u.age_group}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 800, color: '#ffd93d' }}>{fmt(u.xp)}</td>
                    <td style={{ padding: '10px 14px', color: '#c77dff', fontWeight: 700 }}>Lv {u.level}</td>
                    <td style={{ padding: '10px 14px', color: '#ff6b6b', fontWeight: 700 }}>{u.streak}🔥</td>
                    <td style={{ padding: '10px 14px', color: '#8888bb' }}>{ago(u.last_active)}</td>
                    <td style={{ padding: '10px 14px', color: '#555577', fontSize: 11 }}>{fmtDate(u.joined)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: 13, color: '#555577' }}>
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length}
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p: number) => p - 1)}
                  style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: page === 0 ? '#333' : '#fff', cursor: page === 0 ? 'default' : 'pointer', fontSize: 13 }}
                >← Prev</button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p: number) => p + 1)}
                  style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: page >= totalPages - 1 ? '#333' : '#fff', cursor: page >= totalPages - 1 ? 'default' : 'pointer', fontSize: 13 }}
                >Next →</button>
              </div>
            </div>
          </div>
        </>)}

        {/* ── ENGAGEMENT TAB ── */}
        {tab === 'engagement' && (<>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

            {/* Top skills */}
            <div style={S.card}>
              <div style={{ fontWeight: 800, marginBottom: 16 }}>🗺️ Most Completed Skills (30d)</div>
              {topSkills.length === 0 && <p style={{ color: '#555577', fontSize: 14 }}>No lesson data yet</p>}
              {topSkills.map((s, i) => {
                const max = topSkills[0]?.count ?? 1
                return (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{s.emoji} {s.title}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 999,
                          background: `${trackColor[s.track] ?? '#4d96ff'}25`, color: trackColor[s.track] ?? '#4d96ff',
                          textTransform: 'capitalize',
                        }}>{s.track}</span>
                        <span style={{ fontWeight: 900, color: '#fff', minWidth: 28, textAlign: 'right' }}>{s.count}</span>
                      </div>
                    </div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 999 }}>
                      <div style={{ height: 5, width: `${(s.count / max) * 100}%`, background: trackColor[s.track] ?? '#4d96ff', borderRadius: 999, transition: 'width 0.4s' }} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Revenue projection */}
            <div style={S.card}>
              <div style={{ fontWeight: 800, marginBottom: 20 }}>💰 Revenue Summary</div>
              {[
                { label: 'MRR', value: `$${kpis.mrr.toLocaleString()}`, color: '#6bcb77', note: `${kpis.paidUsers} × $79` },
                { label: 'ARR (proj.)', value: `$${(kpis.mrr * 12).toLocaleString()}`, color: '#6bcb77', note: 'If retention holds' },
                { label: 'Trial Conv. Rate', value: `${kpis.convRate}%`, color: '#ffd93d', note: 'Trial → paid' },
                { label: 'Active / Total', value: `${kpis.totalUsers > 0 ? Math.round((kpis.activeWeek / kpis.totalUsers) * 100) : 0}%`, color: '#4d96ff', note: 'Weekly active rate' },
                { label: 'Avg Lessons/User', value: kpis.totalUsers > 0 ? (kpis.lessonsLast30 / kpis.totalUsers).toFixed(1) : '0', color: '#c77dff', note: 'Last 30 days' },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: '#555577' }}>{r.note}</div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: r.color }}>{r.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Engagement metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Lessons / 30d',  value: kpis.lessonsLast30,  color: '#c77dff', icon: '📚' },
              { label: 'Badges / 30d',   value: kpis.badgesLast30,   color: '#ffd93d', icon: '🏆' },
              { label: 'Active Today',    value: kpis.activeToday,    color: '#ff6b6b', icon: '⚡' },
              { label: 'Active This Week',value: kpis.activeWeek,     color: '#4d96ff', icon: '🔥' },
            ].map(m => (
              <div key={m.label} style={{ ...S.card, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{m.icon}</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: m.color }}>{fmt(m.value)}</div>
                <div style={{ fontSize: 12, color: '#555577', fontWeight: 700, marginTop: 4 }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Streak distribution full view */}
          <div style={S.card}>
            <div style={{ fontWeight: 800, marginBottom: 16 }}>🔥 Streak Distribution — All Users</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
              {Object.entries(streakBuckets).map(([bucket, count]) => {
                const total = Object.values(streakBuckets).reduce((a, b) => a + b, 0)
                const pct   = total > 0 ? Math.round((count / total) * 100) : 0
                return (
                  <div key={bucket} style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.15)', borderRadius: 14, padding: '16px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: '#ff6b6b' }}>{count}</div>
                    <div style={{ fontSize: 11, color: '#8888bb', marginTop: 4, fontWeight: 700 }}>{bucket}d streak</div>
                    <div style={{ fontSize: 13, color: '#fff', fontWeight: 800, marginTop: 2 }}>{pct}%</div>
                  </div>
                )
              })}
            </div>
          </div>
        </>)}

      </div>
    </div>
  )
}
