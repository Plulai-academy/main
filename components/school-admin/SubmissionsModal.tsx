'use client';

import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { PrimaryButton, GhostButton, Badge, Table, TableScroll } from './ui';
import { getAssignmentSubmissions, gradeSubmission } from '@/lib/school-admin/queries';
import type { AssignmentSubmissionRow } from '@/types/teacher';
import styled from 'styled-components';

const GradeRow = styled.div`
  display: grid;
  grid-template-columns: 90px 1fr auto;
  gap: 8px;
  align-items: start;
  margin-top: 8px;
`;

const SmallInput = styled.input`
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid ${({ theme }) => theme.colors.ledgerLine};
  background: ${({ theme }) => theme.colors.ledger};
  color: ${({ theme }) => theme.colors.ink};
  font-size: 13px;
`;

const Links = styled.div`
  display: flex;
  gap: 10px;
  font-size: 12px;
  margin-top: 4px;

  a {
    color: ${({ theme }) => theme.colors.reef};
  }
`;

const statusTone: Record<string, 'reef' | 'gold' | 'coral' | 'neutral'> = {
  not_started: 'neutral',
  in_progress: 'gold',
  submitted: 'reef',
  graded: 'reef',
};

interface SubmissionsModalProps {
  classId: string;
  assignmentId: string;
  assignmentTitle: string;
  onClose: () => void;
  onChanged: () => void;
}

export function SubmissionsModal({ classId, assignmentId, assignmentTitle, onClose, onChanged }: SubmissionsModalProps) {
  const [rows, setRows] = useState<AssignmentSubmissionRow[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [saving, setSaving] = useState(false);

  const refresh = () => {
    getAssignmentSubmissions(classId, assignmentId).then(setRows).catch(console.error);
  };

  useEffect(refresh, [classId, assignmentId]);

  function startEditing(row: AssignmentSubmissionRow) {
    setEditingId(row.studentId);
    setGradeInput(row.grade ?? '');
    setFeedbackInput(row.feedback ?? '');
  }

  async function saveGrade(row: AssignmentSubmissionRow) {
    setSaving(true);
    try {
      await gradeSubmission({
        assignmentId,
        studentId: row.studentId,
        submissionId: row.submissionId,
        grade: gradeInput.trim(),
        feedback: feedbackInput.trim(),
      });
      setEditingId(null);
      refresh();
      onChanged();
    } catch (err) {
      console.error('gradeSubmission failed:', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`Submissions — ${assignmentTitle}`} onClose={onClose}>
      <TableScroll>
        <Table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Status</th>
              <th>Grade</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((row) => (
              <tr key={row.studentId}>
                <td>
                  <div>{row.displayName}</div>
                  <div style={{ fontSize: 12, color: '#93A5A3' }}>{row.email}</div>
                  {(row.projectUrl || row.videoUrl || row.submissionContent) && (
                    <Links>
                      {row.projectUrl && (
                        <a href={row.projectUrl} target="_blank" rel="noreferrer">
                          Project
                        </a>
                      )}
                      {row.videoUrl && (
                        <a href={row.videoUrl} target="_blank" rel="noreferrer">
                          Video
                        </a>
                      )}
                    </Links>
                  )}
                  {editingId === row.studentId && (
                    <GradeRow>
                      <SmallInput placeholder="Grade" value={gradeInput} onChange={(e) => setGradeInput(e.target.value)} />
                      <SmallInput
                        placeholder="Feedback"
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                      />
                      <PrimaryButton type="button" disabled={saving} onClick={() => saveGrade(row)}>
                        {saving ? 'Saving…' : 'Save'}
                      </PrimaryButton>
                    </GradeRow>
                  )}
                </td>
                <td>
                  <Badge $tone={statusTone[row.status]}>{row.status.replace('_', ' ')}</Badge>
                </td>
                <td>{row.grade ?? '—'}</td>
                <td style={{ textAlign: 'right' }}>
                  <GhostButton onClick={() => startEditing(row)}>{row.grade ? 'Edit grade' : 'Grade'}</GhostButton>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableScroll>
    </Modal>
  );
}