'use client';

import { useState } from 'react';
import { Modal, FormField } from './Modal';
import { PrimaryButton, GhostButton } from './ui';
import { inviteStaffMember } from '@/lib/school-admin/queries';
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

interface InviteStaffModalProps {
  schoolId: string;
  invitedBy: string;
  onClose: () => void;
  onInvited: () => void;
}

export function InviteStaffModal({ schoolId, invitedBy, onClose, onInvited }: InviteStaffModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'teacher' | 'school_admin'>('teacher');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await inviteStaffMember({ schoolId, email, role, invitedBy });
      onInvited();
      onClose();
    } catch (err) {
      setError('Could not send that invite. Check the email and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Invite a staff member" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <FormField>
          Email address
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@school.edu"
          />
        </FormField>
        <FormField>
          Role
          <select value={role} onChange={(e) => setRole(e.target.value as 'teacher' | 'school_admin')}>
            <option value="teacher">Teacher</option>
            <option value="school_admin">School admin</option>
          </select>
        </FormField>
        {error && <ErrorText>{error}</ErrorText>}
        <Actions>
          <GhostButton type="button" onClick={onClose}>
            Cancel
          </GhostButton>
          <PrimaryButton type="submit" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send invite'}
          </PrimaryButton>
        </Actions>
      </form>
    </Modal>
  );
}