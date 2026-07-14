'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { PageHeader } from '@/components/school-admin/PageHeader';
import { Panel, Badge, GhostButton, Table, TableScroll, EmptyState, Eyebrow } from '@/components/school-admin/ui';
import { ManageRosterModal } from '@/components/school-admin/ManageRosterModal';
import { CreateAssignmentModal } from '@/components/school-admin/CreateAssignmentModal';
import { SubmissionsModal } from '@/components/school-admin/SubmissionsModal';
import { getSchoolClasses, getClassRoster, getClassAssignments, deleteAssignment } from '@/lib/school-admin/queries';
import { useTeacherSession } from '@/components/teacher/TeacherSessionContext';
import type { SchoolClass, SchoolStudent } from '@/types/schoolAdmin';
import type { Assignment } from '@/types/teacher';

const Card = styled(Panel)`
  padding: 20px 22px 22px;
  margin-bottom: 16px;
`;

const CardHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const ClassName = styled.h3`
  font-family: ${({ theme }) => theme.font.display};
  font-size: 17px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
  margin: 0 0 2px;
`;

const Meta = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.inkMuted};
`;

const HeadActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const RosterWrap = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.ledgerLine};
`;

const AssignmentsWrap = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.ledgerLine};
`;

const AssignmentRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.ledgerLine};
  flex-wrap: wrap;

  &:last-child {
    border-bottom: none;
  }
`;

const AssignmentActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export default function TeacherOverviewPage() {
  const session = useTeacherSession();
  const [classes, setClasses] = useState<SchoolClass[] | null>(null);
  const [openClassId, setOpenClassId] = useState<string | null>(null);
  const [roster, setRoster] = useState<SchoolStudent[] | null>(null);
  const [rosterLoading, setRosterLoading] = useState(false);

  const [manageClassId, setManageClassId] = useState<string | null>(null);
  const [manageClassName, setManageClassName] = useState('');

  const [assignments, setAssignments] = useState<Record<string, Assignment[]>>({});
  const [createAssignmentFor, setCreateAssignmentFor] = useState<SchoolClass | null>(null);
  const [viewingSubmissions, setViewingSubmissions] = useState<{
    classId: string;
    assignmentId: string;
    title: string;
  } | null>(null);

  const refreshClasses = () => {
    getSchoolClasses(session.schoolId).then(setClasses).catch(console.error);
  };

  useEffect(refreshClasses, [session.schoolId]);

  function loadAssignments(classId: string) {
    getClassAssignments(classId)
      .then((data) => setAssignments((prev) => ({ ...prev, [classId]: data })))
      .catch(console.error);
  }

  useEffect(() => {
    (classes ?? []).forEach((c) => loadAssignments(c.id));
  }, [classes]);

  async function toggleRoster(classId: string) {
    if (openClassId === classId) {
      setOpenClassId(null);
      setRoster(null);
      return;
    }
    setOpenClassId(classId);
    setRosterLoading(true);
    try {
      const data = await getClassRoster(classId);
      setRoster(data);
    } catch (err) {
      console.error(err);
      setRoster([]);
    } finally {
      setRosterLoading(false);
    }
  }

  function handleManageChanged() {
    refreshClasses();
    if (manageClassId && openClassId === manageClassId) {
      setRosterLoading(true);
      getClassRoster(manageClassId)
        .then(setRoster)
        .catch(() => setRoster([]))
        .finally(() => setRosterLoading(false));
    }
  }

  async function handleDeleteAssignment(assignmentId: string, classId: string) {
    if (!confirm('Delete this assignment? Any grades on it will be lost.')) return;
    await deleteAssignment(assignmentId);
    loadAssignments(classId);
  }

  return (
    <>
      <PageHeader title="My classes" subtitle="Rosters, assignments, and join codes for classes you teach." />

      {classes && classes.length === 0 ? (
        <Panel>
          <EmptyState>
            <strong>No classes assigned yet</strong>
            Ask your school admin to assign you to a class.
          </EmptyState>
        </Panel>
      ) : (
        (classes ?? []).map((cls) => (
          <Card key={cls.id}>
            <CardHead>
              <div>
                <ClassName>{cls.name}</ClassName>
                <Meta>
                  {cls.trackName ?? 'No track'}
                  {cls.academicYear ? ` · ${cls.academicYear}` : ''} · {cls.enrolledCount} enrolled
                </Meta>
              </div>
              <HeadActions>
                <GhostButton
                  onClick={() => {
                    setManageClassId(cls.id);
                    setManageClassName(cls.name);
                  }}
                >
                  Manage roster
                </GhostButton>
                <GhostButton onClick={() => toggleRoster(cls.id)}>
                  {openClassId === cls.id ? 'Hide roster' : 'View roster'}
                </GhostButton>
              </HeadActions>
            </CardHead>

            {openClassId === cls.id && (
              <RosterWrap>
                {rosterLoading ? (
                  <Meta>Loading roster…</Meta>
                ) : roster && roster.length === 0 ? (
                  <EmptyState>
                    <strong>No students enrolled</strong>
                    Share the class join code to get started.
                  </EmptyState>
                ) : (
                  <TableScroll>
                    <Table>
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Level</th>
                          <th>XP</th>
                          <th>Streak</th>
                          <th>Last active</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(roster ?? []).map((s) => (
                          <tr key={s.profileId}>
                            <td>
                              <div>{s.displayName}</div>
                              <div style={{ fontSize: 12, color: '#93A5A3' }}>{s.email}</div>
                            </td>
                            <td>
                              <Badge $tone="gold">Lv {s.level}</Badge>
                            </td>
                            <td>{s.xp.toLocaleString()}</td>
                            <td>{s.streak}🔥</td>
                            <td>{s.lastActiveDate ? formatDate(s.lastActiveDate) : 'Never'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </TableScroll>
                )}
              </RosterWrap>
            )}

            <AssignmentsWrap>
              <CardHead>
                <Eyebrow style={{ margin: 0 }}>Assignments</Eyebrow>
                <GhostButton onClick={() => setCreateAssignmentFor(cls)}>New assignment</GhostButton>
              </CardHead>
              {(assignments[cls.id] ?? []).length === 0 ? (
                <Meta style={{ marginTop: 8 }}>No assignments yet.</Meta>
              ) : (
                (assignments[cls.id] ?? []).map((a) => (
                  <AssignmentRow key={a.id}>
                    <div>
                      <div>
                        {a.emoji ? `${a.emoji} ` : ''}
                        {a.title}
                      </div>
                      <Meta>
                        {a.gradedCount}/{a.totalStudents} graded · {a.submittedCount}/{a.totalStudents} submitted
                        {a.dueDate ? ` · due ${formatDate(a.dueDate)}` : ''}
                      </Meta>
                    </div>
                    <AssignmentActions>
                      <GhostButton
                        onClick={() =>
                          setViewingSubmissions({ classId: cls.id, assignmentId: a.id, title: a.title })
                        }
                      >
                        View submissions
                      </GhostButton>
                      <GhostButton onClick={() => handleDeleteAssignment(a.id, cls.id)}>Delete</GhostButton>
                    </AssignmentActions>
                  </AssignmentRow>
                ))
              )}
            </AssignmentsWrap>
          </Card>
        ))
      )}

      {manageClassId && (
        <ManageRosterModal
          classId={manageClassId}
          className={manageClassName}
          schoolId={session.schoolId}
          onClose={() => setManageClassId(null)}
          onChanged={handleManageChanged}
        />
      )}

      {createAssignmentFor && (
        <CreateAssignmentModal
          classId={createAssignmentFor.id}
          trackId={createAssignmentFor.trackId}
          assignedBy={session.staffId}
          onClose={() => setCreateAssignmentFor(null)}
          onCreated={() => loadAssignments(createAssignmentFor.id)}
        />
      )}

      {viewingSubmissions && (
        <SubmissionsModal
          classId={viewingSubmissions.classId}
          assignmentId={viewingSubmissions.assignmentId}
          assignmentTitle={viewingSubmissions.title}
          onClose={() => setViewingSubmissions(null)}
          onChanged={() => loadAssignments(viewingSubmissions.classId)}
        />
      )}
    </>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}