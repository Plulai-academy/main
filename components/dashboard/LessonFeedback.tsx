'use client'
// components/dashboard/LessonFeedback.tsx
import React, { useState } from 'react'
import { submitLessonFeedback } from '@/lib/supabase/queries'
import { cn } from '@/lib/utils'

interface Props {
  userId:   string
  lessonId: string
  lang:     'en' | 'ar' | 'fr'
  onDone:   () => void
  onSkip:   () => void
}

const FEELINGS = [
  { id: 'easy',       emoji: '😴', en: 'Too easy',    ar: 'سهل جداً',  fr: 'Trop facile' },
  { id: 'just_right', emoji: '🎯', en: 'Just right',  ar: 'مناسب تماماً', fr: 'Parfait' },
  { id: 'hard',       emoji: '😅', en: 'Challenging', ar: 'صعب',       fr: 'Difficile' },
  { id: 'boring',     emoji: '😑', en: 'Boring',      ar: 'ممل',       fr: 'Ennuyeux' },
  { id: 'loved_it',   emoji: '🔥', en: 'Loved it!',   ar: 'أحببته!',   fr: 'Adoré !' },
]

const STARS_LABEL: Record<string, string[]> = {
  en: ['','Awful','Not great','Okay','Good','Amazing!'],
  ar: ['','سيئ','ليس جيداً','مقبول','جيد','رائع!'],
  fr: ['','Mauvais','Pas terrible','Correct','Bien','Super !'],
}

const T: Record<string, Record<string, string>> = {
  title:   { en: 'How was this lesson?', ar: 'كيف كان الدرس؟', fr: 'Comment était cette leçon ?' },
  rating:  { en: 'Rate it:', ar: 'قيّمه:', fr: 'Note-le :' },
  feeling: { en: 'How did it feel?', ar: 'كيف شعرت؟', fr: 'Comment tu as trouvé ça ?' },
  comment: { en: 'Anything to add? (optional)', ar: 'هل تريد إضافة شيء؟ (اختياري)', fr: 'Quelque chose à ajouter ? (optionnel)' },
  submit:  { en: 'Send feedback', ar: 'إرسال التقييم', fr: 'Envoyer' },
  skip:    { en: 'Skip', ar: 'تخطى', fr: 'Ignorer' },
  thanks:  { en: 'Thanks! Your feedback helps us improve 🙌', ar: 'شكراً! تقييمك يساعدنا على التحسين 🙌', fr: 'Merci ! Ton avis nous aide à progresser 🙌' },
}

export default function LessonFeedback({ userId, lessonId, lang, onDone, onSkip }: Props) {
  const [rating,  setRating]  = useState(0)
  const [hover,   setHover]   = useState(0)
  const [feeling, setFeeling] = useState('')
  const [comment, setComment] = useState('')
  const [saving,  setSaving]  = useState(false)
  const [done,    setDone]    = useState(false)

  const t = (key: string) => T[key]?.[lang] ?? T[key]?.en ?? key
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  const submit = async () => {
    if (!rating || !feeling) return
    setSaving(true)
    await submitLessonFeedback(userId, lessonId, rating, feeling, comment.trim() || undefined)
    setSaving(false)
    setDone(true)
    setTimeout(onDone, 1500)
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center animate-slide-up">
        <div className="text-5xl mb-3 animate-bounce-slow">🙌</div>
        <p className="font-fredoka text-lg text-accent3">{t('thanks')}</p>
      </div>
    )
  }

  return (
    <div className="animate-slide-up" dir={dir}>
      <h3 className="font-fredoka text-xl mb-5 text-center">{t('title')}</h3>

      {/* Star rating */}
      <div className="mb-5">
        <p className="text-sm font-bold text-muted mb-2">{t('rating')}</p>
        <div className="flex gap-2 justify-center">
          {[1,2,3,4,5].map(s => (
            <button
              key={s}
              onClick={() => setRating(s)}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              className="text-3xl transition-transform hover:scale-125"
            >
              <span className={cn(
                'transition-all',
                s <= (hover || rating) ? 'opacity-100' : 'opacity-25'
              )}>⭐</span>
            </button>
          ))}
        </div>
        {(hover || rating) > 0 && (
          <p className="text-center text-xs font-bold text-accent2 mt-1">
            {STARS_LABEL[lang]?.[hover || rating] ?? STARS_LABEL.en[hover || rating]}
          </p>
        )}
      </div>

      {/* Feeling chips */}
      <div className="mb-5">
        <p className="text-sm font-bold text-muted mb-2">{t('feeling')}</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {FEELINGS.map(f => (
            <button
              key={f.id}
              onClick={() => setFeeling(f.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-2xl text-sm font-bold border transition-all hover:-translate-y-0.5',
                feeling === f.id
                  ? 'bg-accent4/20 border-accent4/50 text-white'
                  : 'bg-card2 border-white/10 text-muted hover:text-white hover:border-white/25'
              )}
            >
              <span>{f.emoji}</span>
              <span>{f[lang as 'en'|'ar'|'fr']}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Optional comment */}
      <div className="mb-5">
        <p className="text-sm font-bold text-muted mb-2">{t('comment')}</p>
        <textarea
          value={comment}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
          maxLength={300}
          rows={2}
          className="w-full bg-card2 border border-white/10 focus:border-accent4 rounded-2xl px-4 py-3 text-sm font-semibold text-white outline-none resize-none transition-colors placeholder:text-muted"
          placeholder={lang === 'ar' ? 'اكتب ملاحظتك هنا...' : lang === 'fr' ? 'Écris ton commentaire ici...' : 'Write your thoughts here...'}
          dir={dir}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onSkip}
          className="flex-1 py-3 rounded-2xl font-bold text-sm text-muted border border-white/10 hover:border-white/25 hover:text-white transition-all"
        >
          {t('skip')}
        </button>
        <button
          onClick={submit}
          disabled={!rating || !feeling || saving}
          className="flex-2 flex-1 py-3 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-accent3 to-accent4 text-white hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
        >
          {saving ? '⏳' : t('submit')}
        </button>
      </div>
    </div>
  )
}
