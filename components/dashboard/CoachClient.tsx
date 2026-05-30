'use client'
// components/dashboard/CoachClient.tsx
import React, { useState, useRef, useEffect, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { addXP, updateUserLanguage } from '@/lib/supabase/queries'
import { getWelcomeMessage, STARTER_PROMPTS } from '@/lib/openrouter'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/openrouter'
import type { AgeGroup } from '@/lib/supabase/database.types'

// Custom SVG Icons
const BotIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
  </svg>
)

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)

const LoadingIcon = () => (
  <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

const LANG_FLAGS:  Record<Language, string> = { en: '🇬🇧', ar: '🇦🇪', fr: '🇫🇷' }
const LANG_LABELS: Record<Language, string> = { en: 'English', ar: 'العربية', fr: 'Français' }
const INPUT_PH:    Record<Language, string> = {
  en: 'Ask your AI Coach anything…',
  ar: 'اسأل مدربك بالذكاء الاصطناعي أي شيء…',
  fr: "Pose n'importe quelle question à ton coach IA…",
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

  return (
    <div className="flex flex-col h-screen bg-black text-[#F5F5F5]" dir={dir}>

      {/* ── Header ── */}
      <div className="flex-shrink-0 p-5 lg:p-6 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center gap-4">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1CB0F6] to-[#2B70C9] flex items-center justify-center text-[#F5F5F5] animate-bounce-slow flex-shrink-0">
          <BotIcon />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-fredoka text-lg leading-tight text-[#F5F5F5]">
            {lang === 'ar' ? 'المدرب بالذكاء الاصطناعي' : lang === 'fr' ? 'Coach IA' : 'AI Coach'}
          </h1>
          <p className="text-[#6F6F6F] text-xs font-bold truncate">
            {profile.display_name} · {lang === 'ar' ? `عمر ${profile.age}` : lang === 'fr' ? `${profile.age} ans` : `Age ${profile.age}`}
          </p>
        </div>

        {/* Online indicator */}
        <div className="flex items-center gap-1.5 bg-[#14D4F4]/10 border border-[#14D4F4]/25 rounded-full px-3 py-1.5 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-[#14D4F4] animate-pulse" />
          <span className="text-[#14D4F4] text-xs font-bold">
            {lang === 'ar' ? 'متصل' : lang === 'fr' ? 'En ligne' : 'Online'}
          </span>
        </div>

        {/* Language switcher */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setLangMenu((p: boolean) => !p)}
            className="flex items-center gap-1.5 bg-[#1CB0F6]/5 border border-white/10 rounded-xl px-3 py-2 text-sm font-bold hover:border-[#1CB0F6]/25 transition-all"
          >
            <span>{LANG_FLAGS[lang as Language]}</span>
            <span className="hidden sm:inline text-xs text-[#F5F5F5]">{LANG_LABELS[lang as Language]}</span>
            <span className="text-[#6F6F6F] text-xs">▾</span>
          </button>
          {showLangMenu && (
            <div className="absolute top-full mt-2 right-0 bg-[#121212] border border-white/10 rounded-2xl p-1.5 shadow-2xl z-50 min-w-[140px]">
              {(['en','ar','fr'] as Language[]).map(l => (
                <button
                  key={l}
                  onClick={() => switchLang(l)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all',
                    l === lang ? 'bg-[#1CB0F6]/15 text-[#1CB0F6]' : 'text-[#6F6F6F] hover:bg-[#1CB0F6]/10 hover:text-[#F5F5F5]'
                  )}
                >
                  <span>{LANG_FLAGS[l]}</span>
                  <span>{LANG_LABELS[l]}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto p-5 lg:p-6 space-y-5 bg-black">
        {messages.map((msg: Msg, i: number) => (
          <div
            key={i}
            className={cn('flex gap-3 animate-slide-up', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
          >
            <div className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0',
              msg.role === 'user' ? 'bg-[#1CB0F6]/15 border border-[#1CB0F6]/25 text-[#1CB0F6]' : 'bg-[#2B70C9]/15 border border-[#2B70C9]/25 text-[#2B70C9]'
            )}>
              {msg.role === 'user' ? (profile.avatar || '👤') : <BotIcon />}
            </div>
            <div className={cn(
              'max-w-[78%] rounded-3xl px-5 py-3.5 text-sm font-semibold leading-relaxed',
              msg.role === 'user'
                ? 'bg-[#1CB0F6]/15 border border-[#1CB0F6]/20 text-[#F5F5F5] rounded-tr-sm'
                : 'bg-[#121212] border border-white/8 text-[#F5F5F5] rounded-tl-sm'
            )}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className="text-xs text-[#6F6F6F] mt-1.5 font-bold">
                {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {/* Streaming bubble */}
        {streaming && (
          <div className="flex gap-3 animate-slide-up">
            <div className="w-9 h-9 rounded-xl bg-[#2B70C9]/15 border border-[#2B70C9]/25 flex items-center justify-center text-[#2B70C9] flex-shrink-0">
              <BotIcon />
            </div>
            <div className="max-w-[78%] bg-[#121212] border border-white/8 rounded-3xl rounded-tl-sm px-5 py-3.5 text-sm font-semibold leading-relaxed text-[#F5F5F5]">
              <p className="whitespace-pre-wrap">{streaming}</p>
              <span className="inline-block w-2 h-4 bg-[#1CB0F6] rounded-sm ml-1 animate-pulse" />
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {loading && !streaming && (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2B70C9]/15 border border-[#2B70C9]/25 flex items-center justify-center text-[#2B70C9] flex-shrink-0">
              <BotIcon />
            </div>
            <div className="bg-[#121212] border border-white/8 rounded-3xl rounded-tl-sm px-5 py-3.5 flex gap-1.5 items-center">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 bg-[#6F6F6F] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* ── Starter prompts ── */}
      {messages.length <= 1 && starters.length > 0 && (
        <div className="px-5 lg:px-6 pb-3 bg-black">
          <div className="flex flex-wrap gap-2">
            {starters.map((s: string) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="bg-[#121212] border border-white/10 rounded-2xl px-4 py-2 text-sm font-bold text-[#6F6F6F] hover:text-[#F5F5F5] hover:border-[#1CB0F6]/25 transition-all hover:-translate-y-0.5"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input ── */}
      <div className="flex-shrink-0 p-5 lg:p-6 border-t border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            className="flex-1 bg-[#121212] border-2 border-white/8 focus:border-[#1CB0F6] rounded-2xl px-5 py-3.5 text-[#F5F5F5] font-semibold text-sm outline-none transition-all placeholder:text-[#6F6F6F]"
            placeholder={INPUT_PH[lang as Language]}
            value={input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && !e.shiftKey && send()}
            disabled={loading}
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            maxLength={2000}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1CB0F6] to-[#2B70C9] flex items-center justify-center text-[#F5F5F5] shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            {loading ? <LoadingIcon /> : <SendIcon />}
          </button>
        </div>
      </div>
    </div>
  )
}
