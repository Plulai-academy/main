'use client';

import { useEffect, useState } from 'react';
import { Modal, FormField } from './Modal';
import { PrimaryButton, GhostButton } from './ui';
import { getLessonsForTrack, getSkillNodesForTrack, createAssignment } from '@/lib/school-admin/queries';
import styled from 'styled-components';

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.coral};
  font-size: 13px;
  margin: -8px 0 16px;
`;

const HintText = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.inkFaint};
  margin: -12px 0 16px;
`;

interface CreateAssignmentModalProps {
  classId: string;
  trackId: string | null;
  assignedBy: string; // school_staff.id
  onClose: () => void;
  onCreated: () => void;
}

type SourceType = 'lesson' | 'skill_node' | 'custom';

export function CreateAssignmentModal({ classId, trackId, assignedBy, onClose, onCreated }: CreateAssignmentModalProps) {
  const [sourceType, setSourceType] = useState<SourceType>(trackId ? 'lesson' : 'custom');
  const [lessons, setLessons] = useState<{ id: string; title: string; emoji: string }[]>([]);
  const [skillNodes, setSkillNodes] = useState<{ id: string; title: string; emoji: string }[]>([]);
  const [lessonId, setLessonId] = useState('');
  const [skillNodeId, setSkillNodeId] = useState('');
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!trackId) return;
    getLessonsForTrack(trackId).then(setLessons).catch(console.error);
    getSkillNodesForTrack(trackId).then(setSkillNodes).catch(console.error);
  }, [trackId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (sourceType === 'lesson' && !lessonId) return setError('Pick a lesson.');
    if (sourceType === 'skill_node' && !skillNodeId) return setError('Pick a skill.');
    if (sourceType === 'custom' && !title.trim()) return setError('Give this assignment a title.');

    setSubmitting(true);
    try {
      await createAssignment({
        classId,
        assignedBy,
        sourceType,
        lessonId: sourceType === 'lesson' ? lessonId : null,
        skillNodeId: sourceType === 'skill_node' ? skillNodeId : null,
        title: sourceType === 'custom' ? title.trim() : null,
        instructions: instructions.trim() || null,
        dueDate: dueDate || null,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError('Could not create that assignment. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="New assignment" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <FormField>
          Assignment type
          <select value={sourceType} onChange={(e) => setSourceType(e.target.value as SourceType)}>
            <option value="lesson">Lesson from curriculum</option>
            <option value="skill_node">Skill from curriculum</option>
            <option value="custom">Custom assignment</option>
          </select>
        </FormField>

        {!trackId && sourceType !== 'custom' && (
          <HintText>This class has no track set — assign a track to it first, or pick &quot;Custom assignment.&quot;</HintText>
        )}

        {sourceType === 'lesson' && trackId && (
          <FormField>
            Lesson
            <select value={lessonId} onChange={(e) => setLessonId(e.target.value)}>
              <option value="">Select a lesson…</option>
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.emoji} {l.title}
                </option>
              ))}
            </select>
          </FormField>
        )}

        {sourceType === 'skill_node' && trackId && (
          <FormField>
            Skill
            <select value={skillNodeId} onChange={(e) => setSkillNodeId(e.target.value)}>
              <option value="">Select a skill…</option>
              {skillNodes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.emoji} {s.title}
                </option>
              ))}
            </select>
          </FormField>
        )}

        {sourceType === 'custom' && (
          <FormField>
            Title
            <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Build a portfolio site" />
          </FormField>
        )}

        <FormField>
          Instructions <span style={{ fontWeight: 400 }}>(optional)</span>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={3}
            style={{
              fontFamily: 'inherit',
              fontSize: 14,
              padding: '10px 12px',
              borderRadius: 8,
              resize: 'vertical',
            }}
          />
        </FormField>

        <FormField>
          Due date <span style={{ fontWeight: 400 }}>(optional)</span>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </FormField>

        {error && <ErrorText>{error}</ErrorText>}
        <Actions>
          <GhostButton type="button" onClick={onClose}>
            Cancel
          </GhostButton>
          <PrimaryButton type="submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create assignment'}
          </PrimaryButton>
        </Actions>
      </form>
    </Modal>
  );
}