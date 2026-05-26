'use client'
// components/dashboard/CoachClient.tsx
import React, { useState, useRef, useEffect, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { addXP, updateUserLanguage } from '@/lib/supabase/queries'
import { getWelcomeMessage, STARTER_PROMPTS } from '@/lib/openrouter'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/openrouter'
import type { AgeGroup } from '@/lib/supabase/database.types'

const LANG_FLAGS:  Record<Language, string> = { en: '🇬🇧', ar: '🇦🇪', fr: '🇫🇷' }
const LANG_LABELS: Record<Language, string> = { en: 'English', ar: 'العربية', fr: 'Français' }
const INPUT_PH:    Record<Language, string> = {
  en: 'Ask your AI Coach anything…',
  ar: 'اسأل مدربك بالذكاء الاصطناعي أي شيء…',
  fr: "Pose n'importe quelle question à ton coach IA…",
}

/** Custom SVG coach icon — replaces 🤖 throughout */
function CoachIcon({ size = 24, spinning = false }: { size?: number; spinning?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('flex-shrink-0', spinning && 'animate-spin-slow')}
    >
      {/* Outer ring */}
      <circle cx="16" cy="16" r="14" stroke="url(#coachRing)" strokeWidth="1.5" strokeDasharray="4 2" />
      {/* Core circle */}
      <circle cx="16" cy="16" r="9" fill="url(#coachCore)" />
      {/* Spark lines */}
      <path d="M16 4 L17.2 9.5 L16 8 L14.8 9.5 Z" fill="url(#coachAccent)" opacity="0.9" />
      <path d="M16 28 L17.2 22.5 L16 24 L14.8 22.5 Z" fill="url(#coachAccent)" opacity="0.9" />
      <path d="M4 16 L9.5 14.8 L8 16 L9.5 17.2 Z" fill="url(#coachAccent)" opacity="0.9" />
      <path d="M28 16 L22.5 14.8 L24 16 L22.5 17.2 Z" fill="url(#coachAccent)" opacity="0.9" />
      {/* Inner star */}
      <path d="M16 11 L17.1 14.5 L20.8 14.5 L17.8 16.6 L18.9 20.1 L16 18 L13.1 20.1 L14.2 16.6 L11.2 14.5 L14.9 14.5 Z"
        fill="white" opacity="0.95" />
      <defs>
        <linearGradient id="coachRing" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--accent4, #4d96ff)" />
          <stop offset="100%" stopColor="var(--accent5, #8b5cf6)" />
        </linearGradient>
        <radialGradient id="coachCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent5, #8b5cf6)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--accent4, #4d96ff)" stopOpacity="0.85" />
        </radialGradient>
        <linearGradient id="coachAccent" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="var(--accent4, #4d96ff)" />
          <stop offset="100%" stopColor="var(--accent5, #8b5cf6)" />
        </linearGradient>
      </defs>
    </svg>
  )
}

interface Msg { role: 'user' | 'assistant'; content: string; ts: string }
interface Props {
  userId:    string
  profile:   any
  sessionId: string
  history?:  Msg[]
}

