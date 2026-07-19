'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLessonPreview } from '@/lib/school-admin/queries';

interface Section {
  type: string;
  [key: string]: any;
}

export default function TeacherLessonPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<{ title: string; emoji: string; description: string; content_json: any } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLessonPreview(lessonId)
      .then(setLesson)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [lessonId]);

  let sections: Section[] = [];
  if (lesson) {
    try {
      const raw = typeof lesson.content_json === 'string' ? JSON.parse(lesson.content_json) : lesson.content_json;
      sections = raw?.sections ?? [];
    } catch {
      sections = [];
    }
  }

  return (
    <div className="min-h-screen bg-[#EAF6F1] rounded-3xl -m-8 p-6 sm:p-10">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#4E7169] hover:text-[#16323A] transition-colors mb-6"
        >
          ← Back to curriculum
        </button>

        {loading ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-[0_2px_16px_rgba(22,50,58,0.06)]">
            <p className="text-[#7C9995] font-semibold">Loading lesson…</p>
          </div>
        ) : !lesson ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-[0_2px_16px_rgba(22,50,58,0.06)]">
            <p className="text-[#7C9995] font-semibold">Couldn&apos;t load this lesson.</p>          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-8">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                style={{ backgroundColor: '#FF6E52', boxShadow: '0 4px 0 rgba(13,43,50,0.18)' }}
              >
                {lesson.emoji}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-[#16323A] leading-tight">{lesson.title}</h1>
                {lesson.description && (
                  <p className="text-sm text-[#7C9995] font-medium mt-1">{lesson.description}</p>
                )}
              </div>
            </div>

            <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFB930]/12 border border-[#FFB930]/25">
              <span className="text-xs font-bold text-[#B8790E]">👁 Teacher preview — read-only, no progress saved</span>
            </div>

            {sections.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center shadow-[0_2px_16px_rgba(22,50,58,0.06)] mt-4">
                <p className="text-[#7C9995] font-semibold">No content sections in this lesson yet.</p>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                {sections.map((s, i) => (
                  <SectionPreview key={i} section={s} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const CARD = 'bg-white rounded-3xl p-5 sm:p-6 shadow-[0_2px_16px_rgba(22,50,58,0.06)]';
const TERMINAL = 'bg-[#0D2B32] rounded-3xl overflow-hidden';

function Eyebrow({ label }: { label: string }) {
  return (
    <p className="text-xs font-black text-[#4E7169] uppercase tracking-wider mb-3">{label}</p>
  );
}

function SectionPreview({ section: s }: { section: Section }) {
  switch (s.type) {
    case 'intro':
    case 'reading':
      return (
        <div className={CARD}>
          <Eyebrow label="Reading" />
          <p className="text-sm font-semibold leading-relaxed text-[#16323A] whitespace-pre-line">{s.text}</p>
        </div>
      );

    case 'analogy':
      return (
        <div className={CARD}>
          <Eyebrow label="Think of it this way" />
          <p className="text-sm font-semibold leading-relaxed text-[#16323A]">{s.text}</p>
        </div>
      );

    case 'tip':
      return (
        <div className={`${CARD} flex gap-3`}>
          <span className="w-9 h-9 rounded-xl bg-[#FFB930]/15 flex items-center justify-center shrink-0 text-lg">💡</span>
          <div>
            <p className="font-extrabold text-xs text-[#B8790E] mb-1 uppercase tracking-wider">Pro tip</p>
            <p className="text-sm font-semibold leading-relaxed text-[#16323A] whitespace-pre-line">{s.text}</p>
          </div>
        </div>
      );

    case 'code':
    case 'code_editor':
      return (
        <div className={TERMINAL}>
          <div className="flex items-center gap-3 px-5 py-3 border-b border-white/8">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <span className="text-xs font-bold text-white/50">{s.language ?? 'Code'}</span>
          </div>
          {s.instructions && <p className="px-5 pt-4 text-xs text-white/50 font-semibold italic">{s.instructions}</p>}
          <pre className="px-5 py-4 text-sm font-mono text-[#17D9C0] leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
            {s.starter ?? s.code}
          </pre>
        </div>
      );

    case 'quiz':
      return (
        <div className={CARD}>
          <Eyebrow label="Quiz" />
          <p className="font-extrabold text-sm mb-4 text-[#16323A]">{s.question}</p>
          <div className="space-y-2">
            {(s.options ?? []).map((opt: string, oi: number) => (
              <div
                key={oi}
                className={`px-4 py-3 rounded-xl text-sm font-bold ${
                  oi === s.correct
                    ? 'bg-[#17D9C0]/15 border border-[#17D9C0]/40 text-[#0F9B87]'
                    : 'bg-[#F7FAF9] border border-[#E3EEEB] text-[#7C9995]'
                }`}
              >
                <span className="font-extrabold mr-2 opacity-60">{String.fromCharCode(65 + oi)}.</span>
                {opt} {oi === s.correct && '✓'}
              </div>
            ))}
          </div>
          {s.explanation && (
            <div className="mt-4 bg-[#EAF6F1] rounded-2xl p-4">
              <p className="text-xs font-bold text-[#7C9995] mb-1">Explanation</p>
              <p className="text-sm text-[#5B7B78] font-medium leading-relaxed">{s.explanation}</p>
            </div>
          )}
        </div>
      );

    case 'steps':
      return (
        <div className={CARD}>
          <Eyebrow label="Step-by-step" />
          {s.text && <p className="text-sm font-semibold text-[#5B7B78] mb-4 leading-relaxed">{s.text}</p>}
          <ol className="space-y-3">
            {(s.items ?? []).map((item: string, i: number) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="shrink-0 w-7 h-7 rounded-full bg-[#17D9C0] flex items-center justify-center text-xs font-extrabold text-white">
                  {i + 1}
                </span>
                <p className="text-sm font-semibold leading-relaxed pt-0.5 text-[#16323A]">{item}</p>
              </li>
            ))}
          </ol>
        </div>
      );

    case 'challenge':
      return (
        <div className={CARD}>
          <Eyebrow label="Challenge" />
          {s.title && <p className="font-extrabold text-base mb-2 text-[#16323A]">{s.title}</p>}
          <p className="text-sm font-semibold leading-relaxed mb-3 text-[#16323A]">{s.text ?? s.task}</p>
          {s.expected_output && (
            <div className="bg-[#0D2B32] rounded-2xl p-4">
              <p className="text-xs font-bold text-white/50 mb-2">Expected output:</p>
              <pre className="text-sm font-mono text-[#17D9C0] whitespace-pre-wrap">{s.expected_output}</pre>
            </div>
          )}
          {s.hint && (
            <p className="text-sm text-[#7C9995] font-semibold mt-3 pl-4 border-l-2 border-[#17D9C0]/30">
              Hint: {s.hint}
            </p>
          )}
        </div>
      );

    case 'callout': {
      const variant = s.variant ?? 'note';
      const colors: Record<string, string> = {
        note: 'text-[#0F9B87] bg-[#17D9C0]/15',
        warning: 'text-[#B8790E] bg-[#FFB930]/15',
        danger: 'text-[#E15B71] bg-[#E15B71]/15',
        success: 'text-[#0F9B87] bg-[#17D9C0]/15',
      };
      return (
        <div className={`${CARD} flex gap-3`}>
          <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colors[variant] ?? colors.note}`}>
            ⚠
          </span>
          <p className="text-sm font-semibold leading-relaxed text-[#16323A] whitespace-pre-line">{s.text}</p>
        </div>
      );
    }

    case 'comparison':
      return (
        <div className={CARD}>
          <Eyebrow label="Before vs after" />
          {s.text && <p className="text-sm font-semibold text-[#5B7B78] mb-4">{s.text}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-extrabold text-[#E15B71] uppercase mb-2">{s.before_label ?? 'Before'}</p>
              <pre className="text-xs font-mono text-[#E15B71] bg-[#E15B71]/5 rounded-2xl p-3 whitespace-pre-wrap overflow-x-auto">{s.before}</pre>
            </div>
            <div>
              <p className="text-xs font-extrabold text-[#0F9B87] uppercase mb-2">{s.after_label ?? 'After'}</p>
              <pre className="text-xs font-mono text-[#0F9B87] bg-[#17D9C0]/5 rounded-2xl p-3 whitespace-pre-wrap overflow-x-auto">{s.after}</pre>
            </div>
          </div>
        </div>
      );

    case 'checklist':
      return (
        <div className={CARD}>
          <Eyebrow label="Checklist" />
          {s.text && <p className="text-sm font-semibold text-[#5B7B78] mb-4">{s.text}</p>}
          <ul className="space-y-2">
            {(s.checks ?? []).map((c: string, i: number) => (
              <li key={i} className="flex items-center gap-3 text-sm font-semibold text-[#16323A]">
                <span className="w-5 h-5 rounded border-2 border-[#0D2B32]/15 shrink-0" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      );

    case 'video':
      return (
        <div className={CARD}>
          <Eyebrow label="Video" />
          {s.caption && <p className="text-sm font-semibold text-[#5B7B78] mb-3">{s.caption}</p>}
          {s.url && (
            <a href={s.url} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#0F9B87] underline break-all">
              {s.url}
            </a>
          )}
        </div>
      );

    case 'website':
    case 'external':
      return (
        <div className={CARD}>
          <Eyebrow label={s.type === 'external' ? 'External activity' : 'Interactive resource'} />
          {s.title && <p className="font-extrabold text-base mb-2 text-[#16323A]">{s.title}</p>}
          {s.text && <p className="text-sm font-semibold text-[#5B7B78] mb-3">{s.text}</p>}
          {(s.url ?? s.embed_url) && (
            <a href={s.url ?? s.embed_url} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#0F9B87] underline break-all">
              {s.url ?? s.embed_url}
            </a>
          )}
        </div>
      );

    case 'image':
      return (
        <div className={CARD}>
          <Eyebrow label="Diagram" />
          {s.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.src} alt={s.alt ?? 'Lesson diagram'} className="w-full rounded-2xl max-h-96 object-contain" />
          ) : (
            <p className="text-sm text-[#7C9995] font-semibold">No image URL set.</p>
          )}
          {s.alt && <p className="text-xs text-[#7C9995] font-semibold mt-2">{s.alt}</p>}
        </div>
      );

    default:
      // Covers interactive activity types (speed_quiz, fill_blank, drag_drop,
      // unscramble, debug, timed_challenge, remix, submit_work) — these have
      // custom game mechanics we don't replicate in read-only preview, so we
      // just surface whatever raw content fields exist to keep the material
      // visible rather than hiding it entirely.
      return (
        <div className={CARD}>
          <Eyebrow label={s.type?.replace(/_/g, ' ') ?? 'Activity'} />
          {s.title && <p className="font-extrabold text-base mb-2 text-[#16323A]">{s.title}</p>}
          {(s.text || s.instructions || s.task) && (
            <p className="text-sm font-semibold text-[#16323A] leading-relaxed mb-3">{s.text ?? s.instructions ?? s.task}</p>
          )}
          {s.questions && (
            <div className="space-y-3">
              {s.questions.map((q: any, qi: number) => (
                <div key={qi} className="bg-[#F7FAF9] rounded-2xl p-3">
                  <p className="text-sm font-bold text-[#16323A]">{q.question}</p>
                  <p className="text-xs text-[#7C9995] mt-1">Correct: {q.options?.[q.correct]}</p>
                </div>
              ))}
            </div>
          )}
          {(s.code || s.broken_code) && (
            <pre className="bg-[#0D2B32] text-[#17D9C0] rounded-2xl p-4 text-sm font-mono mt-3 overflow-x-auto whitespace-pre-wrap">
              {s.code ?? s.broken_code}
            </pre>
          )}
          <p className="text-xs text-[#9BB5B1] font-semibold mt-3 italic">
            Interactive activity — students complete this hands-on in the full lesson.
          </p>
        </div>
      );
  }
}