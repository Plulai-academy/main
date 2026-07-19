'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { PageHeader } from '@/components/school-admin/PageHeader';
import { Panel, EmptyState } from '@/components/school-admin/ui';
import { getTracksForBrowse, getSkillNodesForBrowse, getLessonsForBrowse } from '@/lib/school-admin/queries';

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.inkMuted};
  margin-bottom: 20px;
  flex-wrap: wrap;

  button {
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.reef};
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    padding: 0;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled(Panel)`
  padding: 18px 20px;
  cursor: pointer;
  transition: border-color 0.15s ease, transform 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.reef};
    transform: translateY(-1px);
  }
`;

const CardTitle = styled.div`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.ink};
  margin-bottom: 4px;
`;

const CardMeta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.inkMuted};
`;

interface TrackItem { id: string; name: string; emoji: string; description: string }
interface SkillItem { id: string; title: string; emoji: string; description: string }
interface LessonItem { id: string; title: string; emoji: string; lesson_type: string; xp_reward: number; duration_mins: number }

export default function TeacherLessonsPage() {
  const router = useRouter();
  const [tracks, setTracks] = useState<TrackItem[] | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<TrackItem | null>(null);
  const [skills, setSkills] = useState<SkillItem[] | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);
  const [lessons, setLessons] = useState<LessonItem[] | null>(null);

  useEffect(() => {
    getTracksForBrowse().then(setTracks).catch(console.error);
  }, []);

  function openTrack(t: TrackItem) {
    setSelectedTrack(t);
    setSelectedSkill(null);
    setLessons(null);
    getSkillNodesForBrowse(t.id).then(setSkills).catch(console.error);
  }

  function openSkill(s: SkillItem) {
    setSelectedSkill(s);
    getLessonsForBrowse(s.id).then(setLessons).catch(console.error);
  }

  function openLesson(lessonId: string) {
    if (!selectedSkill) return;
    router.push(`/teacher/lessons/${selectedSkill.id}/${lessonId}`);
  }

  if (selectedSkill) {
    return (
      <>
        <PageHeader title={selectedSkill.title} subtitle="Lessons in this skill." />
        <Breadcrumb>
          <button onClick={() => { setSelectedTrack(null); setSelectedSkill(null); }}>Curriculum</button>
          <span>/</span>
          <button onClick={() => setSelectedSkill(null)}>{selectedTrack?.name}</button>
          <span>/</span>
          <span>{selectedSkill.title}</span>
        </Breadcrumb>
        {lessons && lessons.length === 0 ? (
          <Panel><EmptyState><strong>No lessons here</strong></EmptyState></Panel>
        ) : (
          <Grid>
            {(lessons ?? []).map((l) => (
              <Card key={l.id} onClick={() => openLesson(l.id)}>
                <CardTitle>{l.emoji} {l.title}</CardTitle>
                <CardMeta>{l.lesson_type} · {l.duration_mins}m · {l.xp_reward} XP</CardMeta>
              </Card>
            ))}
          </Grid>
        )}
      </>
    );
  }

  if (selectedTrack) {
    return (
      <>
        <PageHeader title={selectedTrack.name} subtitle="Skills in this track." />
        <Breadcrumb>
          <button onClick={() => setSelectedTrack(null)}>Curriculum</button>
          <span>/</span>
          <span>{selectedTrack.name}</span>
        </Breadcrumb>
        {skills && skills.length === 0 ? (
          <Panel><EmptyState><strong>No skills here</strong></EmptyState></Panel>
        ) : (
          <Grid>
            {(skills ?? []).map((s) => (
              <Card key={s.id} onClick={() => openSkill(s)}>
                <CardTitle>{s.emoji} {s.title}</CardTitle>
                <CardMeta>{s.description}</CardMeta>
              </Card>
            ))}
          </Grid>
        )}
      </>
    );
  }

  return (
    <>
      <PageHeader title="Curriculum" subtitle="Browse tracks and preview any lesson before you teach it." />
      {tracks && tracks.length === 0 ? (
        <Panel><EmptyState><strong>No tracks available</strong></EmptyState></Panel>
      ) : (
        <Grid>
          {(tracks ?? []).map((t) => (
            <Card key={t.id} onClick={() => openTrack(t)}>
              <CardTitle>{t.emoji} {t.name}</CardTitle>
              <CardMeta>{t.description}</CardMeta>
            </Card>
          ))}
        </Grid>
      )}
    </>
  );
}