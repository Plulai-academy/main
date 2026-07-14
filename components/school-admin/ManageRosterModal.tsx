'use client';

import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { PrimaryButton, GhostButton, Table, TableScroll, EmptyState } from './ui';
import { getClassRoster, searchAvailableStudents, addStudentToClass, revokeStudentEnrollment } from '@/lib/school-admin/queries';
import type { SchoolStudent } from '@/types/schoolAdmin';
import styled from 'styled-components';

const SearchRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid ${({ theme }) => theme.colors.ledgerLine};
  background: ${({ theme }) => theme.colors.ledger};
  color: ${({ theme }) => theme.colors.ink};
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.reef};
  }
`;

const ResultRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radius.sm};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.ink};

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }
`;

interface ManageRosterModalProps {
  classId: string;
  className: string;
  schoolId: string;
  onClose: () => void;
  onChanged: () => void; // let the parent page refresh enrolledCount etc.
}

export function ManageRosterModal({ classId, className, schoolId, onClose, onChanged }: ManageRosterModalProps) {
  const [roster, setRoster] = useState<SchoolStudent[] | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ id: string; displayName: string; email: string }[]>([]);
  const [busy, setBusy] = useState(false);

  const refresh = () => {
    getClassRoster(classId).then(setRoster).catch(console.error);
  };

  useEffect(refresh, [classId]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      searchAvailableStudents(schoolId, q).then(setResults).catch(console.error);
    }, 250);
    return () => clearTimeout(t);
  }, [query, schoolId]);

  async function handleAdd(studentId: string) {
    setBusy(true);
    try {
      await addStudentToClass(classId, studentId);
      setQuery('');
      setResults([]);
      refresh();
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function handleRevoke(enrollmentId: string) {
    setBusy(true);
    try {
      await revokeStudentEnrollment(enrollmentId);
      refresh();
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  const enrolledIds = new Set((roster ?? []).map((s) => s.profileId));

  return (
    <Modal title={`Manage roster — ${className}`} onClose={onClose}>
      <SearchRow>
        <SearchInput
          placeholder="Search students in your school…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </SearchRow>

      {results.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {results.map((r) => (
            <ResultRow key={r.id}>
              <div>
                <div>{r.displayName}</div>
                <div style={{ fontSize: 11, opacity: 0.6 }}>{r.email}</div>
              </div>
              <GhostButton disabled={busy || enrolledIds.has(r.id)} onClick={() => handleAdd(r.id)}>
                {enrolledIds.has(r.id) ? 'Already in class' : 'Add'}
              </GhostButton>
            </ResultRow>
          ))}
        </div>
      )}

      {roster && roster.length === 0 ? (
        <EmptyState>
          <strong>No students yet</strong>
          Search above to add students already in your school.
        </EmptyState>
      ) : (
        <TableScroll>
          <Table>
            <thead>
              <tr>
                <th>Student</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(roster ?? []).map((s) => (
                <tr key={s.profileId}>
                  <td>
                    <div>{s.displayName}</div>
                    <div style={{ fontSize: 12, color: '#93A5A3' }}>{s.email}</div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                   <GhostButton disabled={busy} onClick={() => handleRevoke(s.enrollmentId!)}>
                    Remove
                    </GhostButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableScroll>
      )}
    </Modal>
  );
}