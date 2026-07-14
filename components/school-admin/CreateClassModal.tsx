'use client';

import { useState } from 'react';
import { Modal, FormField } from './Modal';
import { PrimaryButton, GhostButton } from './ui';
import { createClass } from '@/lib/school-admin/queries';
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

interface TeacherOption {
  id: string;
  displayName: string;
}
interface TrackOption {
  id: string;
  name: string;
}

interface CreateClassModalProps {
  schoolId: string;
  teachers: TeacherOption[];
  tracks: TrackOption[];
  onClose: () => void;
  onCreated: () => void;
}

export function CreateClassModal({ schoolId, teachers, tracks, onClose, onCreated }: CreateClassModalProps) {
  const [name, setName] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [trackId, setTrackId] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createClass({
        schoolId,
        name,
        teacherId: teacherId || null,
        trackId: trackId || null,
        academicYear: academicYear || null,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError('Could not create that class. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Create a class" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <FormField>
          Class name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Grade 6 — Section A"
          />
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
          <GhostButton type="button" onClick={onClose}>
            Cancel
          </GhostButton>
          <PrimaryButton type="submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create class'}
          </PrimaryButton>
        </Actions>
      </form>
    </Modal>
  );
}
