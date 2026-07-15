'use client'
// components/dashboard/LessonViewClient.tsx
import React, { useState, useTransition, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { completeLesson, addXP, updateSkillProgress, checkAndAwardBadges, updateStreak } from '@/lib/supabase/queries'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/openrouter'
import ShareCardModal, { type ShareCardProps } from '@/components/share/ShareCardGenerator'
import LessonFeedback from '@/components/dashboard/LessonFeedback'
import LessonCompletionPanel from '@/components/dashboard/LessonCompletionPanel'

// ─────────────────────────────────────────────────────────────────────────────
// Shared icon set — every literal emoji used as UI chrome across this file is
// replaced by one of these. Dynamic content (lesson.emoji, etc.) is untouched.
// ─────────────────────────────────────────────────────────────────────────────
type IconKind =
  | 'chevronLeft' | 'chevronRight' | 'book' | 'lightbulb' | 'code' | 'quiz' | 'ladder'
  | 'target' | 'note' | 'warning' | 'danger' | 'success' | 'compare' | 'checklist'
  | 'play' | 'link' | 'image' | 'external' | 'bolt' | 'pencil' | 'shuffle' | 'bug'
  | 'timer' | 'palette' | 'puzzle' | 'upload' | 'robot' | 'fire' | 'star' | 'trophy'
  | 'hourglass' | 'check' | 'x' | 'lock' | 'sparkle' | 'partyPop' | 'copy' | 'dragHandle'
  | 'arrowUp' | 'arrowDown' | 'flashlight' | 'video' | 'sun'

function Icon({ kind, className, style }: { kind: IconKind; className?: string; style?: React.CSSProperties }) {
  const common = { className, style, fill: 'currentColor', viewBox: '0 0 24 24' as const }
  switch (kind) {
    case 'chevronLeft':  return <svg {...common}><path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z"/></svg>
    case 'chevronRight': return <svg {...common}><path d="M8.6 16.6 10 18l6-6-6-6-1.4 1.4L13.2 12z"/></svg>
    case 'book':       return <svg {...common}><path d="M5 4a2 2 0 0 1 2-2h11v17H7a2 2 0 0 0-2 2V4Zm2 14h9V4H7v14Z"/></svg>
    case 'lightbulb':  return <svg {...common}><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2ZM9 19h6v1H9v-1Zm1 3h4v1h-4v-1Z"/></svg>
    case 'code':       return <svg {...common}><path d="M8.6 16.6 4 12l4.6-4.6L7.2 6 1.4 12l5.8 6 1.4-1.4Zm6.8 0L20 12l-4.6-4.6L16.8 6l5.8 6-5.8 6-1.4-1.4Z"/></svg>
    case 'quiz':       return <svg {...common}><path d="M11 18h2v2h-2v-2Zm1-14a5 5 0 0 0-5 5h2a3 3 0 1 1 4.5 2.6c-.9.55-1.5 1.5-1.5 2.4v1h2v-1c0-.4.3-.85.8-1.15A5 5 0 0 0 12 4Z"/></svg>
    case 'ladder':     return <svg {...common}><path d="M6 2h2v20H6V2Zm10 0h2v20h-2V2ZM6 6h12v2H6V6Zm0 5h12v2H6v-2Zm0 5h12v2H6v-2Z"/></svg>
    case 'target':     return <svg {...common}><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 3a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm0 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 3a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"/></svg>
    case 'note':       return <svg {...common}><path d="M5 3h14a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm2 4v2h10V7H7Zm0 4v2h10v-2H7Zm0 4v2h6v-2H7Z"/></svg>
    case 'warning':    return <svg {...common}><path d="M12 2 1 21h22L12 2Zm0 6 .9.9-.4 6.1h-1l-.4-6.1L12 8Zm0 9a1.2 1.2 0 1 1 0 2.4A1.2 1.2 0 0 1 12 17Z"/></svg>
    case 'danger':     return <svg {...common}><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4 .9.9-.5 6.1h-.8l-.5-6.1.9-.9Zm0 9.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z"/></svg>
    case 'success':    return <svg {...common}><path d="M9.5 16.6 4.9 12l-1.4 1.4 6 6L21 7.9l-1.4-1.4z"/></svg>
    case 'compare':    return <svg {...common}><path d="M7 4v13l-4-4v6h18v-6l-4 4V4h-2v13l-3-3-3 3V4H7Z"/></svg>
    case 'checklist':  return <svg {...common}><path d="M3 5h2v2H3V5Zm4 0h14v2H7V5ZM3 11h2v2H3v-2Zm4 0h14v2H7v-2ZM3 17h2v2H3v-2Zm4 0h14v2H7v-2Z"/></svg>
    case 'play':       return <svg {...common}><path d="M8 5v14l11-7L8 5Z"/></svg>
    case 'link':       return <svg {...common}><path d="M10.6 13.4a1 1 0 0 1 0-1.4l3-3a3 3 0 0 1 4.2 4.2l-2 2a1 1 0 1 1-1.4-1.4l2-2a1 1 0 0 0-1.4-1.4l-3 3a1 1 0 0 1-1.4 0ZM13.4 10.6a1 1 0 0 1 0 1.4l-3 3a3 3 0 0 1-4.2-4.2l2-2a1 1 0 1 1 1.4 1.4l-2 2a1 1 0 0 0 1.4 1.4l3-3a1 1 0 0 1 1.4 0Z"/></svg>
    case 'image':      return <svg {...common}><path d="M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm1 13 4-5 2.5 3 3-4L19 17H6Z"/></svg>
    case 'external':   return <svg {...common}><path d="M14 3h7v7h-2V6.4l-8.3 8.3-1.4-1.4L17.6 5H14V3ZM5 5h6v2H7v10h10v-4h2v6H5V5Z"/></svg>
    case 'bolt':       return <svg {...common}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/></svg>
    case 'pencil':     return <svg {...common}><path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25ZM20.7 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z"/></svg>
    case 'shuffle':    return <svg {...common}><path d="M16 3h5v5h-2V6.4l-3.3 3.3-1.4-1.4L17.6 5H16V3ZM3 6h5l3 3-1.4 1.4L7 7.8H3V6Zm13 15h5v-5h-2v2.6l-3.3-3.3-1.4 1.4 3.3 3.3H16v1ZM3 18h4l2.6-2.6 1.4 1.4L8.4 20H3v-2Z"/></svg>
    case 'bug':        return <svg {...common}><path d="M9 2 7.6 3.4 9 4.8A5 5 0 0 0 7 9H4v2h3v2H4v2h3a5 5 0 0 0 10 0h3v-2h-3v-2h3V9h-3a5 5 0 0 0-2-3.9l1.4-1.5L15 2l-1.8 1.8a5 5 0 0 0-2.4 0L9 2Zm1 9h4v2h-4v-2Z"/></svg>
    case 'timer':      return <svg {...common}><path d="M9 2h6v2H9V2Zm3 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm1 4v4.4l3 1.8-.75 1.25L11 14V10h2Z"/></svg>
    case 'palette':    return <svg {...common}><path d="M12 2a10 10 0 1 0 0 20c1.4 0 2-1 2-2 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.1 0-.8.7-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-5-4-9-9-9Zm-5 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm3 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z"/></svg>
    case 'puzzle':     return <svg {...common}><path d="M10 3h4v2.2a2 2 0 1 1 0 3.6V11h2.2a2 2 0 1 1 0 4H14v3.8a2 2 0 1 1-4 0V15H7.8a2 2 0 1 1 0-4H10v-3.2a2 2 0 1 1 0-3.6V3Z"/></svg>
    case 'upload':     return <svg {...common}><path d="M12 3 7 8h3v6h4V8h3l-5-5Zm-7 13h14v5H5v-5Z"/></svg>
    case 'robot':      return <svg {...common}><path d="M12 2a1.5 1.5 0 0 1 1.5 1.5V5h3A2.5 2.5 0 0 1 19 7.5V9a3 3 0 0 1 0 6v1.5A2.5 2.5 0 0 1 16.5 19h-9A2.5 2.5 0 0 1 5 16.5V15a3 3 0 0 1 0-6V7.5A2.5 2.5 0 0 1 7.5 5h3V3.5A1.5 1.5 0 0 1 12 2ZM9 11a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"/></svg>
    case 'fire':       return <svg {...common}><path d="M13 2c1 3-2 4-2 7a3 3 0 1 0 6 0c1 1 2 3 2 5a7 7 0 1 1-14 0c0-4 3-5 4-8 0 1 .5 2 1.5 2C11 6 12 4 13 2Z"/></svg>
    case 'star':       return <svg {...common}><path d="M12 2.5l2.9 6.1 6.6.7-4.9 4.6 1.4 6.5L12 17.3l-6 3.1 1.4-6.5L2.5 9.3l6.6-.7L12 2.5Z"/></svg>
    case 'trophy':     return <svg {...common}><path d="M6 3h12v3h3v3a4 4 0 0 1-4 4 6 6 0 0 1-4 3.9V19h3v2H8v-2h3v-2.1A6 6 0 0 1 7 13a4 4 0 0 1-4-4V6h3V3Zm0 5H5v1a2 2 0 0 0 1 1.7V8Zm12 0v2.7A2 2 0 0 0 19 9V8h-1Z"/></svg>
    case 'hourglass':  return <svg {...common}><path d="M6 2h12v2l-4 5 4 5v2H6v-2l4-5-4-5V2Zm2 2.6L11 8h2l3-3.4H8Zm0 14.8h8L11 16H9l-1 3.4Z"/></svg>
    case 'check':      return <svg {...common}><path d="M9.5 16.6 4.9 12l-1.4 1.4 6 6L21 7.9l-1.4-1.4z"/></svg>
    case 'x':          return <svg {...common}><path d="M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6 6.4 5Z"/></svg>
    case 'lock':       return <svg {...common}><path d="M7 10V8a5 5 0 0 1 10 0v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h6V8a3 3 0 0 0-6 0v2Z"/></svg>
    case 'sparkle':    return <svg {...common}><path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2Z"/></svg>
    case 'partyPop':   return <svg {...common}><path d="M3 21l4-13 13 4-13 4-4 5Zm9-17 1.5 2.6L17 8l-3.6.3L12 11l-1.4-2.7L7 8l3.5-2.4L12 3Z"/></svg>
    case 'copy':       return <svg {...common}><path d="M8 3h9a2 2 0 0 1 2 2v9h-2V5H8V3Zm-3 4h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm0 2v10h9V9H5Z"/></svg>
    case 'dragHandle': return <svg {...common}><circle cx="8" cy="6" r="1.4"/><circle cx="16" cy="6" r="1.4"/><circle cx="8" cy="12" r="1.4"/><circle cx="16" cy="12" r="1.4"/><circle cx="8" cy="18" r="1.4"/><circle cx="16" cy="18" r="1.4"/></svg>
    case 'arrowUp':    return <svg {...common}><path d="M12 5 5 12l1.4 1.4L11 8.8V19h2V8.8l4.6 4.6L19 12 12 5Z"/></svg>
    case 'arrowDown':  return <svg {...common}><path d="M12 19 19 12l-1.4-1.4L13 15.2V5h-2v10.2l-4.6-4.6L5 12l7 7Z"/></svg>
    case 'flashlight': return <svg {...common}><path d="M9 2h6v4l-2 2v3l3 3v8H8v-8l3-3V8L9 6V2Z"/></svg>
    case 'video':      return <svg {...common}><path d="M4 6a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v2.5l4-2.4v11.8l-4-2.4V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z"/></svg>
    case 'sun':        return <svg {...common}><path d="M12 4a1 1 0 0 1 1 1v2h-2V5a1 1 0 0 1 1-1Zm6.4 2.6 1.4 1.4-1.5 1.5-1.4-1.4 1.5-1.5ZM4.2 6l1.5 1.5-1.4 1.4L2.8 7.4 4.2 6ZM12 9a5 5 0 0 1 4.9 6H7.1A5 5 0 0 1 12 9Zm-9 7h18v2H3v-2Zm.8 4 1.4-1.4 1.5 1.5-1.4 1.4L3.8 20Zm14.9.1 1.4-1.4 1.5 1.5-1.4 1.4-1.5-1.5Z"/></svg>
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Design system, condensed: ONE neutral content card, ONE dark terminal card,
// and two semantic action colors (coral primary / teal-green success) reused
// for every state everywhere. Activity types keep their icon for
// recognizability, but no longer get their own unique background/border color.
//
// GULF CIRCUIT REBRAND — "energetic" mode (kid-facing B2C app, ages 6-18):
// Cards now sit on the Lagoon (#EAF7F4) page background (set globally on
// <body>) as clean WHITE surfaces with soft navy hairlines, instead of the
// old dark/space theme. Every hardcoded accent color across the ~20 activity
// renderers in this file was pulled from a tiny palette, so recoloring it
// here recolors the whole lesson experience consistently:
//   accent / "correct"   → Reef Bright  #17D9C0
//   reward / hint / tip  → Sun Gold     #FFB930
//   primary CTA          → Coral        #FF6B57  (never used for anything else)
//   error / "wrong"      → shared error red #E15B71 (unchanged — matches
//                           --color-error in globals.css)
// Code/terminal windows (code, code_editor, fill-blank, unscramble, debug,
// drag-drop) intentionally KEEP a dark "editor" background — that's a
// familiar, legible metaphor for a code surface even inside an otherwise
// light, playful kid UI — but their accent hex values are updated to match.
// ─────────────────────────────────────────────────────────────────────────────
const CARD       = 'bg-white border border-[#0D2B32]/8 rounded-3xl shadow-[0_4px_20px_rgba(13,43,50,0.05)]'
const TERMINAL   = 'bg-[#0D2B32] border border-white/10 rounded-3xl overflow-hidden'
const PRIMARY_BTN  = 'bg-[#FF6B57] text-white shadow-[0_4px_0_rgba(13,43,50,0.18)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none'
const SUCCESS_BTN  = 'bg-[#17D9C0] text-white shadow-[0_4px_0_rgba(13,43,50,0.18)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none'

// Shared chrome for "code-window" style activities — mac-style dots, icon +
// label, all using the same dark terminal background regardless of type.
function CodeWindowHeader({ icon, label, trailing }: { icon: IconKind; label: string; trailing?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-white/8 bg-white/2">
      <div className="flex gap-1.5 flex-shrink-0">
        <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <div className="w-3 h-3 rounded-full bg-[#28c840]" />
      </div>
      <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-white/50">
        <Icon kind={icon} className="w-3.5 h-3.5" /> {label}
      </span>
      {trailing && <span className="ml-auto">{trailing}</span>}
    </div>
  )
}

// Section eyebrow used across content blocks — small icon chip carries the
// only color; the card itself stays neutral white.
function SectionEyebrow({ icon, label, color }: { icon: IconKind; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', color)}>
        <Icon kind={icon} className="w-4 h-4" />
      </span>
      <span className="text-xs font-black text-[#4E7169] uppercase tracking-wider">{label}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// i18n
// ─────────────────────────────────────────────────────────────────────────────
const UI: Record<string, Record<string, string>> = {
  en: {
    back: 'Lessons', complete: 'Mark Complete', completed: 'Done!',
    next: 'Next Lesson', finish: 'Finish Skill!', quiz: 'Quick Check',
    correct: 'Correct! Great job!', wrong: 'Not quite — think it over!',
    xpEarned: 'XP earned!', levelUp: 'Level Up!', tryAgain: 'Try Again',
    submit: 'Submit Answer', askCoach: 'Ask AI Coach',
    reading: 'Reading', code: 'Code Example', analogy: 'Think of it this way',
    tip: 'Pro Tip', completedBefore: 'Already Completed',
    progress: 'Your Progress', lesson: 'Lesson',
    steps: 'Step-by-Step', challenge: 'Challenge', callout_note: 'Note',
    callout_warning: 'Warning', callout_danger: 'Important',
    comparison: 'Before vs After', checklist: 'Checklist',
    video: 'Video', image: 'Diagram',
    checkAll: 'Check all items before continuing',
    codeViewer: 'Python Code',
    copyCode: 'Copy', copied: 'Copied!',
    website: 'Interactive Resource',
    openSite: 'Open in new tab',
    external: 'External Activity',
    externalDesc: 'This activity takes place on another platform. Complete it there, then come back and mark this lesson done.',
    externalBtn: 'Open Activity',
    externalDone: 'Done? Come back here and mark complete',
    speedQuiz: 'Speed Round',
    fillBlank: 'Fill in the Blanks',
    unscramble: 'Unscramble the Code',
    debug: 'Bug Hunt',
    timedChallenge: 'Timed Challenge',
    remix: 'Remix Challenge',
    timeLeft: 'Time left',
    score: 'Score',
    startQuiz: 'Start Speed Round',
    checkAnswer: 'Check Answer',
    nextQuestion: 'Next',
    showHint: 'Show Hint',
    hideHint: 'Hide Hint',
    dragToOrder: 'Drag lines into the correct order',
    bugFound: 'Bug found!',
    fixIt: 'I fixed it!',
    bonusChallenge: 'Bonus Challenge Unlocked!',
    startTimer: 'Start Timer',
    submitChallenge: 'Submit',
    remixDesc: 'You nailed the basics. Now twist it.',
    remixDone: 'I finished my remix',
    remixComplete: 'Remix complete!',
    dragDrop: 'Drag & Drop',
    dragInstruction: 'Drag each word into the correct slot',
    wordBank: 'Word Bank',
    resetWords: 'Reset',
    submitWork: 'Submit Your Work',
    submitUrl: 'Project / website link',
    submitVideo: 'Video demo link (YouTube, Loom…)',
    submitPlaceholder: 'Paste your link here…',
    submitBtn: 'Submit',
    submitDone: 'Submitted! Great work.',
    submitRequired: 'Please paste your link before submitting.',
  },
  ar: {
    back: 'الدروس', complete: 'علّم كمكتمل', completed: 'تم!',
    next: 'الدرس التالي', finish: 'أكمل المهارة!', quiz: 'اختبار سريع',
    correct: 'صحيح! عمل رائع!', wrong: 'ليس تماماً — فكّر مجدداً!',
    xpEarned: 'XP مكتسب!', levelUp: 'ترقية المستوى!', tryAgain: 'حاول مجدداً',
    submit: 'أرسل الإجابة', askCoach: 'اسأل المدرب الذكي',
    reading: 'قراءة', code: 'مثال كودي', analogy: 'فكر بهذه الطريقة',
    tip: 'نصيحة احترافية', completedBefore: 'مكتمل بالفعل',
    progress: 'تقدمك', lesson: 'درس',
    steps: 'خطوة بخطوة', challenge: 'تحدي', callout_note: 'ملاحظة',
    callout_warning: 'تحذير', callout_danger: 'مهم',
    comparison: 'قبل وبعد', checklist: 'قائمة التحقق',
    video: 'فيديو', image: 'رسم توضيحي',
    checkAll: 'تحقق من جميع العناصر قبل المتابعة',
    codeViewer: 'كود Python',
    copyCode: 'نسخ', copied: 'تم النسخ!',
    website: 'مورد تفاعلي',
    openSite: 'فتح في تبويب جديد',
    external: 'نشاط خارجي',
    externalDesc: 'يتم هذا النشاط على منصة أخرى. أكمله هناك، ثم عد وعلّم الدرس كمكتمل.',
    externalBtn: 'فتح النشاط',
    externalDone: 'انتهيت؟ عد هنا وعلّم الدرس كمكتمل',
    speedQuiz: 'جولة سريعة',
    fillBlank: 'أكمل الفراغات',
    unscramble: 'رتّب الكود',
    debug: 'صياد الأخطاء',
    timedChallenge: 'تحدي موقوت',
    remix: 'تحدي الريمكس',
    timeLeft: 'الوقت المتبقي',
    score: 'النتيجة',
    startQuiz: 'ابدأ الجولة',
    checkAnswer: 'تحقق من الإجابة',
    nextQuestion: 'التالي',
    showHint: 'أظهر التلميح',
    hideHint: 'أخفِ التلميح',
    dragToOrder: 'اسحب الأسطر إلى الترتيب الصحيح',
    bugFound: 'وجدت الخطأ!',
    fixIt: 'أصلحته!',
    bonusChallenge: 'تحدي إضافي مفتوح!',
    startTimer: 'ابدأ الموقت',
    submitChallenge: 'أرسل',
    remixDesc: 'أتقنت الأساسيات. الآن طوّرها.',
    remixDone: 'أنهيت الريمكس',
    remixComplete: 'اكتمل الريمكس!',
    dragDrop: 'اسحب وأفلت',
    dragInstruction: 'اسحب كل كلمة إلى المكان الصحيح',
    wordBank: 'بنك الكلمات',
    resetWords: 'إعادة تعيين',
    submitWork: 'أرسل عملك',
    submitUrl: 'رابط المشروع / الموقع',
    submitVideo: 'رابط الفيديو (YouTube، Loom…)',
    submitPlaceholder: 'الصق رابطك هنا…',
    submitBtn: 'أرسل',
    submitDone: 'تم الإرسال! عمل رائع.',
    submitRequired: 'الرجاء لصق رابطك قبل الإرسال.',
  },
  fr: {
    back: 'Leçons', complete: 'Marquer terminé', completed: 'Fait !',
    next: 'Leçon suivante', finish: 'Terminer !', quiz: 'Vérification rapide',
    correct: 'Correct ! Super boulot !', wrong: 'Pas tout à fait — réfléchis encore !',
    xpEarned: 'XP gagné !', levelUp: 'Niveau supérieur !', tryAgain: 'Réessayer',
    submit: 'Soumettre', askCoach: 'Demander au Coach IA',
    reading: 'Lecture', code: 'Exemple de code', analogy: 'Imagine ça ainsi',
    tip: 'Conseil pro', completedBefore: 'Déjà complété',
    progress: 'Ta progression', lesson: 'Leçon',
    steps: 'Étape par étape', challenge: 'Défi', callout_note: 'Note',
    callout_warning: 'Attention', callout_danger: 'Important',
    comparison: 'Avant / Après', checklist: 'Liste de contrôle',
    video: 'Vidéo', image: 'Schéma',
    checkAll: 'Coche tous les éléments avant de continuer',
    codeViewer: 'Code Python',
    copyCode: 'Copier', copied: 'Copié !',
    website: 'Ressource interactive',
    openSite: 'Ouvrir dans un nouvel onglet',
    external: 'Activité externe',
    externalDesc: "Cette activité se déroule sur une autre plateforme. Complète-la là-bas, puis reviens ici pour marquer la leçon terminée.",
    externalBtn: "Ouvrir l'activité",
    externalDone: 'Terminé ? Reviens ici et marque la leçon complète',
    speedQuiz: 'Tour rapide',
    fillBlank: 'Complète les blancs',
    unscramble: "Remets dans l'ordre",
    debug: 'Chasse aux bugs',
    timedChallenge: 'Défi chronométré',
    remix: 'Défi remix',
    timeLeft: 'Temps restant',
    score: 'Score',
    startQuiz: 'Commencer',
    checkAnswer: 'Vérifier',
    nextQuestion: 'Suivant',
    showHint: "Voir l'indice",
    hideHint: "Cacher l'indice",
    dragToOrder: 'Glisse les lignes dans le bon ordre',
    bugFound: 'Bug trouvé !',
    fixIt: "Je l'ai corrigé !",
    bonusChallenge: 'Défi bonus débloqué !',
    startTimer: 'Lancer le chrono',
    submitChallenge: 'Envoyer',
    remixDesc: 'Tu maîtrises les bases. Maintenant, adapte !',
    remixDone: "J'ai terminé mon remix",
    remixComplete: 'Remix terminé !',
    dragDrop: 'Glisser-Déposer',
    dragInstruction: 'Glisse chaque mot dans le bon emplacement',
    wordBank: 'Banque de mots',
    resetWords: 'Réinitialiser',
    submitWork: 'Soumettre ton travail',
    submitUrl: 'Lien projet / site web',
    submitVideo: 'Lien vidéo démo (YouTube, Loom…)',
    submitPlaceholder: 'Colle ton lien ici…',
    submitBtn: 'Envoyer',
    submitDone: 'Envoyé ! Excellent travail.',
    submitRequired: "Colle ton lien avant d'envoyer.",
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Section interface
// ─────────────────────────────────────────────────────────────────────────────
interface Section {
  type: string
  text?: string
  language?: string
  starter?: string
  instructions?: string
  expected_output?: string
  question?: string
  options?: string[]
  correct?: number
  explanation?: string
  items?: string[]
  title?: string
  hint?: string
  variant?: 'note' | 'warning' | 'danger' | 'success'
  before?: string
  after?: string
  before_label?: string
  after_label?: string
  checks?: string[]
  url?: string
  caption?: string
  src?: string
  alt?: string
  embed_url?: string
  height?: number
  platform?: string
  button_label?: string
  time_per_question?: number
  questions?: Array<{ question: string; options: string[]; correct: number; explanation?: string }>
  code?: string
  blanks?: string[]
  hints?: string[]
  lines?: string[]
  correct_order?: number[]
  broken_code?: string
  bugs?: string[]
  duration_seconds?: number
  task?: string
  bonus_task?: string
  base_xp?: number
  speed_bonus_xp?: number
  twist?: string
  xp_bonus?: number
  word_bank?: string[]
  targets?: Array<{ id: string; label: string; correct: string }>
  submission_type?: 'url' | 'video' | 'both'
  prompt?: string
  placeholder?: string
  required?: boolean
}

interface NextSkill {
  id: string
  lessonId: string
  title: string
  emoji: string
}

interface Props {
  userId:       string
  lesson:       any
  skill:        any
  completion:   any
  totalLessons: number
  lessonIndex:  number
  prevLesson:   any
  nextLesson:   any
  nextSkill?:        NextSkill | null
  language:     string
  userName:     string
  userAvatar?:  string
  streak:            number
  finishedAllTracks: boolean
  suggestedTracks:   { id: string; name: string; emoji: string; description: string }[]
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY: Speed Quiz
// ─────────────────────────────────────────────────────────────────────────────
function SpeedQuizActivity({ s, t, onComplete }: { s: Section; t: Record<string, string>; onComplete?: () => void }) {
  const questions = s.questions ?? []
  const timePerQ  = s.time_per_question ?? 10
  const [started, setStarted]     = useState(false)
  const [qIdx, setQIdx]           = useState(0)
  const [timeLeft, setTimeLeft]   = useState(timePerQ)
  const [selected, setSelected]   = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore]         = useState(0)
  const [done, setDone]           = useState(false)
  const [results, setResults]     = useState<boolean[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const stopTimer = useCallback(() => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  const submitAnswer = useCallback((sel: number | null) => {
    stopTimer()
    setSubmitted(true)
    const correct = sel === questions[qIdx]?.correct
    if (correct) setScore(s => s + 1)
    setResults(r => [...r, correct])
  }, [qIdx, questions, stopTimer])

  const goNext = useCallback(() => {
    stopTimer()
    if (qIdx + 1 >= questions.length) { setDone(true); onComplete?.() }
    else { setQIdx(q => q + 1); setTimeLeft(timePerQ); setSelected(null); setSubmitted(false) }
  }, [qIdx, questions.length, timePerQ, stopTimer, onComplete])

  useEffect(() => {
    if (!started || submitted || done) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { submitAnswer(selected); return 0 } return t - 1 })
    }, 1000)
    return stopTimer
  }, [started, submitted, done, selected, submitAnswer, stopTimer])

  if (!started) return (
    <div className={cn(CARD, 'p-6 text-center')}>
      <div className="w-14 h-14 rounded-2xl bg-[#17D9C0]/15 flex items-center justify-center mx-auto mb-3">
        <Icon kind="bolt" className="w-7 h-7 text-[#0D2B32]" style={{ color: '#0F9B87' }} />
      </div>
      <h3 className="font-extrabold text-lg mb-2 text-[#0D2B32]">{t.speedQuiz}</h3>
      <p className="text-sm text-[#4E7169] font-semibold mb-1">{questions.length} questions · {timePerQ}s each</p>
      {s.text && <p className="text-xs text-[#4E7169]/70 mb-4">{s.text}</p>}
      <button onClick={() => setStarted(true)} className={cn('px-8 py-3 rounded-2xl font-extrabold text-sm transition-all', PRIMARY_BTN)}>
        {t.startQuiz}
      </button>
    </div>
  )

  if (done) {
    const pct = Math.round((score / questions.length) * 100)
    const resultIcon: IconKind = pct === 100 ? 'trophy' : pct >= 70 ? 'partyPop' : 'fire'
    return (
      <div className={cn(CARD, 'p-6 text-center')}>
        <div className="w-16 h-16 rounded-2xl bg-[#17D9C0]/15 flex items-center justify-center mx-auto mb-3">
          <Icon kind={resultIcon} className="w-8 h-8" style={{ color: '#0F9B87' }} />
        </div>
        <h3 className="font-extrabold text-2xl mb-1 text-[#0D2B32]">{score}/{questions.length}</h3>
        <p className="text-sm text-[#4E7169] font-semibold mb-4">{pct}% — {pct === 100 ? 'Perfect!' : pct >= 70 ? 'Great job!' : 'Keep practising!'}</p>
        <div className="flex justify-center gap-2 mb-4">
          {results.map((r, i) => (
            <span key={i} className={cn('w-8 h-8 rounded-full flex items-center justify-center', r ? 'bg-[#17D9C0]/20 text-[#0F9B87]' : 'bg-[#E15B71]/20 text-[#E15B71]')}>
              <Icon kind={r ? 'check' : 'x'} className="w-4 h-4" />
            </span>
          ))}
        </div>
        {pct < 100 && (
          <button onClick={() => { setStarted(false); setQIdx(0); setTimeLeft(timePerQ); setSelected(null); setSubmitted(false); setScore(0); setDone(false); setResults([]) }}
            className="px-6 py-2 rounded-xl font-extrabold text-sm border border-[#0D2B32]/15 text-[#4E7169] hover:text-[#0D2B32] hover:border-[#0D2B32]/30 transition-all">
            {t.tryAgain}
          </button>
        )}
      </div>
    )
  }

  const q    = questions[qIdx]
  const pct  = Math.round((timeLeft / timePerQ) * 100)
  const timerColor = timeLeft <= 3 ? 'bg-[#E15B71]' : timeLeft <= 5 ? 'bg-[#FFB930]' : 'bg-[#17D9C0]'

  return (
    <div className={cn(CARD, 'p-5 sm:p-6')}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-black text-[#4E7169] uppercase tracking-wider flex items-center gap-1.5">
          <Icon kind="bolt" className="w-3.5 h-3.5" style={{ color: '#0F9B87' }} /> {t.speedQuiz}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#4E7169]">{qIdx + 1}/{questions.length}</span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-[#0D2B32]/8 rounded-full overflow-hidden">
              <div className={cn('h-full rounded-full transition-all duration-1000', timerColor)} style={{ width: `${pct}%` }} />
            </div>
            <span className={cn('text-sm font-extrabold tabular-nums w-5 text-right', timeLeft <= 3 ? 'text-[#E15B71]' : 'text-[#0D2B32]')}>{timeLeft}</span>
          </div>
        </div>
      </div>

      <p className="font-extrabold text-sm mb-4 leading-relaxed text-[#0D2B32]">{q.question}</p>

      <div className="space-y-2 mb-4">
        {q.options.map((opt, oi) => {
          let cls = 'border-[#0D2B32]/10 bg-[#EAF7F4]/50 text-[#4E7169] hover:border-[#0D2B32]/25 hover:text-[#0D2B32] cursor-pointer'
          if (submitted) {
            if (oi === q.correct) cls = 'border-[#17D9C0]/60 bg-[#17D9C0]/15 text-[#0F9B87] cursor-default'
            else if (selected === oi) cls = 'border-[#E15B71]/40 bg-[#E15B71]/10 text-[#E15B71] cursor-default'
            else cls = 'border-[#0D2B32]/5 bg-[#0D2B32]/3 text-[#4E7169]/40 cursor-default'
          } else if (selected === oi) cls = 'border-[#17D9C0]/50 bg-[#17D9C0]/15 text-[#0D2B32] cursor-pointer'
          return (
            <button key={oi} onClick={() => !submitted && setSelected(oi)} disabled={submitted}
              className={cn('w-full text-left px-4 py-3 rounded-2xl text-sm font-bold border transition-all', cls)}>
              <span className="font-extrabold mr-2 text-[#4E7169]/60">{String.fromCharCode(65 + oi)}.</span> {opt}
            </button>
          )
        })}
      </div>

      {!submitted ? (
        <button onClick={() => submitAnswer(selected)} disabled={selected === null}
          className={cn('w-full py-2.5 rounded-2xl font-extrabold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all', PRIMARY_BTN)}>
          {t.checkAnswer}
        </button>
      ) : (
        <div className="space-y-3">
          {q.explanation && (
            <div className="bg-[#EAF7F4]/60 border border-[#0D2B32]/8 rounded-2xl p-3">
              <p className="text-xs text-[#4E7169] font-semibold leading-relaxed">{q.explanation}</p>
            </div>
          )}
          <button onClick={goNext} className={cn('w-full py-2.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-1.5 transition-all', SUCCESS_BTN)}>
            {qIdx + 1 >= questions.length ? 'See Results' : t.nextQuestion}
            <Icon kind="chevronRight" className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mt-3">
        <span className="text-xs text-[#4E7169] font-semibold">{t.score}: {score}</span>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div key={i} className={cn('w-2 h-2 rounded-full', i < results.length ? (results[i] ? 'bg-[#17D9C0]' : 'bg-[#E15B71]') : i === qIdx ? 'bg-[#17D9C0]' : 'bg-[#0D2B32]/10')} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY: Fill in the Blank
// ─────────────────────────────────────────────────────────────────────────────
function FillBlankActivity({ s, t, onComplete }: { s: Section; t: Record<string, string>; onComplete?: () => void }) {
  const code    = s.code ?? ''
  const blanks  = s.blanks ?? []
  const hints   = s.hints ?? []
  const parts   = code.split('___')
  const [inputs, setInputs]       = useState<string[]>(Array(blanks.length).fill(''))
  const [checked, setChecked]     = useState(false)
  const [results, setResults]     = useState<boolean[]>([])
  const [showHints, setShowHints] = useState<boolean[]>(Array(blanks.length).fill(false))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const check = () => {
    const res = inputs.map((v, i) => v.trim().toLowerCase() === blanks[i].toLowerCase())
    setResults(res); setChecked(true)
  }
  const reset = () => {
    setInputs(Array(blanks.length).fill('')); setResults([]); setChecked(false)
    setShowHints(Array(blanks.length).fill(false))
  }

  const allCorrect = checked && results.every(Boolean)
  useEffect(() => { if (allCorrect) onComplete?.() }, [allCorrect, onComplete])
  let blankIdx = 0

  return (
    <div className={TERMINAL}>
      <CodeWindowHeader icon="pencil" label={t.fillBlank}
        trailing={s.text ? <span className="text-xs text-white/40 truncate max-w-xs">{s.text}</span> : undefined} />

      <div className="p-5 font-mono text-sm leading-8 overflow-x-auto">
        {parts.map((part, pi) => {
          const currentBlank = blankIdx
          if (pi < parts.length - 1) blankIdx++
          const isCorrect = checked && results[currentBlank]
          const isWrong   = checked && !results[currentBlank]
          return (
            <React.Fragment key={pi}>
              <span className="text-[#17D9C0] whitespace-pre">{part}</span>
              {pi < parts.length - 1 && (
                <input
                  ref={el => { inputRefs.current[currentBlank] = el }}
                  value={inputs[currentBlank]}
                  onChange={e => { const next = [...inputs]; next[currentBlank] = e.target.value; setInputs(next); setChecked(false); setResults([]) }}
                  onKeyDown={e => { if (e.key === 'Enter') { const next = inputRefs.current[currentBlank + 1]; if (next) next.focus(); else check() } }}
                  disabled={checked && isCorrect}
                  className={cn(
                    'inline-block px-2 py-0.5 rounded-md border text-sm font-mono font-bold text-center transition-all outline-none min-w-[80px]',
                    isCorrect ? 'bg-[#17D9C0]/20 border-[#17D9C0]/60 text-[#17D9C0]' :
                    isWrong   ? 'bg-[#E15B71]/20 border-[#E15B71]/50 text-[#E15B71]' :
                                'bg-white/8 border-white/20 text-white focus:border-[#17D9C0]/60 focus:bg-[#17D9C0]/10'
                  )}
                  style={{ width: `${Math.max(blanks[currentBlank]?.length * 10 + 24, 80)}px` }}
                  placeholder="___" spellCheck={false} autoComplete="off"
                />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {hints.length > 0 && (
        <div className="px-5 pb-3 flex flex-wrap gap-2">
          {hints.map((hint, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <button onClick={() => { const n = [...showHints]; n[i] = !n[i]; setShowHints(n) }}
                className="text-xs font-bold text-[#FFB930]/80 hover:text-[#FFB930] transition-colors flex items-center gap-1">
                <Icon kind="flashlight" className="w-3 h-3" /> {showHints[i] ? t.hideHint : `${t.showHint} ${i + 1}`}
              </button>
              {showHints[i] && <span className="text-xs text-white/50 italic">→ {hint}</span>}
            </div>
          ))}
        </div>
      )}

      <div className="px-5 py-4 border-t border-white/5 flex items-center justify-between gap-3">
        {allCorrect ? (
          <p className="text-sm font-extrabold text-[#17D9C0] flex items-center gap-1.5"><Icon kind="check" className="w-4 h-4" /> Perfect! Every blank is correct.</p>
        ) : checked && !allCorrect ? (
          <p className="text-sm font-bold text-[#E15B71]">{results.filter(Boolean).length}/{blanks.length} correct — check the red ones</p>
        ) : (
          <p className="text-xs text-white/30">Fill all blanks then check</p>
        )}
        <div className="flex gap-2">
          {checked && !allCorrect && (
            <button onClick={reset} className="px-4 py-2 rounded-xl text-xs font-extrabold border border-white/10 text-white/50 hover:text-white transition-all">Reset</button>
          )}
          <button onClick={check} disabled={inputs.some(v => !v.trim()) || allCorrect}
            className="px-5 py-2 rounded-xl text-xs font-extrabold bg-[#17D9C0]/20 text-[#17D9C0] border border-[#17D9C0]/30 hover:bg-[#17D9C0]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            {t.checkAnswer}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY: Unscramble
// ─────────────────────────────────────────────────────────────────────────────
function UnscrambleActivity({ s, t, onComplete }: { s: Section; t: Record<string, string>; onComplete?: () => void }) {
  const correctOrder = s.correct_order ?? (s.lines ?? []).map((_, i) => i)
  const [order, setOrder] = useState<number[]>(() => {
    const shuffled = [...correctOrder]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  })
  const [dragging, setDragging] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)
  const [checked, setChecked]   = useState(false)
  const [correct, setCorrect]   = useState(false)

  const lines = s.lines ?? []
  useEffect(() => { if (correct) onComplete?.() }, [correct, onComplete])

  const check = () => { const isCorrect = order.every((v, i) => v === correctOrder[i]); setCorrect(isCorrect); setChecked(true) }
  const handleDrop = (targetIdx: number) => {
    if (dragging === null || dragging === targetIdx) return
    const next = [...order]
    const tmp = next[dragging]; next[dragging] = next[targetIdx]; next[targetIdx] = tmp
    setOrder(next); setDragging(null); setDragOver(null); setChecked(false)
  }
  const moveUp = (i: number) => { if (i === 0) return; const next = [...order]; [next[i], next[i-1]] = [next[i-1], next[i]]; setOrder(next); setChecked(false) }
  const moveDown = (i: number) => { if (i === order.length - 1) return; const next = [...order]; [next[i], next[i+1]] = [next[i+1], next[i]]; setOrder(next); setChecked(false) }

  return (
    <div className={TERMINAL}>
      <CodeWindowHeader icon="shuffle" label={t.unscramble}
        trailing={s.text ? <span className="text-xs text-white/40">{s.text}</span> : undefined} />

      <div className="p-4 space-y-2">
        <p className="text-xs text-white/30 font-semibold mb-3 flex items-center gap-1.5">
          <Icon kind="dragHandle" className="w-3.5 h-3.5" /> Drag to reorder, or use the arrow buttons
        </p>
        {order.map((lineIdx, i) => {
          const lineCorrect = checked && lineIdx === correctOrder[i]
          const lineWrong   = checked && lineIdx !== correctOrder[i]
          return (
            <div key={i}
              draggable
              onDragStart={() => setDragging(i)}
              onDragOver={e => { e.preventDefault(); setDragOver(i) }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => handleDrop(i)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all cursor-grab active:cursor-grabbing select-none',
                dragOver === i ? 'border-[#17D9C0]/60 bg-[#17D9C0]/10' :
                lineCorrect    ? 'border-[#17D9C0]/50 bg-[#17D9C0]/10' :
                lineWrong      ? 'border-[#E15B71]/40 bg-[#E15B71]/8' :
                dragging === i ? 'border-[#17D9C0]/40 bg-[#17D9C0]/8 opacity-50' :
                                 'border-white/8 bg-white/3 hover:border-white/15'
              )}>
              <span className="text-xs font-mono text-white/20 w-4 flex-shrink-0">{i + 1}</span>
              <Icon kind="dragHandle" className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
              <code className={cn('flex-1 text-sm font-mono whitespace-pre', lineCorrect ? 'text-[#17D9C0]' : lineWrong ? 'text-[#E15B71]' : 'text-[#17D9C0]/80')}>{lines[lineIdx]}</code>
              <div className="flex flex-col gap-0.5 flex-shrink-0">
                <button onClick={() => moveUp(i)} disabled={i === 0} aria-label="Move line up" className="text-white/20 hover:text-white/60 disabled:opacity-10 transition-colors"><Icon kind="arrowUp" className="w-3 h-3" /></button>
                <button onClick={() => moveDown(i)} disabled={i === order.length - 1} aria-label="Move line down" className="text-white/20 hover:text-white/60 disabled:opacity-10 transition-colors"><Icon kind="arrowDown" className="w-3 h-3" /></button>
              </div>
              {checked && <Icon kind={lineCorrect ? 'check' : 'x'} className={cn('w-4 h-4 flex-shrink-0', lineCorrect ? 'text-[#17D9C0]' : 'text-[#E15B71]')} />}
            </div>
          )
        })}
      </div>

      <div className="px-5 py-4 border-t border-white/5 flex items-center justify-between">
        {correct ? (
          <p className="text-sm font-extrabold text-[#17D9C0] flex items-center gap-1.5"><Icon kind="check" className="w-4 h-4" /> Perfect order! The code runs correctly.</p>
        ) : checked ? (
          <p className="text-sm font-bold text-[#E15B71]">Not quite — some lines are out of order</p>
        ) : (
          <p className="text-xs text-white/30">Arrange the lines into the correct order</p>
        )}
        {!correct && (
          <button onClick={check} className="px-5 py-2 rounded-xl text-xs font-extrabold bg-[#17D9C0]/20 text-[#17D9C0] border border-[#17D9C0]/30 hover:bg-[#17D9C0]/30 transition-all">
            {t.checkAnswer}
          </button>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY: Bug Hunt
// ─────────────────────────────────────────────────────────────────────────────
function DebugActivity({ s, t, onComplete }: { s: Section; t: Record<string, string>; onComplete?: () => void }) {
  const bugs  = s.bugs ?? []
  const hints = s.hints ?? []
  const [found, setFound]   = useState<boolean[]>(Array(bugs.length).fill(false))
  const [showH, setShowH]   = useState<boolean[]>(Array(hints.length).fill(false))
  const [allFixed, setAllFixed] = useState(false)
  const [copiedBroken, setCopiedBroken] = useState(false)
  useEffect(() => { if (allFixed) onComplete?.() }, [allFixed, onComplete])

  const toggleFound = (i: number) => {
    const next = [...found]; next[i] = !next[i]; setFound(next)
    if (next.every(Boolean)) setAllFixed(true)
  }
  const code = s.broken_code ?? ''

  return (
    <div className={TERMINAL}>
      <div className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-white/8 bg-white/2">
        <div className="flex gap-1.5 flex-shrink-0">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57] animate-pulse" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-white/50">
          <Icon kind="bug" className="w-3.5 h-3.5 text-[#E15B71]" /> {t.debug}
        </span>
        <span className="ml-auto text-xs text-white/40 font-semibold">{bugs.length} bug{bugs.length !== 1 ? 's' : ''} hidden</span>
      </div>

      {s.text && <p className="px-5 pt-4 text-sm text-white/60 font-semibold">{s.text}</p>}

      <div className="relative">
        <pre className="px-5 py-4 text-sm font-mono text-[#FF9A8C] leading-7 overflow-x-auto whitespace-pre">{code}</pre>
        <button
          onClick={() => { navigator.clipboard.writeText(code); setCopiedBroken(true); setTimeout(() => setCopiedBroken(false), 2000) }}
          aria-label={copiedBroken ? 'Code copied' : 'Copy code'}
          className="absolute top-3 right-3 text-xs font-bold text-white/40 hover:text-white border border-white/10 rounded-lg px-2 py-1 transition-all flex items-center gap-1">
          <Icon kind={copiedBroken ? 'check' : 'copy'} className="w-3 h-3" /> {copiedBroken ? '' : 'Copy'}
        </button>
      </div>

      <div className="px-5 py-4 border-t border-white/5 space-y-2">
        <p className="text-xs font-black text-white/40 uppercase tracking-wider mb-3">Find and fix each bug, then check it off:</p>
        {bugs.map((bug, i) => (
          <button key={i} onClick={() => toggleFound(i)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-semibold text-left transition-all',
              found[i] ? 'bg-[#17D9C0]/10 border-[#17D9C0]/30 text-[#17D9C0]' : 'bg-white/3 border-white/8 text-white/60 hover:border-white/20 hover:text-white'
            )}>
            <span className={cn('w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-all', found[i] ? 'bg-[#17D9C0] border-[#17D9C0] text-white' : 'border-white/20')}>
              {found[i] && <Icon kind="check" className="w-3 h-3" />}
            </span>
            <span className={cn(found[i] && 'line-through opacity-50')}>Bug {i + 1}: {bug}</span>
          </button>
        ))}
      </div>

      {hints.length > 0 && (
        <div className="px-5 pb-4 flex flex-wrap gap-2 border-t border-white/5 pt-3">
          {hints.map((hint, i) => (
            <div key={i} className="flex items-center gap-2">
              <button onClick={() => { const n = [...showH]; n[i] = !n[i]; setShowH(n) }}
                className="text-xs font-bold text-[#FFB930]/80 hover:text-[#FFB930] transition-colors flex items-center gap-1">
                <Icon kind="flashlight" className="w-3 h-3" /> {showH[i] ? 'Hide' : `Hint ${i + 1}`}
              </button>
              {showH[i] && <span className="text-xs text-[#FFB930]/90 italic">{hint}</span>}
            </div>
          ))}
        </div>
      )}

      {allFixed && (
        <div className="px-5 pb-5">
          <div className="bg-[#17D9C0]/10 border border-[#17D9C0]/30 rounded-2xl p-4 text-center">
            <p className="text-sm font-extrabold text-[#17D9C0] flex items-center justify-center gap-1.5">
              <Icon kind="bug" className="w-4 h-4" /> All bugs squashed! Great debugging.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY: Timed Challenge
// ─────────────────────────────────────────────────────────────────────────────
function TimedChallengeActivity({ s, t, lessonTitle, onComplete }: { s: Section; t: Record<string, string>; lessonTitle: string; onComplete?: () => void }) {
  const duration = s.duration_seconds ?? 300
  const [phase, setPhase]     = useState<'idle' | 'running' | 'done'>('idle')
  const [timeLeft, setTimeLeft] = useState(duration)
  const [bonusUnlocked, setBonusUnlocked] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  useEffect(() => { if (phase === 'done') onComplete?.() }, [phase, onComplete])

  const start = () => {
    setPhase('running'); setTimeLeft(duration)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current!); setPhase('done'); return 0 } return t - 1 })
    }, 1000)
  }
  const submit = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    const remaining = timeLeft
    setPhase('done')
    if (remaining > 60) setBonusUnlocked(true)
  }
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const pct  = Math.round((timeLeft / duration) * 100)
  const timerColor = pct > 50 ? '#17D9C0' : pct > 25 ? '#FFB930' : '#E15B71'

  if (phase === 'idle') return (
    <div className={cn(CARD, 'p-6')}>
      <div className="flex items-center gap-2 mb-3">
        <Icon kind="timer" className="w-5 h-5" style={{ color: '#0F9B87' }} />
        <span className="text-xs font-black text-[#4E7169] uppercase tracking-wider">{t.timedChallenge}</span>
      </div>
      {s.title && <h3 className="font-extrabold text-base mb-2 text-[#0D2B32]">{s.title}</h3>}
      <p className="text-sm font-semibold leading-relaxed text-[#4E7169] mb-4">{s.task ?? s.text}</p>
      {s.expected_output && (
        <div className="bg-[#0D2B32] border border-white/10 rounded-2xl p-3 mb-4">
          <p className="text-xs font-bold text-white/50 mb-1">Expected output:</p>
          <pre className="text-sm font-mono text-[#17D9C0] whitespace-pre-wrap">{s.expected_output}</pre>
        </div>
      )}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-sm text-[#4E7169] font-semibold">
          {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')} — finish early for bonus XP!
        </div>
        <button onClick={start} className={cn('px-6 py-2.5 rounded-2xl font-extrabold text-sm transition-all', PRIMARY_BTN)}>
          {t.startTimer}
        </button>
      </div>
    </div>
  )

  if (phase === 'done') return (
    <div className={cn(CARD, 'p-6 text-center')}>
      <div className="w-14 h-14 rounded-2xl bg-[#17D9C0]/15 flex items-center justify-center mx-auto mb-3">
        <Icon kind={bonusUnlocked ? 'star' : 'check'} className="w-7 h-7" style={{ color: '#0F9B87' }} />
      </div>
      <h3 className="font-extrabold text-lg mb-2 text-[#0D2B32]">{bonusUnlocked ? t.bonusChallenge : 'Challenge complete!'}</h3>
      {bonusUnlocked && s.bonus_task && (
        <div className="bg-[#EAF7F4] border border-[#0D2B32]/8 rounded-2xl p-4 mt-3 text-left">
          <p className="text-xs font-extrabold text-[#4E7169] mb-2 uppercase tracking-wider">Bonus challenge:</p>
          <p className="text-sm font-semibold text-[#4E7169]">{s.bonus_task}</p>
        </div>
      )}
      <Link href={`/dashboard/coach?topic=${encodeURIComponent(lessonTitle)}`}
        className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-[#0F9B87] hover:text-[#0D2B32] transition-colors">
        <Icon kind="robot" className="w-3.5 h-3.5" /> Get feedback from AI Coach
      </Link>
    </div>
  )

  return (
    <div className={cn(CARD, 'p-6')}>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Icon kind="timer" className="w-5 h-5" style={{ color: '#0F9B87' }} />
        <span className="text-xs font-black text-[#4E7169] uppercase tracking-wider">{t.timedChallenge}</span>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-32 h-2.5 bg-[#0D2B32]/8 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: timerColor }} />
          </div>
          <span className={cn('text-base font-extrabold tabular-nums', timeLeft <= 60 ? 'text-[#E15B71]' : 'text-[#0D2B32]')}>{mins}:{String(secs).padStart(2, '0')}</span>
        </div>
      </div>
      {s.title && <h3 className="font-extrabold text-base mb-2 text-[#0D2B32]">{s.title}</h3>}
      <p className="text-sm font-semibold leading-relaxed text-[#4E7169] mb-4">{s.task ?? s.text}</p>
      {s.hint && (
        <details className="mb-4">
          <summary className="text-xs font-bold text-[#0F9B87] cursor-pointer hover:text-[#0D2B32] transition-colors">Hint</summary>
          <p className="text-sm text-[#4E7169] font-semibold mt-2 pl-4 border-l-2 border-[#17D9C0]/30 leading-relaxed">{s.hint}</p>
        </details>
      )}
      <button onClick={submit} className={cn('w-full py-3 rounded-2xl font-extrabold text-sm transition-all', SUCCESS_BTN)}>
        {t.submitChallenge} {timeLeft > 60 ? `(+${s.speed_bonus_xp ?? 50} bonus XP!)` : ''}
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY: Remix Challenge
// ─────────────────────────────────────────────────────────────────────────────
function RemixActivity({ s, t, lessonTitle, onComplete }: { s: Section; t: Record<string, string>; lessonTitle: string; onComplete?: () => void }) {
  const [unlocked, setUnlocked] = useState(false)
  const [finished, setFinished] = useState(false)

  if (!unlocked) return (
    <div className={cn(CARD, 'border-dashed p-5 text-center')}>
      <div className="w-12 h-12 rounded-2xl bg-[#17D9C0]/15 flex items-center justify-center mx-auto mb-2">
        <Icon kind="palette" className="w-6 h-6" style={{ color: '#0F9B87' }} />
      </div>
      <p className="font-extrabold text-sm mb-1 text-[#0D2B32]">{t.remix}</p>
      <p className="text-xs text-[#4E7169] font-semibold mb-4">{t.remixDesc}</p>
      <button onClick={() => setUnlocked(true)} className={cn('px-6 py-2.5 rounded-2xl font-extrabold text-sm flex items-center gap-1.5 mx-auto transition-all', PRIMARY_BTN)}>
        Unlock Remix <Icon kind="lock" className="w-3.5 h-3.5" />
      </button>
    </div>
  )

  return (
    <div className={cn(CARD, 'p-5')}>
      <div className="flex items-center gap-2 mb-3">
        <Icon kind="palette" className="w-5 h-5" style={{ color: '#0F9B87' }} />
        <span className="text-xs font-black text-[#4E7169] uppercase tracking-wider">{t.remix}</span>
        {s.xp_bonus && <span className="ml-auto text-xs font-extrabold text-[#0F9B87] bg-[#17D9C0]/15 border border-[#17D9C0]/25 px-2.5 py-0.5 rounded-full">+{s.xp_bonus} XP</span>}
      </div>
      {s.title && <h3 className="font-extrabold text-base mb-2 text-[#0D2B32]">{s.title}</h3>}
      <p className="text-sm font-semibold leading-relaxed mb-4 text-[#0D2B32]">{s.twist ?? s.text}</p>
      {s.hint && (
        <details className="mb-4">
          <summary className="text-xs font-bold text-[#0F9B87] cursor-pointer hover:text-[#0D2B32] transition-colors">{t.showHint}</summary>
          <p className="text-sm text-[#4E7169] font-semibold mt-2 pl-4 border-l-2 border-[#17D9C0]/30 leading-relaxed">{s.hint}</p>
        </details>
      )}
      <div className="flex items-center gap-3 flex-wrap">
        <Link href={`/dashboard/coach?topic=${encodeURIComponent(lessonTitle + ' remix')}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F9B87] hover:text-[#0D2B32] transition-colors">
          <Icon kind="robot" className="w-3.5 h-3.5" /> Show AI Coach my remix
        </Link>
        {!finished ? (
          <button onClick={() => { setFinished(true); onComplete?.() }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-[#17D9C0]/15 text-[#0F9B87] border border-[#17D9C0]/25 hover:bg-[#17D9C0]/25 transition-all">
            <Icon kind="check" className="w-3.5 h-3.5" /> {t.remixDone}
          </button>
        ) : (
          <p className="text-xs font-extrabold text-[#0F9B87] flex items-center gap-1.5">
            <Icon kind="check" className="w-4 h-4" /> {t.remixComplete}
          </p>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY: Drag & Drop
// ─────────────────────────────────────────────────────────────────────────────
function DragDropActivity({ s, t, onComplete }: { s: Section; t: Record<string, string>; onComplete?: () => void }) {
  const targets  = s.targets ?? []
  const wordBank = s.word_bank ?? targets.map(tgt => tgt.correct)

  const [bank, setBank] = useState<string[]>(() => {
    const arr = [...wordBank]
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]] }
    return arr
  })
  const [slots, setSlots] = useState<Record<string, string>>({})
  const [dragging, setDragging] = useState<{ word: string; from: 'bank' | string } | null>(null)
  const [checked, setChecked]   = useState(false)
  const [results, setResults]   = useState<Record<string, boolean>>({})

  const check = () => {
    const res: Record<string, boolean> = {}
    targets.forEach(tgt => { res[tgt.id] = (slots[tgt.id] ?? '') === tgt.correct })
    setResults(res); setChecked(true)
  }
  const reset = () => {
    setSlots({})
    setBank(() => { const arr = [...wordBank]; for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]] } return arr })
    setChecked(false); setResults({}); setDragging(null)
  }
  const dropOnSlot = (targetId: string) => {
    if (!dragging) return
    const word = dragging.word; const from = dragging.from
    setSlots(prev => {
      const next = { ...prev }
      const evicted = next[targetId]
      next[targetId] = word
      if (from !== 'bank') delete next[from]
      if (evicted) setBank(b => [...b, evicted])
      return next
    })
    if (from === 'bank') setBank(b => b.filter(w => w !== word))
    setDragging(null); setChecked(false); setResults({})
  }
  const dropOnBank = () => {
    if (!dragging || dragging.from === 'bank') return
    const { word, from } = dragging
    setSlots(prev => { const next = { ...prev }; delete next[from]; return next })
    setBank(b => [...b, word]); setDragging(null)
  }

  const allFilled  = targets.every(tgt => slots[tgt.id])
  const allCorrect = checked && targets.every(tgt => results[tgt.id])
  useEffect(() => { if (allCorrect) onComplete?.() }, [allCorrect, onComplete])

  return (
    <div className={TERMINAL}>
      <CodeWindowHeader icon="puzzle" label={t.dragDrop}
        trailing={s.text ? <span className="text-xs text-white/40 truncate max-w-xs">{s.text}</span> : undefined} />

      <div className="p-5 space-y-6">
        <p className="text-xs font-semibold text-white/40">{s.instructions ?? t.dragInstruction}</p>

        <div className="space-y-3">
          {targets.map(tgt => {
            const filled    = slots[tgt.id]
            const isCorrect = checked && results[tgt.id]
            const isWrong   = checked && !results[tgt.id] && !!filled
            return (
              <div key={tgt.id} onDragOver={e => e.preventDefault()} onDrop={() => dropOnSlot(tgt.id)} className="flex items-center gap-3">
                <div className="min-w-[120px] sm:min-w-[160px] text-right">
                  <code className="text-sm font-mono text-[#17D9C0]/80 whitespace-pre">{tgt.label}</code>
                </div>
                <Icon kind="chevronRight" className="w-4 h-4 text-white/25 flex-shrink-0" />
                <div className={cn(
                  'flex-1 min-h-[40px] rounded-2xl border-2 border-dashed flex items-center px-3 transition-all',
                  filled
                    ? isCorrect ? 'border-[#17D9C0]/50 bg-[#17D9C0]/10' : isWrong ? 'border-[#E15B71]/50 bg-[#E15B71]/10' : 'border-[#17D9C0]/50 bg-[#17D9C0]/10'
                    : dragging  ? 'border-[#17D9C0]/50 bg-[#17D9C0]/5 scale-[1.01]' : 'border-white/15 bg-white/3'
                )}>
                  {filled ? (
                    <div draggable onDragStart={() => setDragging({ word: filled, from: tgt.id })}
                      className={cn('px-3 py-1 rounded-lg text-sm font-bold cursor-grab active:cursor-grabbing select-none flex items-center gap-1.5',
                        isCorrect ? 'bg-[#17D9C0]/20 text-[#17D9C0]' : isWrong ? 'bg-[#E15B71]/20 text-[#E15B71]' : 'bg-[#17D9C0]/20 text-[#17D9C0]')}>
                      {filled}
                      {checked && <Icon kind={isCorrect ? 'check' : 'x'} className="w-3.5 h-3.5" />}
                    </div>
                  ) : (
                    <span className="text-xs text-white/25 font-semibold">Drop here</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div onDragOver={e => e.preventDefault()} onDrop={dropOnBank} className="min-h-[52px] rounded-2xl border border-white/8 bg-white/2 p-3">
          <p className="text-xs font-black text-white/30 uppercase tracking-wider mb-2">{t.wordBank}</p>
          <div className="flex flex-wrap gap-2">
            {bank.length === 0 && <span className="text-xs text-white/25 italic">All words placed — drag back to swap</span>}
            {bank.map((word, i) => (
              <div key={`${word}-${i}`} draggable onDragStart={() => setDragging({ word, from: 'bank' })}
                className="px-3 py-1.5 rounded-lg text-sm font-bold bg-[#17D9C0]/15 text-[#17D9C0] border border-[#17D9C0]/25 cursor-grab active:cursor-grabbing select-none hover:bg-[#17D9C0]/25 transition-all">
                {word}
              </div>
            ))}
          </div>
        </div>

        {allCorrect && (
          <div className="bg-[#17D9C0]/10 border border-[#17D9C0]/30 rounded-2xl p-4 text-center">
            <p className="text-sm font-extrabold text-[#17D9C0] flex items-center justify-center gap-1.5"><Icon kind="check" className="w-4 h-4" /> Perfect! Every word is in the right place.</p>
          </div>
        )}
        {checked && !allCorrect && (
          <div className="bg-[#E15B71]/8 border border-[#E15B71]/20 rounded-2xl p-3 text-center">
            <p className="text-sm font-bold text-[#E15B71]">{Object.values(results).filter(Boolean).length}/{targets.length} correct — drag and swap the wrong ones</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button onClick={reset} className="text-xs font-bold text-white/50 hover:text-white border border-white/10 rounded-lg px-3 py-1.5 transition-all hover:border-white/25">{t.resetWords}</button>
          <button onClick={check} disabled={!allFilled || allCorrect}
            className="px-5 py-2 rounded-xl text-xs font-extrabold bg-[#17D9C0]/20 text-[#17D9C0] border border-[#17D9C0]/30 hover:bg-[#17D9C0]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            {t.checkAnswer}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY: Submit Your Work
// ─────────────────────────────────────────────────────────────────────────────
function SubmitWorkActivity({ s, t, userId, lessonId, onComplete }: { s: Section; t: Record<string, string>; userId: string; lessonId: string; onComplete?: () => void }) {
  const subType = s.submission_type ?? 'both'
  const [urlVal, setUrlVal]     = useState('')
  const [videoVal, setVideoVal] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  useEffect(() => { if (submitted) onComplete?.() }, [submitted, onComplete])

  const validate = (val: string) => { try { new URL(val); return true } catch { return false } }

  const handleSubmit = async () => {
    const urlOk   = subType !== 'video' ? validate(urlVal)   : true
    const videoOk = subType !== 'url'   ? validate(videoVal) : true
    if (subType === 'url'   && !urlOk)            { setError(t.submitRequired); return }
    if (subType === 'video' && !videoOk)          { setError(t.submitRequired); return }
    if (subType === 'both'  && !urlOk && !videoOk){ setError(t.submitRequired); return }

    setError(''); setLoading(true)
    try {
      await fetch('/api/submissions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, lessonId, projectUrl: urlVal || null, videoUrl: videoVal || null }),
      })
      setSubmitted(true)
    } catch { setError('Could not save — check your connection and try again.') }
    finally { setLoading(false) }
  }

  if (submitted) return (
    <div className={cn(CARD, 'p-6 text-center')}>
      <div className="w-16 h-16 rounded-2xl bg-[#17D9C0]/15 flex items-center justify-center mx-auto mb-3">
        <Icon kind="partyPop" className="w-8 h-8" style={{ color: '#0F9B87' }} />
      </div>
      <h3 className="font-extrabold text-lg text-[#0F9B87] mb-2">{t.submitDone}</h3>
      <p className="text-sm text-[#4E7169] font-semibold">Your work has been saved to your portfolio.</p>
      <div className="flex items-center justify-center gap-4 mt-4">
        {urlVal && (
          <a href={urlVal} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F9B87] hover:text-[#0D2B32] transition-colors">
            <Icon kind="link" className="w-3.5 h-3.5" /> View project
          </a>
        )}
        {videoVal && (
          <a href={videoVal} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F9B87] hover:text-[#0D2B32] transition-colors">
            <Icon kind="video" className="w-3.5 h-3.5" /> Watch video
          </a>
        )}
      </div>
    </div>
  )

  return (
    <div className={cn(CARD, 'overflow-hidden')}>
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#0D2B32]/8 bg-[#EAF7F4]/40">
        <div className="w-10 h-10 rounded-xl bg-[#17D9C0]/15 flex items-center justify-center shrink-0">
          <Icon kind="upload" className="w-5 h-5" style={{ color: '#0F9B87' }} />
        </div>
        <div>
          <p className="font-extrabold text-sm text-[#0D2B32]">{t.submitWork}</p>
          {s.prompt && <p className="text-xs text-[#4E7169] font-semibold mt-0.5">{s.prompt}</p>}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {s.text && (
          <div className="bg-[#EAF7F4]/50 border border-[#0D2B32]/8 rounded-2xl p-4">
            <p className="text-sm font-semibold text-[#4E7169] leading-relaxed">{s.text}</p>
          </div>
        )}

        {(subType === 'url' || subType === 'both') && (
          <div>
            <label className="flex items-center gap-1.5 text-xs font-black text-[#4E7169] uppercase tracking-wider mb-2">
              <Icon kind="link" className="w-3.5 h-3.5" /> {t.submitUrl}
            </label>
            <input type="url" value={urlVal} onChange={e => { setUrlVal(e.target.value); setError('') }}
              placeholder={s.placeholder ?? t.submitPlaceholder}
              className="w-full bg-white border border-[#0D2B32]/15 rounded-2xl px-4 py-3 text-sm font-semibold text-[#0D2B32] placeholder:text-[#4E7169]/40 outline-none focus:border-[#17D9C0]/60 focus:bg-[#17D9C0]/5 transition-all" />
            {urlVal && !validate(urlVal) && (
              <p className="text-xs text-[#E15B71] font-semibold mt-1.5">That doesn&apos;t look like a valid URL — make sure it starts with https://</p>
            )}
          </div>
        )}

        {(subType === 'video' || subType === 'both') && (
          <div>
            <label className="flex items-center gap-1.5 text-xs font-black text-[#4E7169] uppercase tracking-wider mb-2">
              <Icon kind="video" className="w-3.5 h-3.5" /> {t.submitVideo}
            </label>
            <input type="url" value={videoVal} onChange={e => { setVideoVal(e.target.value); setError('') }}
              placeholder="https://loom.com/share/… or https://youtube.com/…"
              className="w-full bg-white border border-[#0D2B32]/15 rounded-2xl px-4 py-3 text-sm font-semibold text-[#0D2B32] placeholder:text-[#4E7169]/40 outline-none focus:border-[#17D9C0]/60 focus:bg-[#17D9C0]/5 transition-all" />
            {videoVal && !validate(videoVal) && (
              <p className="text-xs text-[#E15B71] font-semibold mt-1.5">That doesn&apos;t look like a valid URL — paste the full link</p>
            )}
            <div className="flex items-start gap-2 mt-2 px-3 py-2 bg-[#FFB930]/8 rounded-lg border border-[#FFB930]/15">
              <Icon kind="lightbulb" className="w-4 h-4 text-[#B8790E] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#4E7169] font-semibold leading-relaxed">
                No video yet? Record a 90-second screen demo on{' '}
                <a href="https://loom.com" target="_blank" rel="noopener noreferrer" className="text-[#0F9B87] hover:text-[#0D2B32] transition-colors">Loom.com</a>
                {' '}— free, no install, works in your browser.
              </p>
            </div>
          </div>
        )}

        {error && <p className="text-xs font-bold text-[#E15B71] bg-[#E15B71]/10 border border-[#E15B71]/20 rounded-lg px-3 py-2">{error}</p>}

        <button onClick={handleSubmit} disabled={loading}
          className={cn('w-full py-3.5 rounded-2xl font-extrabold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2', PRIMARY_BTN)}>
          {loading ? <><Icon kind="hourglass" className="w-4 h-4" /> Saving…</> : t.submitBtn}
        </button>

        <p className="text-xs text-center text-[#4E7169]/70 font-semibold">
          Your submission is saved to your Plulai portfolio and visible to your teacher.
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function LessonViewClient({
  userId, lesson, skill, completion, totalLessons, lessonIndex,
  prevLesson, nextLesson, nextSkill, language, userName, userAvatar = '🧑‍🚀',
  streak, finishedAllTracks, suggestedTracks,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [toast, setToast]         = useState<string | null>(null)
  const [levelUp, setLevelUp]     = useState<string | null>(null)
  const [shareCard, setShareCard] = useState<ShareCardProps | null>(null)
  const [quizState, setQuiz]      = useState<Record<number, { selected: number | null; submitted: boolean }>>({})
  const [checkState, setChecks]   = useState<Record<number, boolean[]>>({})
  const [copiedIdx, setCopied]    = useState<number | null>(null)
  const [justCompleted, setJustCompleted] = useState(false)
  const [showFeedback, setShowFeedback]   = useState(false)
  const [activityDone, setActivityDone]   = useState<Record<number, boolean>>({})
  const [currentStep, setCurrentStep]     = useState(0)
  const lessonStartRef = useRef<number>(Date.now())

  // `lang` is declared early (right after props are destructured) because it's
  // referenced below by `praiseBank` — `const` bindings aren't hoisted the way
  // functions are, so this must come before any usage further down the file.
  const lang  = language || 'en'

  // ── Game layer ─────────────────────────────────────────────────────────
  // Note: hearts/lives were removed — they weren't persisted anywhere (no DB
  // column, no API call), so they reset on every page load and never actually
  // gated anything. Combo, praise messages, and the shake-on-wrong animation
  // are pure client-side feedback too, but at least they're self-consistent
  // within a single attempt; hearts implied a "lives" mechanic that didn't exist.
  const [combo, setCombo]           = useState(0)
  const [xpBurst, setXpBurst]       = useState<{ id: number; amount: number } | null>(null)
  const [shaking, setShaking]       = useState(false)
  const [praiseMsg, setPraiseMsg]   = useState<string | null>(null)
  const [slideDir, setSlideDir]     = useState<'right' | 'left'>('right')
  const [animKey, setAnimKey]       = useState(0)   // changes to trigger re-mount of slide anim
  const burstId = useRef(0)

  const PRAISE_EN = ['Amazing!', 'You\'re on fire!', 'Perfect!', 'Nailed it!', 'Brilliant!', 'Keep going!', 'Superb!']
  const PRAISE_AR = ['رائع!', 'أنت في القمة!', 'ممتاز!', 'أحسنت!', 'رائع جداً!', 'واصل!', 'متميز!']
  const PRAISE_FR = ['Incroyable!', 'Tu es en feu!', 'Parfait!', 'Excellent!', 'Brillant!', 'Continue!', 'Superbe!']
  const praiseBank = lang === 'ar' ? PRAISE_AR : lang === 'fr' ? PRAISE_FR : PRAISE_EN

  const fireXpBurst = (amount: number) => {
    burstId.current += 1
    setXpBurst({ id: burstId.current, amount })
    setTimeout(() => setXpBurst(null), 1200)
  }

  const firePraise = () => {
    const msg = praiseBank[Math.floor(Math.random() * praiseBank.length)]
    setPraiseMsg(msg)
    setTimeout(() => setPraiseMsg(null), 1500)
  }

  const fireShake = () => {
    setShaking(true)
    setTimeout(() => setShaking(false), 500)
  }

  const onWrongAnswer = () => {
    setCombo(0)
    fireShake()
  }

  const gainCombo = () => {
    setCombo(c => c + 1)
    firePraise()
    fireXpBurst(10)
  }

  const advanceStep = () => {
    setSlideDir('right')
    setAnimKey(k => k + 1)
    setCurrentStep(i => Math.min(sections.length - 1, i + 1))
  }

  const goBack = () => {
    setSlideDir('left')
    setAnimKey(k => k + 1)
    setCurrentStep(i => Math.max(0, i - 1))
  }

  const t     = UI[lang] ?? UI.en
  const dir   = lang === 'ar' ? 'rtl' : 'ltr'
  const isDone = !!completion || justCompleted

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500) }

  let sections: Section[] = []
  try {
    const raw = typeof lesson.content_json === 'string' ? JSON.parse(lesson.content_json) : lesson.content_json
    sections = raw?.sections ?? []
  } catch { sections = [] }

  const selectOption = (secIdx: number, optIdx: number) => {
    if (quizState[secIdx]?.submitted) return
    setQuiz(prev => ({ ...prev, [secIdx]: { selected: optIdx, submitted: false } }))
  }

  const submitQuiz = (secIdx: number, correct: number) => {
    const selected = quizState[secIdx]?.selected ?? null
    const isRight  = selected === correct
    setQuiz(prev => ({ ...prev, [secIdx]: { ...prev[secIdx], submitted: true } }))
    if (isRight) {
      gainCombo()
      markActivityDone(secIdx)
    } else {
      onWrongAnswer()
      // Brief delay then reset so the user can retry
      setTimeout(() => {
        setQuiz(p => ({ ...p, [secIdx]: { selected: null, submitted: false } }))
      }, 1200)
    }
  }

  const toggleCheck = (secIdx: number, itemIdx: number, total: number) => {
    setChecks(prev => {
      const arr  = prev[secIdx] ?? Array(total).fill(false)
      const next = [...arr]; next[itemIdx] = !next[itemIdx]
      return { ...prev, [secIdx]: next }
    })
  }

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code).then(() => { setCopied(idx); setTimeout(() => setCopied(null), 2000) })
  }

  const markActivityDone = (idx: number) => {
    if (activityDone[idx]) return
    setActivityDone(prev => ({ ...prev, [idx]: true }))
    gainCombo()
  }

  const ACTIVITY_LABELS: Record<string, string> = {
    quiz: t.quiz, checklist: t.checklist, speed_quiz: t.speedQuiz, fill_blank: t.fillBlank,
    drag_drop: t.dragDrop, unscramble: t.unscramble, debug: t.debug,
    timed_challenge: t.timedChallenge, remix: t.remix, submit_work: t.submitWork,
  }

  const isActivityDone = (s: Section, i: number): boolean => {
    switch (s.type) {
      case 'quiz': { const state = quizState[i]; return !!(state?.submitted && state.selected === s.correct) }
      case 'checklist': { const arr = checkState[i] ?? []; return (s.checks ?? []).every((_, ci) => arr[ci] === true) }
      default: return !!activityDone[i]
    }
  }

  const interactiveSections = sections.map((s, i) => ({ s, i })).filter(({ s }) => s.type in ACTIVITY_LABELS)
  const pendingActivities   = interactiveSections.filter(({ s, i }) => !isActivityDone(s, i))
  const allActivitiesDone   = pendingActivities.length === 0
  const canComplete         = allActivitiesDone

  const markComplete = () => {
  if (isDone) return
  startTransition(async () => {
    const score = 100
    const elapsedMins = Math.max(1, Math.round((Date.now() - lessonStartRef.current) / 60000))
    await completeLesson(userId, lesson.id, score, elapsedMins)
    await updateStreak(userId)
    const result = await addXP(userId, lesson.xp_reward, 'lesson_complete', lesson.id)
    const pct = Math.min(100, Math.round((lessonIndex / totalLessons) * 100))
    await updateSkillProgress(userId, skill.id, pct)
    if (!nextLesson && pct >= 100) await addXP(userId, skill.xp_reward, 'skill_complete', skill.id)
    await checkAndAwardBadges(userId)

    fetch('/api/coins/xp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ xpEarned: lesson.xp_reward }),
    }).catch(() => {})

    setJustCompleted(true); setShowFeedback(true)
    showToast(`+${lesson.xp_reward} ${t.xpEarned}`)
    if (result.data && result.data.leveledUp) {
      const rd = result.data as any
      setLevelUp(`${t.levelUp} Level ${rd.newLevel}!`)
      setTimeout(() => setLevelUp(null), 4000)
      setTimeout(() => setShareCard({ type: 'level', childName: userName, childAvatar: userAvatar, newLevel: rd.newLevel, levelTitle: rd.levelTitle ?? '', totalXP: rd.totalXP ?? undefined }), 1200)
    }
    if (!nextLesson && pct >= 100) {
      setTimeout(() => setShareCard({ type: 'skill', childName: userName, childAvatar: userAvatar, skillName: skill.title, skillEmoji: skill.emoji, trackName: skill.track_id, xpEarned: (lesson.xp_reward ?? 0) + (skill.xp_reward ?? 0) }), levelUp ? 5000 : 800)
    }
    router.refresh()
  })
}

  const getVideoEmbed = (url: string): string | null => {
    const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/)
    if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`
    const vm = url.match(/vimeo\.com\/(\d+)/)
    if (vm) return `https://player.vimeo.com/video/${vm[1]}?byline=0&portrait=0`
    if (url.includes('/embed/') || url.includes('player.')) return url
    return null
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER SECTION
  // ─────────────────────────────────────────────────────────────────────────
  const renderSection = (s: Section, idx: number) => {
    switch (s.type) {

      case 'intro':
      case 'reading':
        return (
          <div key={idx} className={cn(CARD, 'p-4 sm:p-6')}>
            <SectionEyebrow icon="book" label={t.reading} color="bg-[#17D9C0]/15 text-[#0F9B87]" />
            <p className="text-sm font-semibold leading-relaxed whitespace-pre-line text-[#0D2B32]">{s.text}</p>
          </div>
        )

      case 'analogy':
        return (
          <div key={idx} className={cn(CARD, 'p-4 sm:p-6')}>
            <div className="flex items-center gap-2 mb-2">
              <Icon kind="lightbulb" className="w-4 h-4" style={{ color: '#0F9B87' }} />
              <p className="font-extrabold text-sm text-[#4E7169]">{t.analogy}</p>
            </div>
            <p className="text-sm font-semibold leading-relaxed text-[#0D2B32]">{s.text}</p>
          </div>
        )

      case 'tip':
        return (
          <div key={idx} className={cn(CARD, 'p-4 sm:p-5 flex gap-3')}>
            <span className="w-9 h-9 rounded-xl bg-[#FFB930]/15 flex items-center justify-center flex-shrink-0">
              <Icon kind="lightbulb" className="w-5 h-5 text-[#B8790E]" />
            </span>
            <div>
              <p className="font-extrabold text-xs text-[#B8790E] mb-1 uppercase tracking-wider">{t.tip}</p>
              <p className="text-sm font-semibold leading-relaxed whitespace-pre-line text-[#0D2B32]">{s.text}</p>
            </div>
          </div>
        )

      case 'code':
        return (
          <div key={idx} className={TERMINAL}>
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-white/8 bg-white/2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <span className="text-xs font-bold text-white/50 flex-1 truncate flex items-center gap-1.5">
                <Icon kind="code" className="w-3.5 h-3.5" /> {t.code} — {s.language ?? 'code'}
              </span>
            </div>
            {s.instructions && <p className="px-4 sm:px-5 pt-4 text-xs text-white/50 font-semibold italic">{s.instructions}</p>}
            <pre className="px-4 sm:px-5 py-4 text-sm font-mono text-[#17D9C0] leading-relaxed overflow-x-auto whitespace-pre-wrap break-all max-w-full">{s.starter}</pre>
            <div className="px-4 sm:px-5 pb-4">
              <Link href={`/dashboard/coach?topic=${encodeURIComponent(lesson.title)}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#17D9C0] hover:text-white transition-colors">
                <Icon kind="robot" className="w-3.5 h-3.5" /> {lang === 'ar' ? 'اسأل المدرب' : lang === 'fr' ? "Demander au Coach" : 'Ask AI Coach to explain'}
              </Link>
            </div>
          </div>
        )

      case 'code_editor':
        return (
          <div key={idx} className={cn(TERMINAL, 'max-w-full')}>
            <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 border-b border-white/8 bg-white/2">
              <div className="flex gap-1.5 flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <span className="text-xs font-bold text-white/50 flex-1 truncate flex items-center gap-1.5">
                <Icon kind="code" className="w-3.5 h-3.5" /> {t.codeViewer}
              </span>
              <button onClick={() => copyCode(s.starter ?? '', idx)}
                aria-label={copiedIdx === idx ? t.copied : t.copyCode}
                className={cn('flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all flex-shrink-0',
                  copiedIdx === idx ? 'bg-[#17D9C0]/20 text-[#17D9C0] border border-[#17D9C0]/30' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/8')}>
                <Icon kind={copiedIdx === idx ? 'check' : 'copy'} className="w-3 h-3" /> {copiedIdx === idx ? t.copied : t.copyCode}
              </button>
            </div>
            {s.instructions && (
              <div className="px-4 sm:px-5 py-3 bg-white/2 border-b border-white/8">
                <p className="text-xs text-white/50 font-semibold leading-relaxed">{s.instructions}</p>
              </div>
            )}
            <div className="flex overflow-x-auto">
              <div className="select-none px-3 sm:px-4 py-5 text-right border-r border-white/5 bg-white/1 flex-shrink-0">
                {(s.starter ?? '').split('\n').map((_, i) => (
                  <div key={i} className="text-xs font-mono text-white/15 leading-6">{i + 1}</div>
                ))}
              </div>
              <pre className="flex-1 px-4 sm:px-5 py-5 text-sm font-mono text-[#17D9C0]/90 leading-6 whitespace-pre-wrap break-all min-w-0 max-w-full overflow-x-auto">{s.starter}</pre>
            </div>
            {s.hint && (
              <div className="px-4 sm:px-5 py-3 border-t border-white/5 bg-[#FFB930]/5 flex items-start gap-2">
                <Icon kind="lightbulb" className="w-4 h-4 text-[#FFB930]/90 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[#FFB930]/90 font-semibold">{s.hint}</p>
              </div>
            )}
            <div className="px-4 sm:px-5 py-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-white/20 font-mono">Python 3.10</span>
              <Link href={`/dashboard/coach?topic=${encodeURIComponent(lesson.title)}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#17D9C0] hover:text-white transition-colors">
                <Icon kind="robot" className="w-3.5 h-3.5" /> {lang === 'ar' ? 'اسأل المدرب' : lang === 'fr' ? 'Demander au Coach' : 'Ask AI Coach'}
              </Link>
            </div>
          </div>
        )

      case 'quiz': {
        const state     = quizState[idx] ?? { selected: null, submitted: false }
        const isCorrect = state.submitted && state.selected === s.correct
        const isWrong   = state.submitted && state.selected !== s.correct
        return (
          <div key={idx} className={cn(CARD, 'p-4 sm:p-6')}>
            <div className="flex items-center gap-2 mb-4">
              <span className={cn('w-8 h-8 rounded-xl flex items-center justify-center', isCorrect ? 'bg-[#17D9C0]/20 text-[#0F9B87]' : isWrong ? 'bg-[#E15B71]/15 text-[#E15B71]' : 'bg-[#17D9C0]/15 text-[#0F9B87]')}>
                <Icon kind={isCorrect ? 'check' : isWrong ? 'x' : 'quiz'} className="w-4 h-4" />
              </span>
              <span className="text-xs font-black text-[#4E7169] uppercase tracking-wider">{t.quiz}</span>
            </div>
            <p className="font-extrabold text-sm mb-4 sm:mb-5 leading-relaxed text-[#0D2B32]">{s.question}</p>
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5">
              {(s.options ?? []).map((opt, oi) => {
                let cls = 'border-[#0D2B32]/10 bg-[#EAF7F4]/40 text-[#4E7169] hover:border-[#0D2B32]/25 hover:text-[#0D2B32] cursor-pointer'
                if (state.submitted) {
                  if (oi === s.correct) cls = 'border-[#17D9C0]/60 bg-[#17D9C0]/15 text-[#0F9B87] cursor-default'
                  else if (state.selected === oi) cls = 'border-[#E15B71]/40 bg-[#E15B71]/10 text-[#E15B71] cursor-default'
                  else cls = 'border-[#0D2B32]/5 bg-[#0D2B32]/3 text-[#4E7169]/50 cursor-default'
                } else if (state.selected === oi) cls = 'border-[#17D9C0]/50 bg-[#17D9C0]/15 text-[#0D2B32] cursor-pointer'
                return (
                  <button key={oi} onClick={() => selectOption(idx, oi)} disabled={state.submitted}
                    className={cn('w-full text-start px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl text-sm font-bold border transition-all', cls)}>
                    <span className="font-extrabold mr-2 sm:mr-3 text-[#4E7169]/60">{String.fromCharCode(65 + oi)}.</span>{opt}
                  </button>
                )
              })}
            </div>
            {!state.submitted ? (
              <button onClick={() => submitQuiz(idx, s.correct!)} disabled={state.selected === null}
                className={cn('w-full sm:w-auto px-6 py-2.5 rounded-2xl font-extrabold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all', PRIMARY_BTN)}>
                {t.submit}
              </button>
            ) : isWrong ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#E15B71]/10 border border-[#E15B71]/20">
                <Icon kind="x" className="w-5 h-5 text-[#E15B71] flex-shrink-0" />
                <p className="text-xs font-extrabold text-[#E15B71]">{t.wrong}</p>
              </div>
            ) : isCorrect ? (
              <div className="space-y-2">
                <p className="text-sm font-extrabold text-[#0F9B87] flex items-center gap-1.5"><Icon kind="check" className="w-4 h-4" /> {t.correct}</p>
                {s.explanation && (
                  <div className="mt-3 bg-[#EAF7F4]/60 border border-[#0D2B32]/8 rounded-2xl p-3 sm:p-4">
                    <p className="text-xs font-bold text-[#4E7169] mb-1">{lang === 'ar' ? 'الشرح' : lang === 'fr' ? 'Explication' : 'Explanation'}</p>
                    <p className="text-sm text-[#4E7169] font-semibold leading-relaxed">{s.explanation}</p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )
      }

      case 'steps':
        return (
          <div key={idx} className={cn(CARD, 'p-4 sm:p-6')}>
            <SectionEyebrow icon="ladder" label={t.steps} color="bg-[#17D9C0]/15 text-[#0F9B87]" />
            {s.text && <p className="text-sm font-semibold text-[#4E7169] mb-4 leading-relaxed">{s.text}</p>}
            <ol className="space-y-3">
              {(s.items ?? []).map((item, i) => (
                <li key={i} className="flex gap-3 sm:gap-4 items-start">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#17D9C0] flex items-center justify-center text-xs font-extrabold text-white">{i + 1}</span>
                  <p className="text-sm font-semibold leading-relaxed pt-0.5 text-[#0D2B32]">{item}</p>
                </li>
              ))}
            </ol>
          </div>
        )

      case 'challenge':
        return (
          <div key={idx} className={cn(CARD, 'p-4 sm:p-6')}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-xl bg-[#17D9C0]/15 flex items-center justify-center">
                <Icon kind="target" className="w-4 h-4" style={{ color: '#0F9B87' }} />
              </span>
              <span className="text-xs font-black text-[#4E7169] uppercase tracking-wider">{t.challenge}</span>
            </div>
            {s.title && <p className="font-extrabold text-base mb-2 text-[#0D2B32]">{s.title}</p>}
            <p className="text-sm font-semibold leading-relaxed mb-4 text-[#0D2B32]">{s.text}</p>
            {s.expected_output && (
              <div className="bg-[#0D2B32] border border-white/10 rounded-2xl p-3 sm:p-4 mb-4">
                <p className="text-xs font-bold text-white/50 mb-2">{lang === 'ar' ? 'النتيجة المتوقعة:' : lang === 'fr' ? 'Résultat attendu :' : 'Expected output:'}</p>
                <pre className="text-sm font-mono text-[#17D9C0] whitespace-pre-wrap overflow-x-auto break-all max-w-full">{s.expected_output}</pre>
              </div>
            )}
            {s.hint && (
              <details className="mt-2">
                <summary className="text-xs font-bold text-[#0F9B87] cursor-pointer hover:text-[#0D2B32] transition-colors select-none">
                  {lang === 'ar' ? 'تلميح' : lang === 'fr' ? 'Indice' : 'Hint'}
                </summary>
                <p className="text-sm text-[#4E7169] font-semibold mt-2 leading-relaxed pl-4 border-l-2 border-[#17D9C0]/30">{s.hint}</p>
              </details>
            )}
            <div className="mt-4">
              <Link href={`/dashboard/coach?topic=${encodeURIComponent(s.title ?? lesson.title)}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold bg-[#17D9C0]/15 text-[#0F9B87] border border-[#17D9C0]/25 hover:bg-[#17D9C0]/25 transition-all">
                <Icon kind="robot" className="w-3.5 h-3.5" /> {lang === 'ar' ? 'اطلب مساعدة المدرب' : lang === 'fr' ? "Aide du Coach IA" : 'Get help from AI Coach'}
              </Link>
            </div>
          </div>
        )

      case 'callout': {
        const variant = s.variant ?? 'note'
        const styles: Record<string, { icon: IconKind; text: string; chipBg: string; label: string }> = {
          note:    { icon: 'note',    text: 'text-[#0F9B87]',  chipBg: 'bg-[#17D9C0]/15',  label: t.callout_note },
          warning: { icon: 'warning', text: 'text-[#B8790E]',  chipBg: 'bg-[#FFB930]/15',  label: t.callout_warning },
          danger:  { icon: 'danger',  text: 'text-[#E15B71]',  chipBg: 'bg-[#E15B71]/15',  label: t.callout_danger },
          success: { icon: 'success', text: 'text-[#0F9B87]',  chipBg: 'bg-[#17D9C0]/15',  label: 'Good to know' },
        }
        const st = styles[variant] ?? styles.note
        return (
          <div key={idx} className={cn(CARD, 'p-4 sm:p-5 flex gap-3 sm:gap-4')}>
            <span className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', st.chipBg)}>
              <Icon kind={st.icon} className={cn('w-5 h-5', st.text)} />
            </span>
            <div>
              <p className={cn('font-extrabold text-xs mb-1.5 uppercase tracking-wider', st.text)}>{st.label}</p>
              <p className="text-sm font-semibold leading-relaxed whitespace-pre-line text-[#0D2B32]">{s.text}</p>
            </div>
          </div>
        )
      }

      case 'comparison':
        return (
          <div key={idx} className={cn(CARD, 'overflow-hidden')}>
            <div className="px-4 sm:px-5 py-3 border-b border-[#0D2B32]/8 flex items-center gap-2">
              <Icon kind="compare" className="w-4 h-4 text-[#4E7169]" />
              <span className="text-xs font-black text-[#4E7169] uppercase tracking-wider">{t.comparison}</span>
            </div>
            {s.text && <p className="px-4 sm:px-5 pt-4 text-sm font-semibold text-[#4E7169] leading-relaxed">{s.text}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="p-4 sm:p-5 border-b sm:border-b-0 sm:border-r border-[#0D2B32]/8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full bg-[#E15B71]/20 border border-[#E15B71]/40 flex items-center justify-center"><Icon kind="x" className="w-3 h-3 text-[#E15B71]" /></span>
                  <span className="text-xs font-extrabold text-[#E15B71] uppercase">{s.before_label ?? (lang === 'ar' ? 'قبل' : lang === 'fr' ? 'Avant' : 'Before')}</span>
                </div>
                <pre className="text-xs font-mono text-[#E15B71]/90 bg-[#E15B71]/5 border border-[#E15B71]/15 rounded-2xl p-3 sm:p-4 whitespace-pre-wrap break-all leading-relaxed overflow-x-auto max-w-full">{s.before}</pre>
              </div>
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full bg-[#17D9C0]/20 border border-[#17D9C0]/40 flex items-center justify-center"><Icon kind="check" className="w-3 h-3" style={{ color: '#0F9B87' }} /></span>
                  <span className="text-xs font-extrabold text-[#0F9B87] uppercase">{s.after_label ?? (lang === 'ar' ? 'بعد' : lang === 'fr' ? 'Après' : 'After')}</span>
                </div>
                <pre className="text-xs font-mono text-[#0F9B87] bg-[#17D9C0]/5 border border-[#17D9C0]/15 rounded-2xl p-3 sm:p-4 whitespace-pre-wrap break-all leading-relaxed overflow-x-auto max-w-full">{s.after}</pre>
              </div>
            </div>
          </div>
        )

      case 'checklist': {
        const checks  = s.checks ?? []
        const states  = checkState[idx] ?? Array(checks.length).fill(false)
        const allDone = checks.every((_, i) => states[i])
        return (
          <div key={idx} className={cn(CARD, 'p-4 sm:p-6')}>
            <SectionEyebrow icon="checklist" label={t.checklist} color={allDone ? 'bg-[#17D9C0]/15 text-[#0F9B87]' : 'bg-[#0D2B32]/6 text-[#4E7169]'} />
            {s.text && <p className="text-sm font-semibold text-[#4E7169] mb-4 leading-relaxed">{s.text}</p>}
            <div className="space-y-2 sm:space-y-3">
              {checks.map((item, i) => (
                <button key={i} onClick={() => toggleCheck(idx, i, checks.length)}
                  className={cn('w-full flex items-center gap-3 px-3 sm:px-4 py-3 rounded-2xl border text-sm font-semibold text-start transition-all',
                    states[i] ? 'bg-[#17D9C0]/10 border-[#17D9C0]/30 text-[#0F9B87]' : 'bg-[#EAF7F4]/40 border-[#0D2B32]/8 text-[#4E7169] hover:border-[#0D2B32]/20 hover:text-[#0D2B32]')}>
                  <span className={cn('w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-all', states[i] ? 'bg-[#17D9C0] border-[#17D9C0] text-white' : 'border-[#0D2B32]/20')}>
                    {states[i] && <Icon kind="check" className="w-3 h-3" />}
                  </span>
                  <span className={cn(states[i] && 'line-through opacity-70')}>{item}</span>
                </button>
              ))}
            </div>
            {allDone && (
              <p className="text-xs font-extrabold text-[#0F9B87] mt-4 flex items-center gap-1.5">
                <Icon kind="partyPop" className="w-3.5 h-3.5" /> {lang === 'ar' ? 'أحسنت! اكتملت جميع العناصر' : lang === 'fr' ? 'Bravo ! Tout est coché !' : 'All done!'}
              </p>
            )}
          </div>
        )
      }

      case 'video': {
        const embedUrl = s.url ? getVideoEmbed(s.url) : null
        return (
          <div key={idx} className={cn(CARD, 'overflow-hidden')}>
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-[#0D2B32]/8">
              <Icon kind="play" className="w-4 h-4 text-[#4E7169]" />
              <span className="text-xs font-black text-[#4E7169] uppercase tracking-wider">{t.video}</span>
              {s.caption && <span className="text-xs text-[#4E7169]/70 font-semibold ml-auto truncate max-w-[50%] sm:max-w-[60%]">{s.caption}</span>}
            </div>
            {embedUrl ? (
              <div className="relative bg-black" style={{ paddingBottom: '56.25%' }}>
                <iframe src={embedUrl} className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen title={s.caption ?? 'Lesson video'} loading="lazy" />
              </div>
            ) : (
              <div className="p-6 sm:p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#17D9C0]/15 flex items-center justify-center mx-auto mb-4">
                  <Icon kind="play" className="w-8 h-8" style={{ color: '#0F9B87' }} />
                </div>
                <a href={s.url} target="_blank" rel="noopener noreferrer"
                  className={cn('inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-2xl font-extrabold text-sm transition-all', PRIMARY_BTN)}>
                  <Icon kind="play" className="w-4 h-4" /> {lang === 'ar' ? 'مشاهدة الفيديو' : lang === 'fr' ? 'Voir la vidéo' : 'Watch Video'}
                </a>
              </div>
            )}
          </div>
        )
      }

      case 'website': {
        const iframeSrc   = s.embed_url ?? s.url ?? ''
        const frameHeight = s.height ?? 500
        return (
          <div key={idx} className={cn(CARD, 'overflow-hidden')}>
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-[#0D2B32]/8 bg-[#EAF7F4]/50">
              <Icon kind="link" className="w-4 h-4 text-[#4E7169] flex-shrink-0" />
              <span className="text-xs font-black text-[#4E7169] uppercase tracking-wider flex-1 truncate">{t.website}</span>
              {(s.url ?? s.embed_url) && (
                <a href={s.url ?? s.embed_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-bold text-[#0F9B87] hover:text-[#0D2B32] transition-colors flex-shrink-0 ml-2">
                  <Icon kind="external" className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{t.openSite}</span>
                </a>
              )}
            </div>
            {s.caption && <div className="px-4 sm:px-5 py-2 border-b border-[#0D2B32]/6 bg-[#EAF7F4]/30"><p className="text-xs font-semibold text-[#4E7169]">{s.caption}</p></div>}
            <div className="px-3 sm:px-4 py-2 bg-[#EAF7F4]/40 border-b border-[#0D2B32]/6 flex items-center gap-2">
              <div className="flex gap-1.5 flex-shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-[#0D2B32]/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#0D2B32]/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#0D2B32]/10" />
              </div>
              <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs font-mono text-[#4E7169]/70 truncate border border-[#0D2B32]/6">{iframeSrc}</div>
            </div>
            {iframeSrc ? (
              <iframe src={iframeSrc} style={{ height: frameHeight }} className="w-full max-w-full border-0 block"
                title={s.caption ?? 'Interactive resource'} sandbox="allow-scripts allow-same-origin allow-forms allow-popups" loading="lazy" />
            ) : (
              <div className="flex items-center justify-center text-[#4E7169] text-sm font-semibold" style={{ height: frameHeight }}>No URL provided</div>
            )}
            {s.text && <div className="px-4 sm:px-5 py-4 border-t border-[#0D2B32]/6"><p className="text-xs font-semibold text-[#4E7169] leading-relaxed">{s.text}</p></div>}
          </div>
        )
      }

      case 'image':
        return (
          <div key={idx} className={cn(CARD, 'overflow-hidden')}>
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-[#0D2B32]/8">
              <Icon kind="image" className="w-4 h-4 text-[#4E7169]" />
              <span className="text-xs font-black text-[#4E7169] uppercase tracking-wider">{t.image}</span>
            </div>
            <div className="p-3 sm:p-4">
              {s.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.src} alt={s.alt ?? 'Lesson diagram'} className="w-full rounded-2xl border border-[#0D2B32]/8 object-contain max-h-64 sm:max-h-96" />
              ) : (
                <div className="h-32 sm:h-40 bg-[#EAF7F4]/50 rounded-2xl flex items-center justify-center text-[#4E7169] text-sm font-semibold gap-2">
                  <Icon kind="image" className="w-5 h-5" /> Image placeholder
                </div>
              )}
            </div>
            {(s.alt || s.text) && <p className="px-4 sm:px-5 pb-4 text-xs text-[#4E7169] font-semibold">{s.alt ?? s.text}</p>}
          </div>
        )

      case 'external': {
        const btnLabel = s.button_label ?? `Open on ${s.platform ?? 'external platform'}`
        return (
          <div key={idx} className={cn(CARD, 'overflow-hidden')}>
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-[#0D2B32]/8 bg-[#EAF7F4]/40">
              <Icon kind="external" className="w-4 h-4 text-[#0F9B87] flex-shrink-0" />
              <span className="text-xs font-black text-[#4E7169] uppercase tracking-wider">{t.external}</span>
              {s.platform && <span className="ml-auto text-xs font-bold text-[#4E7169] bg-white border border-[#0D2B32]/10 px-2 sm:px-2.5 py-0.5 rounded-full truncate max-w-[40%]">{s.platform}</span>}
            </div>
            <div className="p-4 sm:p-6">
              {s.title && <h3 className="font-extrabold text-base mb-2 text-[#0D2B32]">{s.title}</h3>}
              {s.text && <p className="text-sm font-semibold text-[#4E7169] leading-relaxed mb-4 sm:mb-5">{s.text}</p>}
              <a href={s.url} target="_blank" rel="noopener noreferrer"
                className={cn('group inline-flex items-center gap-3 px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl font-extrabold text-sm w-full justify-center transition-all', PRIMARY_BTN)}>
                <Icon kind="external" className="w-5 h-5" />
                <span className="truncate">{btnLabel}</span>
                <Icon kind="chevronRight" className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </a>
              <p className="text-center text-xs text-[#4E7169] font-semibold mt-4">{t.externalDone}</p>
            </div>
            <div className="px-4 sm:px-5 py-3 border-t border-[#0D2B32]/6 bg-[#EAF7F4]/30">
              <p className="text-xs text-[#4E7169]/80 font-semibold">{t.externalDesc}</p>
            </div>
          </div>
        )
      }

      case 'speed_quiz':       return <div key={idx}><SpeedQuizActivity s={s} t={t} onComplete={() => markActivityDone(idx)} /></div>
      case 'fill_blank':       return <div key={idx}><FillBlankActivity s={s} t={t} onComplete={() => markActivityDone(idx)} /></div>
      case 'drag_drop':        return <div key={idx}><DragDropActivity s={s} t={t} onComplete={() => markActivityDone(idx)} /></div>
      case 'unscramble':       return <div key={idx}><UnscrambleActivity s={s} t={t} onComplete={() => markActivityDone(idx)} /></div>
      case 'debug':            return <div key={idx}><DebugActivity s={s} t={t} onComplete={() => markActivityDone(idx)} /></div>
      case 'timed_challenge':  return <div key={idx}><TimedChallengeActivity s={s} t={t} lessonTitle={lesson.title} onComplete={() => markActivityDone(idx)} /></div>
      case 'remix':            return <div key={idx}><RemixActivity s={s} t={t} lessonTitle={lesson.title} onComplete={() => markActivityDone(idx)} /></div>
      case 'submit_work':      return <div key={idx}><SubmitWorkActivity s={s} t={t} userId={userId} lessonId={lesson.id} onComplete={() => markActivityDone(idx)} /></div>

      default: return null
    }
  }

  const coachUrl      = `/dashboard/coach?topic=${encodeURIComponent(skill?.title ?? '')}&lesson=${encodeURIComponent(lesson.title)}`
  const blockingItems = pendingActivities.map(({ s }) => ACTIVITY_LABELS[s.type])

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-3xl w-full overflow-x-hidden" dir={dir}>
      {/* ── Keyframe animations injected once ── */}
      <style>{`
        @keyframes slideInRight { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
        @keyframes slideInLeft  { from { opacity:0; transform:translateX(-40px); } to { opacity:1; transform:translateX(0); } }
        @keyframes xpFloat      { 0% { opacity:1; transform:translateY(0) scale(1); } 80% { opacity:1; } 100% { opacity:0; transform:translateY(-56px) scale(1.2); } }
        @keyframes praiseIn     { 0% { opacity:0; transform:translate(-50%,-50%) scale(0.7); } 20% { opacity:1; transform:translate(-50%,-50%) scale(1.05); } 80% { opacity:1; transform:translate(-50%,-50%) scale(1); } 100% { opacity:0; transform:translate(-50%,-50%) scale(0.9); } }
        @keyframes shake        { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-8px)} 30%{transform:translateX(8px)} 45%{transform:translateX(-6px)} 60%{transform:translateX(6px)} 75%{transform:translateX(-3px)} 90%{transform:translateX(3px)} }
        @keyframes heartPop     { 0%{transform:scale(1)} 40%{transform:scale(1.4)} 100%{transform:scale(1)} }
        @keyframes comboPop     { 0%{transform:scale(1)} 50%{transform:scale(1.25)} 100%{transform:scale(1)} }
        @keyframes continuePulse{ 0%,100%{box-shadow:0 4px 0 rgba(13,43,50,0.18),0 0 0 0 rgba(23,217,192,0.5)} 50%{box-shadow:0 4px 0 rgba(13,43,50,0.18),0 0 0 10px rgba(23,217,192,0)} }
        .slide-right { animation: slideInRight 0.28s cubic-bezier(0.22,1,0.36,1) both; }
        .slide-left  { animation: slideInLeft  0.28s cubic-bezier(0.22,1,0.36,1) both; }
        .card-shake  { animation: shake 0.5s ease-in-out; }
      `}</style>

      {/* ── Toast ── */}
      <div className={cn(
        'fixed top-4 left-4 right-4 md:left-auto md:right-6 md:top-6 md:w-auto z-50 px-5 py-3 rounded-2xl bg-white border border-[#0D2B32]/10 text-[#0F9B87] font-bold text-sm shadow-xl transition-all duration-300 flex items-center gap-2',
        toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
      )}>
        <Icon kind="sparkle" className="w-4 h-4 shrink-0" />
        {toast}
      </div>

      {/* ── Praise overlay — appears center-screen on correct answer ── */}
      {praiseMsg && (
        <div
          className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center"
          aria-hidden
        >
          <div
            className="font-extrabold text-3xl md:text-4xl text-[#0F9B87] drop-shadow-lg px-6 py-3 rounded-3xl bg-[#17D9C0]/10 border border-[#17D9C0]/30 backdrop-blur-sm"
            style={{ animation: 'praiseIn 1.5s ease forwards' }}
          >
            {praiseMsg}
          </div>
        </div>
      )}

      {/* ── Level-up overlay ── */}
      {levelUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D2B32]/60 backdrop-blur-sm px-4" onClick={() => setLevelUp(null)}>
          <div className="bg-white border border-[#0D2B32]/10 rounded-3xl p-8 sm:p-10 text-center shadow-2xl w-full max-w-sm">
            <div className="w-20 h-20 rounded-full bg-[#17D9C0]/15 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Icon kind="partyPop" className="w-10 h-10" style={{ color: '#0F9B87' }} />
            </div>
            <h2 className="font-extrabold text-3xl sm:text-4xl text-[#0F9B87] mb-2">{levelUp}</h2>
            <p className="text-[#4E7169] font-bold text-sm">{lang === 'ar' ? 'استمر، أنت لا يُوقف!' : lang === 'fr' ? 'Continue — inarrêtable !' : 'Keep going — unstoppable!'}</p>
          </div>
        </div>
      )}

      {/* ── GAME HUD: back | step dots | combo ── */}
      <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-6">
        <Link href={`/dashboard/path/${skill?.id}`}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-[#0D2B32]/10 hover:border-[#0D2B32]/25 transition-colors shrink-0">
          <Icon kind="chevronLeft" className="w-5 h-5 text-[#4E7169]" />
        </Link>

        {sections.length > 0 && !isDone && (
          <div className="flex-1 flex items-center gap-1">
            {sections.map((_, i) => (
              <div key={i} className={cn(
                'h-2 flex-1 rounded-full transition-all duration-400',
                i < currentStep ? 'bg-[#17D9C0]' : i === currentStep ? 'bg-[#0F9B87]' : 'bg-[#0D2B32]/10'
              )} />
            ))}
          </div>
        )}

        {combo >= 2 && !isDone && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFB930]/15 border border-[#FFB930]/30 shrink-0" style={{ animation: 'comboPop 0.3s ease' }}>
            <Icon kind="fire" className="w-3.5 h-3.5 text-[#B8790E]" />
            <span className="text-xs font-extrabold text-[#B8790E]">{combo}x</span>
          </div>
        )}
      </div>

      {/* ── Lesson title — compact ── */}
      <div className="flex items-center gap-3 mb-5 sm:mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-[0_3px_0_rgba(13,43,50,0.18)]" style={{ backgroundColor: '#FF6B57' }}>
          {lesson.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-extrabold text-lg sm:text-xl leading-tight text-[#0D2B32]">{lesson.title}</h1>
          <span className="text-xs font-bold text-[#4E7169]">{t.lesson} {lessonIndex}/{totalLessons} · +{lesson.xp_reward} XP</span>
        </div>
        {/* Floating XP burst */}
        <div className="relative shrink-0 w-10 h-10">
          {xpBurst && (
            <span key={xpBurst.id} className="absolute bottom-0 left-1/2 -translate-x-1/2 font-extrabold text-sm text-[#0F9B87] pointer-events-none whitespace-nowrap" style={{ animation: 'xpFloat 1.2s ease-out forwards' }}>
              +{xpBurst.amount} XP
            </span>
          )}
        </div>
      </div>

      {/* ── AI Coach — slim strip ── */}
      <Link href={coachUrl} className={cn(CARD, 'flex items-center gap-3 px-4 py-3 mb-5 sm:mb-6 hover:border-[#0D2B32]/20 transition-colors group')}>
        <span className="w-8 h-8 rounded-xl bg-[#17D9C0]/15 flex items-center justify-center shrink-0">
          <Icon kind="robot" className="w-4 h-4" style={{ color: '#0F9B87' }} />
        </span>
        <span className="flex-1 text-xs font-bold text-[#4E7169] group-hover:text-[#0D2B32] transition-colors">
          {lang === 'ar' ? 'لديك سؤال؟ اسأل مدربك الذكي' : lang === 'fr' ? 'Une question ? Demande au Coach IA' : 'Confused? Ask your AI Coach'}
        </span>
        <Icon kind="chevronRight" className="w-3.5 h-3.5 text-[#4E7169]/60 shrink-0" />
      </Link>

      {/* ── ONE SECTION AT A TIME (in progress) — or full scroll for review ── */}
      {sections.length > 0 ? (
        isDone ? (
          <div className="space-y-4 sm:space-y-5 mb-8 sm:mb-10">
            {sections.map((s, i) => renderSection(s, i))}
          </div>
        ) : (
        <>
          <div className={cn('mb-6 sm:mb-8', shaking && 'card-shake')} key={animKey} style={{ animation: `${slideDir === 'right' ? 'slideInRight' : 'slideInLeft'} 0.28s cubic-bezier(0.22,1,0.36,1) both` }}>
            {renderSection(sections[currentStep], currentStep)}
          </div>

          {(() => {

            const s = sections[currentStep]
            const isInteractive = s.type in ACTIVITY_LABELS
            const stepReady = !isInteractive || isActivityDone(s, currentStep)
            const isLastStep = currentStep === sections.length - 1

            if (isLastStep) {
              // Final step's own continue is replaced by the Mark Complete
              // card below, so nothing renders here — avoids a redundant
              // "Continue" right above "Mark Complete".
              return null
            }

            return (
              <div className="flex items-center justify-between gap-3 mb-8 sm:mb-10">
                <button
                  onClick={() => setCurrentStep(i => Math.max(0, i - 1))}
                  disabled={currentStep === 0}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-sm text-[#4E7169] hover:text-[#0D2B32] disabled:opacity-0 disabled:pointer-events-none transition-all"
                >
                  <Icon kind="chevronLeft" className="w-4 h-4" />
                  {lang === 'ar' ? 'السابق' : lang === 'fr' ? 'Précédent' : 'Back'}
                </button>
                <button
                  onClick={() => setCurrentStep(i => Math.min(sections.length - 1, i + 1))}
                  disabled={!stepReady}
                  className={cn(
                    'flex items-center gap-2 px-8 py-3 rounded-2xl font-extrabold text-sm transition-all',
                    stepReady ? PRIMARY_BTN : 'bg-[#0D2B32]/8 text-[#4E7169]/50 cursor-not-allowed'
                  )}
                >
                  {lang === 'ar' ? 'متابعة' : lang === 'fr' ? 'Continuer' : 'Continue'}
                  <Icon kind="chevronRight" className="w-4 h-4" />
                </button>
              </div>
            )
          })()}
        </>
        )
      ) : (
        <div className={cn(CARD, 'p-8 text-center mb-8')}><p className="text-[#4E7169] font-semibold text-sm">Content loading...</p></div>
      )}
      {!isDone && currentStep === Math.max(0, sections.length - 1) && (
        <div className={cn(CARD, 'p-5 sm:p-6 mb-5 sm:mb-6 text-center')}>
          {blockingItems.length > 0 && (
            <>
              <p className="text-xs font-bold text-[#4E7169]/80 mb-2 uppercase tracking-wider">
                {lang === 'ar' ? 'أكمل هذه الأنشطة أولاً' : lang === 'fr' ? "Termine d'abord ces activités" : 'Finish these activities first'}
              </p>
              <ul className="mb-4 space-y-1">
                {blockingItems.map((item, i) => (
                  <li key={i} className="text-xs text-[#4E7169] font-semibold flex items-center justify-center gap-2">
                    <Icon kind="chevronRight" className="w-3 h-3" style={{ color: '#0F9B87' }} /> {item}
                  </li>
                ))}
              </ul>
            </>
          )}
          <button onClick={markComplete} disabled={isPending || !canComplete}
            className={cn('w-full sm:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-sm transition-all flex items-center justify-center gap-2',
              isPending ? 'opacity-50 cursor-not-allowed bg-[#0D2B32]/8 text-[#4E7169]' :
              !canComplete ? 'bg-[#0D2B32]/8 text-[#4E7169]/70 cursor-not-allowed border border-[#0D2B32]/5' :
              SUCCESS_BTN)}>
            {isPending ? <><Icon kind="hourglass" className="w-4 h-4" /> Saving...</> : <><Icon kind="check" className="w-4 h-4" /> {t.complete}</>}
          </button>
        </div>
      )}

      {isDone && (
        <LessonCompletionPanel
          userId={userId}
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          lessonEmoji={lesson.emoji}
          xpEarned={lesson.xp_reward}
          streak={streak}
          skillId={skill.id}
          skillTitle={skill.title}
          nextLesson={nextLesson ?? null}
          nextSkill={nextSkill ?? null}
          lang={lang as 'en' | 'ar' | 'fr'}
          finishedAllTracks={finishedAllTracks}
          suggestedTracks={suggestedTracks}
        />
      )}

      {/* Prev / Next nav */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-5 sm:pt-6 border-t border-[#0D2B32]/8">
        {prevLesson ? (
          <Link href={`/dashboard/path/${skill?.id}/lesson/${prevLesson.id}`}
            className="flex items-center justify-center sm:justify-start gap-2 px-4 sm:px-5 py-3 rounded-2xl font-extrabold text-sm border-2 border-[#0D2B32]/10 text-[#4E7169] hover:text-[#0D2B32] hover:border-[#0D2B32]/25 transition-all truncate">
            <Icon kind="chevronLeft" className="w-4 h-4 flex-shrink-0" /> <span className="truncate">{prevLesson.emoji} {prevLesson.title}</span>
          </Link>
        ) : (
          <Link href={`/dashboard/path/${skill?.id}`} className="text-sm font-bold text-[#4E7169] hover:text-[#0D2B32] transition-colors text-center sm:text-left flex items-center gap-1.5">
            <Icon kind="chevronLeft" className="w-4 h-4" /> {t.back}
          </Link>
        )}
        {nextLesson ? (
          <Link href={`/dashboard/path/${skill?.id}/lesson/${nextLesson.id}`}
            className={cn('flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-2xl font-extrabold text-sm truncate transition-all', PRIMARY_BTN)}>
            <span className="truncate">{nextLesson.emoji} {nextLesson.title}</span> <Icon kind="chevronRight" className="w-4 h-4 flex-shrink-0" />
          </Link>
        ) : nextSkill ? (
          <Link href={`/dashboard/path/${nextSkill.id}/lesson/${nextSkill.lessonId}`}
            className={cn('flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-2xl font-extrabold text-sm truncate transition-all', PRIMARY_BTN)}>
            <span className="truncate">{nextSkill.emoji} {nextSkill.title}</span> <Icon kind="chevronRight" className="w-4 h-4 flex-shrink-0" />
          </Link>
        ) : (
          <Link href={`/dashboard/path/${skill?.id}`}
            className={cn('flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-2xl font-extrabold text-sm transition-all', SUCCESS_BTN)}>
            <Icon kind="partyPop" className="w-4 h-4" /> {t.finish}
          </Link>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0D2B32]/60 backdrop-blur-sm p-3 sm:p-4" onClick={() => setShowFeedback(false)}>
          <div className="bg-white border border-[#0D2B32]/10 rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl animate-slide-up" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <LessonFeedback userId={userId} lessonId={lesson.id} lang={lang as 'en'|'ar'|'fr'} onDone={() => setShowFeedback(false)} onSkip={() => setShowFeedback(false)} />
          </div>
        </div>
      )}

      {shareCard && <ShareCardModal props={shareCard} onClose={() => setShareCard(null)} />}
    </div>
  )
}