'use client'
// components/dashboard/CoachClient.tsx
import React, { useState, useRef, useEffect, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { addXP, updateUserLanguage } from '@/lib/supabase/queries'
import { getWelcomeMessage, STARTER_PROMPTS } from '@/lib/openrouter'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/openrouter'
import type { AgeGroup } from '@/lib/supabase/database.types'
import Image from 'next/image'

// Premium SVG Icons
const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)

const LoadingIcon = () => (
  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

const JimmyAvatar = ({ className }: { className?: string }) => (
  <div className={cn("relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1CB0F6] to-[#2B70C9] p-0.5 shadow-lg", className)}>
    <div className="bg-card w-full h-full rounded-[14px] flex items-center justify-center overflow-hidden">
      <Image 
        src="/icons/coach.png" 
        alt="Jimmy" 
        width={48} 
        height={48} 
        className="w-full h-full object-cover scale-110"
      />
    </div>
  </div>
)

const LANG_FLAGS:  Record<Language, string> = { en: '🇬🇧', ar: '🇦🇪', fr: '🇫🇷' }
const LANG_LABELS: Record<Language, string> = { en: 'English', ar: 'العربية', fr: 'Français' }
const INPUT_PH:    Record<Language, string> = {
  en: 'Ask Jimmy anything…',
  ar: 'اسأل جيمي أي شيء…',
  fr: "Pose n'importe quelle question à Jimmy…",
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

    let welcome = getWelcomeMessage(
      profile.display_name,
      profile.age_group as AgeGroup,
      lang,
      profile.interests ?? [],
      profile.dream_project ?? ''
    )

    // Replace "AI Coach" or generic terms with "Jimmy" in the welcome message if possible
    welcome = welcome.replace(/AI Coach/gi, 'Jimmy').replace(/المدرب بالذكاء الاصطناعي/gi, 'جيمي').replace(/Coach IA/gi, 'Jimmy')

    const base: Msg[] = [{ role: 'assistant', content: welcome, ts: new Date().toISOString() }]

    if (topic || lesson) {
      const ctx: Record<Language, string> = {
        en: `I'm studying "${lesson || topic}" in the ${topic} track. Can you help me understand it, Jimmy?`,
        ar: `أنا أدرس "${lesson || topic}" في مسار ${topic}. هل يمكنك مساعدتي يا جيمي؟`,
        fr: `J'étudie "${lesson || topic}" dans le parcours ${topic}. Peux-tu m'aider, Jimmy ?`,
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
          en: 'Jimmy is thinking hard but couldn\'t find the words — try again! 🤔',
          ar: 'جيمي يفكر بعمق لكنه لم يجد الكلمات. حاول مرة أخرى! 🤔',
          fr: 'Jimmy réfléchit intensément mais n\'a pas trouvé les mots — réessaie ! 🤔',
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
          ? '⏳ جيمي مشغول قليلاً — انتظر لحظة وحاول مجدداً'
          : lang === 'fr'
          ? '⏳ Jimmy est un peu occupé — attends un moment puis réessaie'
          : '⏳ Jimmy is a bit busy — wait a moment and try again'
      } else {
        content = lang === 'ar'
          ? `خطأ من جيمي: ${msg || 'حاول مرة أخرى'} 🤔`
          : lang === 'fr'
          ? `Erreur de Jimmy: ${msg || 'Réessaie'} 🤔`
          : `Jimmy error: ${msg || 'Something went wrong — please try again'} 🤔`
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
    <div className="flex flex-col h-screen overflow-hidden" dir={dir}>

      {/* ── Header ── */}
      <div className="flex-shrink-0 p-4 lg:p-5 border-b border-white/5 glass flex items-center gap-4 z-20">
        <div className="relative">
          <JimmyAvatar className="w-12 h-12" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-black border-2 border-black flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#14D4F4] animate-pulse" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h1 className="font-fredoka text-xl leading-tight text-[#F5F5F5]">
            {lang === 'ar' ? 'جيمي' : 'Jimmy'}
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-[#6F6F6F] text-[10px] font-bold uppercase tracking-widest">
              {profile.display_name}
            </span>
            <span className="w-1 h-1 rounded-full bg-[#6F6F6F]/40" />
            <span className="text-[#14D4F4] text-[10px] font-bold uppercase tracking-widest">
              {lang === 'ar' ? 'نشط الآن' : lang === 'fr' ? 'Actif' : 'Active Now'}
            </span>
          </div>
        </div>

        {/* Language switcher */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setLangMenu((p: boolean) => !p)}
            className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm font-bold hover:bg-white/10 hover:border-[#1CB0F6]/30 transition-all group"
          >
            <span className="text-lg">{LANG_FLAGS[lang as Language]}</span>
            <span className="hidden sm:inline text-xs text-[#F5F5F5]">{LANG_LABELS[lang as Language]}</span>
            <span className="text-[#6F6F6F] text-xs group-hover:text-[#1CB0F6] transition-colors">▾</span>
          </button>
          {showLangMenu && (
            <div className="absolute top-full mt-2 right-0 bg-card border border-white/10 rounded-2xl p-2 shadow-2xl z-50 min-w-[160px] animate-in fade-in slide-in-from-top-2 duration-200">
              {(['en','ar','fr'] as Language[]).map(l => (
                <button
                  key={l}
                  onClick={() => switchLang(l)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all',
                    l === lang ? 'bg-[#1CB0F6]/10 text-[#1CB0F6]' : 'text-[#6F6F6F] hover:bg-white/5 hover:text-[#F5F5F5]'
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

      {/* ── Messages Area ── */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 space-y-8 scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-8">
          {messages.map((msg: Msg, i: number) => (
            <div
              key={i}
              className={cn('flex gap-4 group animate-slide-up', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
            >
              <div className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                {msg.role === 'user' ? (
                  <div className="w-10 h-10 rounded-2xl bg-[#1CB0F6]/10 border border-[#1CB0F6]/20 flex items-center justify-center text-xl shadow-md text-[#1CB0F6]">
                    {profile.avatar || '👤'}
                  </div>
                ) : (
                  <JimmyAvatar className="w-10 h-10" />
                )}
              </div>
              <div className={cn(
                'flex flex-col gap-1.5',
                msg.role === 'user' ? 'items-end' : 'items-start'
              )}>
                <div className={cn(
                  'max-w-[85%] md:max-w-[75%] rounded-3xl px-6 py-4 text-[15px] font-medium leading-relaxed shadow-sm',
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-[#1CB0F6] to-[#2B70C9] text-white rounded-tr-none'
                    : 'bg-card border border-white/5 text-[#F5F5F5] rounded-tl-none'
                )}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                <span className="text-[10px] text-[#6F6F6F] font-bold uppercase tracking-widest px-1">
                  {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {/* Streaming / Loading States */}
          {(streaming || (loading && !streaming)) && (
            <div className="flex gap-4 animate-slide-up">
              <JimmyAvatar className="w-10 h-10" />
              <div className="bg-card border border-white/5 rounded-3xl rounded-tl-none px-6 py-4 shadow-sm">
                {streaming ? (
                  <div className="text-[15px] font-medium leading-relaxed text-[#F5F5F5]">
                    <p className="whitespace-pre-wrap">{streaming}</p>
                    <span className="inline-block w-2 h-4 bg-[#1CB0F6] rounded-sm ml-1 animate-pulse" />
                  </div>
                ) : (
                  <div className="flex gap-2 items-center py-1">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2 h-2 bg-[#1CB0F6] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <div ref={endRef} className="h-4" />
        </div>
      </div>

      {/* ── Footer / Input Area ── */}
      <div className="flex-shrink-0 p-4 lg:p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-10">
        <div className="max-w-4xl mx-auto space-y-4">
          
          {/* Starter prompts */}
          {messages.length <= 1 && starters.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
              {starters.map((s: string) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="bg-card/50 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-2.5 text-sm font-bold text-[#6F6F6F] hover:text-[#1CB0F6] hover:border-[#1CB0F6]/30 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-[#1CB0F6]/10"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input box */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#1CB0F6] to-[#2B70C9] rounded-[26px] blur opacity-10 group-focus-within:opacity-25 transition duration-500" />
            <div className="relative flex items-center gap-3 bg-card2 border-2 border-white/5 focus-within:border-[#1CB0F6]/50 rounded-[22px] p-2 pl-6 transition-all shadow-2xl">
              <input
                ref={inputRef}
                className="flex-1 bg-transparent py-3.5 text-[#F5F5F5] font-semibold text-sm outline-none placeholder:text-[#6F6F6F] placeholder:font-bold"
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
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 shadow-lg",
                  loading || !input.trim() 
                    ? "bg-white/5 text-[#6F6F6F] cursor-not-allowed"
                    : "bg-gradient-to-br from-[#1CB0F6] to-[#2B70C9] text-white hover:scale-105 active:scale-95 hover:shadow-[#1CB0F6]/30"
                )}
              >
                {loading ? <LoadingIcon /> : <SendIcon />}
              </button>
            </div>
          </div>
          
          <p className="text-center text-[10px] text-[#6F6F6F] font-bold uppercase tracking-widest opacity-50">
            Jimmy can make mistakes. Verify important information.
          </p>
        </div>
      </div>

      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#1CB0F6]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#2B70C9]/5 rounded-full blur-[120px]" />
      </div>
    </div>
  )
}
