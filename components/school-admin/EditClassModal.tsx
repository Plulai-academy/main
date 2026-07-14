'use client';

import { useState } from 'react';
import { Modal, FormField } from './Modal';
import { PrimaryButton, GhostButton } from './ui';
import { updateClass, setClassActive } from '@/lib/school-admin/queries';
import type { SchoolClass } from '@/types/schoolAdmin';
import styled from 'styled-components';

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
`;

const RightActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.coral};
  font-size: 13px;
  margin: -8px 0 16px;
`;

interface TeacherOption {
  id: string;
  displayName: string;
}
interface TrackOption {
  id: string;
  name: string;
}

interface EditClassModalProps {
  cls: SchoolClass;
  teachers: TeacherOption[];
  tracks: TrackOption[];
  onClose: () => void;
  onSaved: () => void;
}

export function EditClassModal({ cls, teachers, tracks, onClose, onSaved }: EditClassModalProps) {
  const [name, setName] = useState(cls.name);
  const [teacherId, setTeacherId] = useState(cls.teacherId ?? '');
  const [trackId, setTrackId] = useState(cls.trackId ?? '');
  const [academicYear, setAcademicYear] = useState(cls.academicYear ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await updateClass({
        classId: cls.id,
        name,
        teacherId: teacherId || null,
        trackId: trackId || null,
        academicYear: academicYear || null,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError('Could not save those changes. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDisable() {
    if (!confirm('Disable this class? Enrollment history is kept, but it will be hidden from the roster.')) return;
    setSubmitting(true);
    try {
      await setClassActive(cls.id, false);
      onSaved();
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Edit class" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <FormField>
          Class name
          <input required value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField>
          Teacher
          <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
            <option value="">Unassigned</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.displayName}
              </option>
            ))}
          </select>
        </FormField>
        <FormField>
          Track
          <select value={trackId} onChange={(e) => setTrackId(e.target.value)}>
            <option value="">No track</option>
            {tracks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField>
          Academic year
          <input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} placeholder="2026–2027" />
        </FormField>
        {error && <ErrorText>{error}</ErrorText>}
        <Actions>
          <GhostButton type="button" onClick={handleDisable} disabled={submitting}>
            Disable class
          </GhostButton>
          <RightActions>
            <GhostButton type="button" onClick={onClose}>
              Cancel
            </GhostButton>
            <PrimaryButton type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save changes'}
            </PrimaryButton>
          </RightActions>
        </Actions>
      </form>
    </Modal>
  );
}