export default function CoachClient({ userId, profile, sessionId, history = [] }: Props) {
  const searchParams = useSearchParams()
  const [, startLangTransition] = useTransition()

  const [lang, setLang]             = useState<Language>((profile?.preferred_language ?? 'en') as Language)
  const [messages, setMsgs]         = useState<Msg[]>([])
  const [input, setInput]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [streaming, setStream]      = useState('')
  const [showLangMenu, setLangMenu] = useState(false)

  const endRef   = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const xpGiven  = useRef(false)
  const dir      = lang === 'ar' ? 'rtl' : 'ltr'

  // ── Init messages ───────────────────────────────────────────
  useEffect(() => {
    if (!profile) return
    const topic  = searchParams?.get('topic')  ?? ''
    const lesson = searchParams?.get('lesson') ?? ''

    const welcome = getWelcomeMessage(
      profile.display_name,
      profile.age_group as AgeGroup,
      lang,
      profile.interests ?? [],
      profile.dream_project ?? ''
    )

    const base: Msg[] = [{ role: 'assistant', content: welcome, ts: new Date().toISOString() }]

    if (topic || lesson) {
      const ctx: Record<Language, string> = {
        en: `I'm studying "${lesson || topic}" in the ${topic} track. Can you help me understand it?`,
        ar: `أنا أدرس "${lesson || topic}" في مسار ${topic}. هل يمكنك مساعدتي؟`,
        fr: `J'étudie "${lesson || topic}" dans le parcours ${topic}. Peux-tu m'aider ?`,
      }
      base.push({ role: 'user', content: ctx[lang as Language], ts: new Date().toISOString() })
    }

    setMsgs(base)
    setInput('')
    setStream('')

    if ((topic || lesson) && base[base.length - 1]?.role === 'user') {
      setTimeout(() => send(base[base.length - 1].content, base), 500)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  const switchLang = (l: Language) => {
    setLangMenu(false)
    setLang(l)
    startLangTransition(async () => { await updateUserLanguage(userId, l) })
  }

  // ── Send ────────────────────────────────────────────────────
  const send = async (text?: string, msgsOverride?: Msg[]) => {
    const txt = (text ?? input).trim()
    if (!txt || loading) return

    const base = msgsOverride ?? messages
    const userMsg: Msg = { role: 'user', content: txt, ts: new Date().toISOString() }
    const next = [...base, userMsg]

    const display = base[base.length - 1]?.content === txt && base[base.length - 1]?.role === 'user'
      ? base
      : next
    setMsgs(display)
    setInput('')
    setLoading(true)
    setStream('')

    if (!xpGiven.current) {
      xpGiven.current = true
      addXP(userId, 5, 'coach_first_message').catch(() => {})
    }

    try {
      const historyContext = history
        .slice(-10)
        .map((m: Msg) => ({ role: m.role as string, content: m.content }))
      const currentMsgs = display
        .slice(1)
        .map((m: Msg) => ({ role: m.role as string, content: m.content }))
      const seen = new Set<string>()
      const toSend = [...historyContext, ...currentMsgs]
        .reverse()
        .filter(m => { const k = m.role + m.content; return seen.has(k) ? false : (seen.add(k), true) })
        .reverse()

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: toSend, sessionId }),
      })

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => '')
        throw new Error(errText || `HTTP ${res.status}`)
      }

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''
      let buf  = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''
        for (const line of lines) {
          const t = line.trim()
          if (!t.startsWith('data: ')) continue
          const d = t.slice(6).trim()
          if (d === '[DONE]') continue
          try {
            const delta = JSON.parse(d).choices?.[0]?.delta?.content ?? ''
            if (delta) { full += delta; setStream((p: string) => p + delta) }
          } catch { /* malformed chunk */ }
        }
      }

      setStream('')
      if (full) {
        setMsgs((p: Msg[]) => [...p, { role: 'assistant', content: full, ts: new Date().toISOString() }])
      } else {
        const retryMsg: Record<Language, string> = {
          en: 'No response received — please try again! 🤔',
          ar: 'لم أتمكن من الرد. جرّب مرة أخرى! 🤔',
          fr: 'Pas de réponse. Réessaie ! 🤔',
        }
        setMsgs((p: Msg[]) => [...p, { role: 'assistant', content: retryMsg[lang as Language], ts: new Date().toISOString() }])
      }
    } catch (err: any) {
      const msg = err?.message ?? ''
      setStream('')

      let content: string
      if (msg.includes('not configured') || msg.includes('your_')) {
        content = '⚙️ AI service not configured — add OPENROUTER_API_KEY to .env.local'
      } else if (msg.includes('429') || msg.includes('rate limit') || msg.includes('quota')) {
        content = lang === 'ar'
          ? '⏳ طلبات كثيرة — انتظر لحظة وحاول مجدداً'
          : lang === 'fr'
          ? '⏳ Trop de requêtes — attends un moment puis réessaie'
          : '⏳ Too many requests — wait a moment and try again'
      } else {
        content = lang === 'ar'
          ? `خطأ: ${msg || 'حاول مرة أخرى'} 🤔`
          : lang === 'fr'
          ? `Erreur: ${msg || 'Réessaie'} 🤔`
          : `Error: ${msg || 'Something went wrong — please try again'} 🤔`
      }
      setMsgs((p: Msg[]) => [...p, { role: 'assistant', content, ts: new Date().toISOString() }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  if (!profile) return null
  const starters = STARTER_PROMPTS[profile.age_group as AgeGroup]?.[lang as Language] ?? []
  const charLimit = 2000

  return (
    <div className="flex flex-col h-screen bg-background" dir={dir}>

      {/* ── Header ── */}
      <div className="flex-shrink-0 px-4 py-3 lg:px-6 lg:py-4 border-b border-white/5 glass">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">

          {/* Coach avatar with animated ring */}
          <div className="relative flex-shrink-0">
            <div className={cn(
              'w-11 h-11 rounded-2xl bg-gradient-to-br from-accent4/20 to-accent5/20 border border-accent4/30 flex items-center justify-center',
              'shadow-[0_0_16px_rgba(77,150,255,0.2)]'
            )}>
              <CoachIcon size={24} spinning={loading} />
            </div>
            {/* Live pulse dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent3 border-2 border-background">
              <span className="absolute inset-0 rounded-full bg-accent3 animate-ping opacity-60" />
            </span>
          </div>

          {/* Name block */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-fredoka text-base leading-tight">
                {lang === 'ar' ? 'المدرب الذكي' : lang === 'fr' ? 'Coach IA' : 'AI Coach'}
              </h1>
              <span className="text-xs font-bold text-accent3 bg-accent3/10 border border-accent3/20 rounded-full px-2 py-0.5 leading-none">
                {lang === 'ar' ? 'متصل' : lang === 'fr' ? 'En ligne' : 'Online'}
              </span>
            </div>
            <p className="text-muted text-xs font-semibold truncate mt-0.5">
              {lang === 'ar' ? `مرحباً، ${profile.display_name}` : lang === 'fr' ? `Bonjour, ${profile.display_name}` : `Hey, ${profile.display_name}`}
              {' · '}
              {lang === 'ar' ? `عمر ${profile.age}` : lang === 'fr' ? `${profile.age} ans` : `Age ${profile.age}`}
            </p>
          </div>

          {/* Language switcher */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setLangMenu((p: boolean) => !p)}
              className="flex items-center gap-1.5 bg-card2 border border-white/10 rounded-xl px-3 py-2 text-sm font-bold hover:border-accent4/40 hover:bg-accent4/5 transition-all"
            >
              <span>{LANG_FLAGS[lang as Language]}</span>
              <span className="hidden sm:inline text-xs text-muted">{LANG_LABELS[lang as Language]}</span>
              <span className="text-muted text-xs">▾</span>
            </button>
            {showLangMenu && (
              <div className="absolute top-full mt-2 right-0 bg-card border border-white/10 rounded-2xl p-1.5 shadow-2xl shadow-black/40 z-50 min-w-[150px]">
                {(['en','ar','fr'] as Language[]).map(l => (
                  <button
                    key={l}
                    onClick={() => switchLang(l)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all',
                      l === lang ? 'bg-accent4/15 text-accent4' : 'text-muted hover:bg-card2 hover:text-white'
                    )}
                  >
                    <span>{LANG_FLAGS[l]}</span>
                    <span>{LANG_LABELS[l]}</span>
                    {l === lang && <span className="ml-auto text-accent4 text-xs">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 lg:px-6 space-y-4 max-w-4xl mx-auto w-full">
        {messages.map((msg: Msg, i: number) => (
          <div
            key={i}
            className={cn(
              'flex gap-3 animate-slide-up',
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            {/* Avatar */}
            <div className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg',
              msg.role === 'user'
                ? 'bg-accent4/15 border border-accent4/25'
                : 'bg-gradient-to-br from-accent4/15 to-accent5/15 border border-accent5/25'
            )}>
              {msg.role === 'user' ? profile.avatar : <CoachIcon size={20} />}
            </div>

            {/* Bubble */}
            <div className={cn(
              'max-w-[78%] rounded-3xl px-4 py-3 text-sm font-semibold leading-relaxed relative',
              msg.role === 'user'
                ? 'bg-gradient-to-br from-accent4/20 to-accent4/10 border border-accent4/25 text-white rounded-tr-sm'
                : 'bg-card2 border border-white/8 text-white rounded-tl-sm'
            )}>
              {/* Left accent stripe for coach messages */}
              {msg.role === 'assistant' && (
                <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-gradient-to-b from-accent4/60 to-accent5/60 rounded-full" />
              )}
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className={cn(
                'text-xs mt-2 font-bold',
                msg.role === 'user' ? 'text-accent4/50 text-right' : 'text-muted'
              )}>
                {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {/* Streaming bubble */}
        {streaming && (
          <div className="flex gap-3 animate-slide-up">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent4/15 to-accent5/15 border border-accent5/25 flex items-center justify-center flex-shrink-0">
              <CoachIcon size={20} spinning />
            </div>
            <div className="max-w-[78%] bg-card2 border border-white/8 rounded-3xl rounded-tl-sm px-4 py-3 text-sm font-semibold leading-relaxed relative">
              <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-gradient-to-b from-accent4/60 to-accent5/60 rounded-full" />
              <p className="whitespace-pre-wrap">
                {streaming}
                {/* Animated wave cursor */}
                <span className="inline-flex items-end gap-px ml-1 mb-0.5">
                  {[0,1,2].map(i => (
                    <span
                      key={i}
                      className="inline-block w-0.5 bg-accent4 rounded-full animate-bounce"
                      style={{ height: `${10 + i * 3}px`, animationDelay: `${i * 0.1}s`, animationDuration: '0.7s' }}
                    />
                  ))}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {loading && !streaming && (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent4/15 to-accent5/15 border border-accent5/25 flex items-center justify-center flex-shrink-0">
              <CoachIcon size={20} spinning />
            </div>
            <div className="bg-card2 border border-white/8 rounded-3xl rounded-tl-sm px-5 py-4 flex gap-1.5 items-end">
              {[0,1,2].map(i => (
                <div
                  key={i}
                  className="bg-muted rounded-full animate-bounce"
                  style={{
                    width:  i === 1 ? '8px' : '6px',
                    height: i === 1 ? '8px' : '6px',
                    animationDelay: `${i * 0.18}s`,
                    animationDuration: '0.9s',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* ── Starter prompts ── */}
      {messages.length <= 1 && starters.length > 0 && (
        <div className="px-4 lg:px-6 pb-3 max-w-4xl mx-auto w-full">
          <p className="text-xs font-bold text-muted mb-2 px-1">
            {lang === 'ar' ? '✨ جرّب أحد هذه:' : lang === 'fr' ? '✨ Essaie ça :' : '✨ Try one of these:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {starters.map((s: string) => (
              <button
                key={s}
                onClick={() => send(s)}
                className={cn(
                  'bg-card2 border border-white/10 rounded-2xl px-4 py-2 text-xs font-bold text-muted',
                  'hover:text-white hover:border-accent4/40 hover:bg-accent4/8 hover:-translate-y-0.5',
                  'transition-all duration-200 active:scale-95'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input bar ── */}
      <div className="flex-shrink-0 px-4 py-4 lg:px-6 border-t border-white/5 glass">
        <div className="max-w-4xl mx-auto">
          <div className={cn(
            'flex items-end gap-2 bg-card2 rounded-3xl border-2 transition-all duration-200 px-4 py-2',
            input.length > 0 ? 'border-accent4/50 shadow-[0_0_16px_rgba(77,150,255,0.1)]' : 'border-white/8 focus-within:border-accent4/40'
          )}>
            <input
              ref={inputRef}
              className="flex-1 bg-transparent text-white font-semibold text-sm outline-none placeholder:text-muted py-2 resize-none"
              placeholder={INPUT_PH[lang as Language]}
              value={input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && !e.shiftKey && send()}
              disabled={loading}
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              maxLength={charLimit}
            />
            {/* Char counter — only shows when near limit */}
            {input.length > charLimit * 0.8 && (
              <span className={cn(
                'text-xs font-bold flex-shrink-0 mb-2',
                input.length > charLimit * 0.95 ? 'text-red-400' : 'text-muted'
              )}>
                {charLimit - input.length}
              </span>
            )}
            {/* Send button */}
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className={cn(
                'w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-200 mb-0.5',
                input.trim() && !loading
                  ? 'bg-gradient-to-br from-accent4 to-accent5 shadow-lg shadow-accent4/25 hover:scale-105 active:scale-95'
                  : 'bg-card border border-white/10 opacity-40 cursor-not-allowed'
              )}
            >
              {loading ? (
                <CoachIcon size={18} spinning />
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d={lang === 'ar'
                      ? 'M10 8 L4 4 L5.5 8 L4 12 Z M5.5 8 H13'
                      : 'M6 8 L12 4 L10.5 8 L12 12 Z M10.5 8 H3'
                    }
                    fill="white"
                  />
                </svg>
              )}
            </button>
          </div>
          {/* Subtle hint */}
          <p className="text-center text-xs text-muted/50 font-bold mt-2">
            {lang === 'ar' ? 'اضغط Enter للإرسال' : lang === 'fr' ? 'Entrée pour envoyer' : 'Press Enter to send'}
          </p>
        </div>
      </div>
    </div>
  )
}