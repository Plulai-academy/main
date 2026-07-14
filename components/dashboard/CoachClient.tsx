'use client'
// components/dashboard/CoachClient.tsx
import React, { useState, useRef, useEffect, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { addXP, updateUserLanguage } from '@/lib/supabase/queries'
import { getWelcomeMessage, STARTER_PROMPTS } from '@/lib/openrouter'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/openrouter'
import type { AgeGroup } from '@/lib/supabase/database.types'

// ── Design tokens (screenshot palette) ────────────────────────────
// bg:        #EAF5F1  pale mint background
// surface:   #FFFFFF  assistant bubbles / input pill
// accent:    #FF7A59 → #FF5B3D  coral gradient, user bubbles + CTA
// ink:       #16283D  primary text
// muted:     #7C8B93  secondary text
// pill-bg:   #DCEFE8  privacy notice pill background
// pill-ink:  #2B8C7E  privacy notice pill text
// border:    #E2ECE8  hairline borders

// Premium SVG Icons
const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)

const LoadingIcon = () => (
  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const LANG_FLAGS:  Record<Language, string> = { en: '🇬🇧', ar: '🇦🇪', fr: '🇫🇷' }
const LANG_LABELS: Record<Language, string> = { en: 'English', ar: 'العربية', fr: 'Français' }
const INPUT_PH:    Record<Language, string> = {
  en: 'Ask Marjan anything…',
  ar: 'اسأل مرجان أي شيء…',
  fr: "Pose n'importe quelle question à Marjan…",
}
// Privacy notice shown under the header — mirrors the screenshot's
// "Ms. Ranya can see which topics you ask about" pill.
const WATCHED_BY: Record<Language, (name: string) => string> = {
  en: (name) => `${name} can see which topics you ask about`,
  ar: (name) => `يمكن لـ ${name} رؤية المواضيع التي تسأل عنها`,
  fr: (name) => `${name} peut voir les sujets que tu demandes`,
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

  const endRef    = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)
  const xpGiven   = useRef(false)
  // ── FIX: guard so the topic auto-send only fires once on mount,
  //    never again when the user switches language mid-session.
  const initDone  = useRef(false)
  const dir       = lang === 'ar' ? 'rtl' : 'ltr'

  // ── Build welcome message for the current language ────────────
  // Extracted so we can call it both on mount and on lang switch
  // without re-triggering the auto-send side-effect.
  const buildWelcome = (activeLang: Language): Msg => ({
    role: 'assistant',
    content: getWelcomeMessage(
      profile.display_name,
      profile.age_group as AgeGroup,
      activeLang,
      profile.interests ?? [],
      profile.dream_project ?? ''
    ),
    ts: new Date().toISOString(),
  })

  // ── ONE-TIME mount init ───────────────────────────────────────
  // Runs exactly once. Sets the welcome message and, if a topic/lesson
  // was passed via URL params, fires the auto-send for that context.
  // Does NOT depend on `lang` — language switches are handled separately below.
  useEffect(() => {
    if (!profile || initDone.current) return
    initDone.current = true

    const topic  = searchParams?.get('topic')  ?? ''
    const lesson = searchParams?.get('lesson') ?? ''
    const activeLang = (profile.preferred_language ?? 'en') as Language

    const welcome = buildWelcome(activeLang)
    const base: Msg[] = [welcome]

    if (topic || lesson) {
      // Build the context message in the user's language
      const ctx: Record<Language, string> = {
        en: `I'm studying "${lesson || topic}" in the ${topic} track. Can you help me understand it, Marjan?`,
        ar: `أنا أدرس "${lesson || topic}" في مسار ${topic}. هل يمكنك مساعدتي يا مرجان؟`,
        fr: `J'étudie "${lesson || topic}" dans le parcours ${topic}. Peux-tu m'aider, Marjan ?`,
      }
      const userMsg: Msg = { role: 'user', content: ctx[activeLang], ts: new Date().toISOString() }
      base.push(userMsg)
      setMsgs(base)
      // Small delay so the welcome message renders before the spinner appears
      setTimeout(() => sendMsg(userMsg.content, base), 500)
    } else {
      setMsgs(base)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // ← empty dep array: mount only

  // ── Language switch handler ───────────────────────────────────
  // When the user picks a new language, ONLY replace the welcome message
  // (index 0) with a translated version. All subsequent conversation
  // messages stay untouched — no re-init, no re-send.
  const switchLang = (l: Language) => {
    setLangMenu(false)
    setLang(l)
    startLangTransition(async () => { await updateUserLanguage(userId, l) })

    setMsgs(prev => {
      if (prev.length === 0) return [buildWelcome(l)]
      // Only replace the very first message (the welcome) — keep the rest
      return [buildWelcome(l), ...prev.slice(1)]
    })
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  // ── Core send function ────────────────────────────────────────
  // Named `sendMsg` (not `send`) to avoid shadowing the outer `send`
  // reference in the mount effect closure.
  const sendMsg = async (text?: string, msgsOverride?: Msg[]) => {
    const txt = (text ?? input).trim()
    if (!txt || loading) return

    const base    = msgsOverride ?? messages
    const userMsg: Msg = { role: 'user', content: txt, ts: new Date().toISOString() }

    // Only append userMsg if it isn't already the last message in base
    // (prevents duplicate rendering when called from the mount effect
    // which pre-adds the user message before calling sendMsg).
    const lastMsg = base[base.length - 1]
    const alreadyAppended = lastMsg?.role === 'user' && lastMsg?.content === txt
    const display = alreadyAppended ? base : [...base, userMsg]

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
        .slice(1) // skip welcome message — it's UI-only context, not conversation
        .map((m: Msg) => ({ role: m.role as string, content: m.content }))

      // Dedup: remove messages that appear identically in history AND current
      // (prevents sending the same assistant turn twice when history overlaps)
      const seen = new Set<string>()
      const toSend = [...historyContext, ...currentMsgs]
        .reverse()
        .filter(m => {
          const k = m.role + '::' + m.content
          return seen.has(k) ? false : (seen.add(k), true)
        })
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
          en: 'Marjan is thinking hard but couldn\'t find the words — try again! 🤔',
          ar: 'مرجان يفكر بعمق لكنه لم يجد الكلمات. حاول مرة أخرى! 🤔',
          fr: 'Marjan réfléchit intensément mais n\'a pas trouvé les mots — réessaie ! 🤔',
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
          ? '⏳ مرجان مشغول قليلاً — انتظر لحظة وحاول مجدداً'
          : lang === 'fr'
          ? '⏳ Marjan est un peu occupé — attends un moment puis réessaie'
          : '⏳ Marjan is a bit busy — wait a moment and try again'
      } else {
        content = lang === 'ar'
          ? `خطأ من مرجان: ${msg || 'حاول مرة أخرى'} 🤔`
          : lang === 'fr'
          ? `Erreur de Marjan: ${msg || 'Réessaie'} 🤔`
          : `Marjan error: ${msg || 'Something went wrong — please try again'} 🤔`
      }
      setMsgs((p: Msg[]) => [...p, { role: 'assistant', content, ts: new Date().toISOString() }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  if (!profile) return null
  const starters = STARTER_PROMPTS[profile.age_group as AgeGroup]?.[lang as Language] ?? []
  const watcherName = profile.guardian_name || profile.teacher_name || (lang === 'ar' ? 'معلمتك' : lang === 'fr' ? 'ton enseignant·e' : 'Your teacher')

  return (
    <div
      className="flex flex-col h-[100dvh] overflow-hidden bg-[#EAF5F1]"
      dir={dir}
    >
      {/* ── Header ── */}
      <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-4 z-20">
        <div className="max-w-4xl mx-auto flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.15em] text-[#7C8B93]">
              {lang === 'ar' ? 'المعلم الذكي' : lang === 'fr' ? 'Tuteur IA' : 'AI Tutor'}
            </p>
            <h1 className="font-fredoka text-2xl sm:text-3xl leading-tight text-[#16283D] truncate">
              {lang === 'ar' ? 'مرجان' : 'Marjan'}
            </h1>
          </div>

          {/* Language switcher */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setLangMenu((p: boolean) => !p)}
              className="flex items-center gap-1.5 sm:gap-2 bg-white border border-[#E2ECE8] rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-bold hover:border-[#FF7A59]/40 transition-all shadow-sm"
            >
              <span className="text-base sm:text-lg">{LANG_FLAGS[lang as Language]}</span>
              <span className="hidden sm:inline text-xs text-[#16283D]">{LANG_LABELS[lang as Language]}</span>
              <span className="text-[#7C8B93] text-xs">▾</span>
            </button>
            {showLangMenu && (
              <div className="absolute top-full mt-2 right-0 rtl:right-auto rtl:left-0 bg-white border border-[#E2ECE8] rounded-2xl p-2 shadow-xl z-50 min-w-[150px] animate-in fade-in slide-in-from-top-2 duration-200">
                {(['en','ar','fr'] as Language[]).map(l => (
                  <button
                    key={l}
                    onClick={() => switchLang(l)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all',
                      l === lang ? 'bg-[#FF7A59]/10 text-[#FF5B3D]' : 'text-[#7C8B93] hover:bg-[#EAF5F1] hover:text-[#16283D]'
                    )}
                  >
                    <span className="text-lg">{LANG_FLAGS[l]}</span>
                    <span>{LANG_LABELS[l]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Privacy notice pill */}
        <div className="max-w-4xl mx-auto mt-3">
          <div className="inline-flex items-center gap-1.5 bg-[#DCEFE8] text-[#2B8C7E] rounded-full px-3.5 py-1.5 text-[11px] sm:text-xs font-bold">
            <LockIcon />
            <span>{WATCHED_BY[lang as Language](watcherName)}</span>
          </div>
        </div>
      </div>

      {/* ── Messages Area ── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-2 space-y-4 scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg: Msg, i: number) => (
            <div
              key={i}
              className={cn('flex animate-slide-up', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div className={cn('flex flex-col gap-1', msg.role === 'user' ? 'items-end' : 'items-start')}>
                <div className={cn(
                  'max-w-[85%] sm:max-w-[75%] md:max-w-[65%] rounded-3xl px-5 py-3.5 text-[14px] sm:text-[15px] font-medium leading-relaxed shadow-sm break-words',
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-[#FF7A59] to-[#FF5B3D] text-white'
                    : 'bg-white text-[#16283D] border border-[#E2ECE8]'
                )}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Streaming / Loading States */}
          {(streaming || (loading && !streaming)) && (
            <div className="flex justify-start animate-slide-up">
              <div className="max-w-[85%] sm:max-w-[75%] md:max-w-[65%] bg-white border border-[#E2ECE8] rounded-3xl px-5 py-3.5 shadow-sm">
                {streaming ? (
                  <div className="text-[14px] sm:text-[15px] font-medium leading-relaxed text-[#16283D]">
                    <p className="whitespace-pre-wrap">{streaming}</p>
                    <span className="inline-block w-2 h-4 bg-[#FF5B3D] rounded-sm ml-1 animate-pulse" />
                  </div>
                ) : (
                  <div className="flex gap-2 items-center py-1">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2 h-2 bg-[#FF5B3D] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <div ref={endRef} className="h-2" />
        </div>
      </div>

      {/* ── Footer / Input Area ── */}
      <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-6 bg-gradient-to-t from-[#EAF5F1] via-[#EAF5F1]/95 to-transparent z-10">
        <div className="max-w-4xl mx-auto space-y-3">

          {/* Starter prompts — show until the user sends their first message */}
          {messages.length <= 1 && starters.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
              {starters.map((s: string) => (
                <button
                  key={s}
                  onClick={() => sendMsg(s)}
                  className="bg-white border border-[#E2ECE8] rounded-2xl px-4 py-2 text-xs sm:text-sm font-bold text-[#7C8B93] hover:text-[#FF5B3D] hover:border-[#FF7A59]/40 transition-all shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input pill */}
          <div className="flex items-center gap-2 bg-white border border-[#E2ECE8] rounded-full pl-5 pr-2 py-2 shadow-md focus-within:border-[#FF7A59]/50 transition-all">
            <input
              ref={inputRef}
              className="flex-1 min-w-0 bg-transparent py-2.5 text-[#16283D] font-medium text-sm outline-none placeholder:text-[#9AA7AD]"
              placeholder={INPUT_PH[lang as Language]}
              value={input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && !e.shiftKey && sendMsg()}
              disabled={loading}
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              maxLength={2000}
            />
            <button
              onClick={() => sendMsg()}
              disabled={loading || !input.trim()}
              aria-label="Send"
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0",
                loading || !input.trim()
                  ? "bg-[#EAF5F1] text-[#9AA7AD] cursor-not-allowed"
                  : "bg-gradient-to-br from-[#FF7A59] to-[#FF5B3D] text-white hover:scale-105 active:scale-95 shadow-md"
              )}
            >
              {loading ? <LoadingIcon /> : <SendIcon />}
            </button>
          </div>

          <p className="text-center text-[10px] text-[#9AA7AD] font-semibold uppercase tracking-widest">
            {lang === 'ar' ? 'قد يخطئ مرجان. تحقق من المعلومات المهمة.' : lang === 'fr' ? 'Marjan peut se tromper. Vérifie les informations importantes.' : 'Marjan can make mistakes. Verify important information.'}
          </p>
        </div>
      </div>
    </div>
  )
}