'use client';

import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { Badge } from './ui';
import { getLessonPreview } from '@/lib/school-admin/queries';
import styled from 'styled-components';

const Loading = styled.p`
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 14px;
`;

const SectionCard = styled.div`
  background: ${({ theme }) => theme.colors.ledger};
  border: 1px solid ${({ theme }) => theme.colors.ledgerLine};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 16px 18px;
  margin-bottom: 12px;
`;

const SectionType = styled.div`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.inkFaint};
  margin-bottom: 8px;
`;

const SectionText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.ink};
  line-height: 1.6;
  white-space: pre-wrap;
  margin: 0;
`;

const CodeBlock = styled.pre`
  background: ${({ theme }) => theme.colors.depth};
  color: #17D9C0;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radius.sm};
  font-size: 12px;
  font-family: ${({ theme }) => theme.font.mono};
  overflow-x: auto;
  white-space: pre-wrap;
  margin: 8px 0 0;
`;

const QuizOption = styled.div<{ $correct: boolean }>`
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 13px;
  margin-top: 4px;
  background: ${({ $correct }) => ($correct ? 'rgba(23,217,192,0.15)' : 'transparent')};
  color: ${({ theme, $correct }) => ($correct ? theme.colors.reef : theme.colors.inkMuted)};
  font-weight: ${({ $correct }) => ($correct ? 700 : 400)};
`;

interface LessonPreviewModalProps {
  lessonId: string;
  onClose: () => void;
}

export function LessonPreviewModal({ lessonId, onClose }: LessonPreviewModalProps) {
  const [lesson, setLesson] = useState<{ title: string; emoji: string; description: string; content_json: any } | null>(null);

  useEffect(() => {
    getLessonPreview(lessonId).then(setLesson).catch(console.error);
  }, [lessonId]);

  if (!lesson) {
    return (
      <Modal title="Loading…" onClose={onClose}>
        <Loading>Fetching lesson content…</Loading>
      </Modal>
    );
  }

  let sections: any[] = [];
  try {
    const raw = typeof lesson.content_json === 'string' ? JSON.parse(lesson.content_json) : lesson.content_json;
    sections = raw?.sections ?? [];
  } catch {
    sections = [];
  }

  return (
    <Modal title={`${lesson.emoji} ${lesson.title}`} onClose={onClose}>
      {lesson.description && <SectionText style={{ marginBottom: 16 }}>{lesson.description}</SectionText>}

      {sections.length === 0 ? (
        <Loading>No content sections found for this lesson.</Loading>
      ) : (
        sections.map((s: any, i: number) => (
          <SectionCard key={i}>
            <SectionType>{s.type?.replace('_', ' ')}</SectionType>

            {s.title && <SectionText style={{ fontWeight: 700, marginBottom: 6 }}>{s.title}</SectionText>}
            {s.text && <SectionText>{s.text}</SectionText>}
            {s.question && (
              <>
                <SectionText style={{ fontWeight: 600 }}>{s.question}</SectionText>
                {(s.options ?? []).map((opt: string, oi: number) => (
                  <QuizOption key={oi} $correct={oi === s.correct}>
                    {String.fromCharCode(65 + oi)}. {opt} {oi === s.correct ? '✓' : ''}
                  </QuizOption>
                ))}
                {s.explanation && <SectionText style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>{s.explanation}</SectionText>}
              </>
            )}
            {(s.starter || s.code || s.broken_code) && (
              <CodeBlock>{s.starter ?? s.code ?? s.broken_code}</CodeBlock>
            )}
            {s.items && (
              <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
                {s.items.map((item: string, ii: number) => (
                  <li key={ii} style={{ fontSize: 14, marginBottom: 4 }}>{item}</li>
                ))}
              </ul>
            )}
            {s.checks && (
              <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
                {s.checks.map((c: string, ci: number) => (
                  <li key={ci} style={{ fontSize: 14, marginBottom: 4 }}>{c}</li>
                ))}
              </ul>
            )}
            {s.url && <SectionText style={{ fontSize: 13, opacity: 0.7, marginTop: 6 }}>Link: {s.url}</SectionText>}
          </SectionCard>
        ))
      )}
    </Modal>
  );
}