'use client';

import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { PageHeader } from '@/components/school-admin/PageHeader';
import { CreateClassModal } from '@/components/school-admin/CreateClassModal';
import { EditClassModal } from '@/components/school-admin/EditClassModal';
import { ManageRosterModal } from '@/components/school-admin/ManageRosterModal';
import { LedgerBar } from '@/components/school-admin/LedgerBar';
import { Panel, Badge, PrimaryButton, GhostButton, EmptyState } from '@/components/school-admin/ui';
import { getSchoolClasses, getSchoolStaff, getTracks, createJoinCode, revokeJoinCode } from '@/lib/school-admin/queries';
import { useSchoolAdminSession } from '@/components/school-admin/SchoolAdminSessionContext';
import type { SchoolClass } from '@/types/schoolAdmin';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled(Panel)`
  padding: 20px 22px 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CardHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
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

const CodeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.ledger};
  border: 1px solid ${({ theme }) => theme.colors.ledgerLine};
`;

const Code = styled.span`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 15px;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.ink};
  font-weight: 500;
`;

const CodeMeta = styled.span`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.inkFaint};
`;

const CardActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export default function SchoolAdminClassesPage() {
  const session = useSchoolAdminSession();
  const [classes, setClasses] = useState<SchoolClass[] | null>(null);
  const [teachers, setTeachers] = useState<{ id: string; displayName: string }[]>([]);
  const [tracks, setTracks] = useState<{ id: string; name: string }[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [rosterClass, setRosterClass] = useState<SchoolClass | null>(null);

  const refresh = useCallback(() => {
    getSchoolClasses(session.schoolId).then(setClasses).catch(console.error);
  }, [session.schoolId]);

  useEffect(refresh, [refresh]);

  useEffect(() => {
    getSchoolStaff(session.schoolId)
      .then((staff) =>
        setTeachers(staff.filter((s) => s.role === 'teacher').map((s) => ({ id: s.id, displayName: s.displayName })))
      )
      .catch(console.error);
    getTracks().then(setTracks).catch(console.error);
  }, [session.schoolId]);

  async function handleGenerateCode(classId: string) {
    await createJoinCode({ classId, createdBy: session.staffId, expiresInDays: 30 });
    refresh();
  }

  async function handleRevokeCode(joinCodeId: string) {
    if (!confirm('Revoke this join code? Students will no longer be able to use it to join.')) return;
    await revokeJoinCode(joinCodeId);
    refresh();
  }

  return (
    <>
      <PageHeader
        title="Classes"
        subtitle="Rosters, teachers, and the codes students use to join."
        actions={<PrimaryButton onClick={() => setCreateOpen(true)}>Create class</PrimaryButton>}
      />

      {classes && classes.length === 0 ? (
        <Panel>
          <EmptyState>
            <strong>No classes yet</strong>
            Create your first class to start building rosters.
          </EmptyState>
        </Panel>
      ) : (
        <Grid>
          {(classes ?? []).map((cls) => (
            <Card key={cls.id}>
              <CardHead>
                <div>
                  <ClassName>{cls.name}</ClassName>
                  <Meta>
                    {cls.teacherName ?? 'Unassigned'} · {cls.trackName ?? 'No track'}
                    {cls.academicYear ? ` · ${cls.academicYear}` : ''}
                  </Meta>
                </div>
              </CardHead>

              <LedgerBar used={cls.enrolledCount} capacity={null} label="students enrolled" />

              {cls.joinCode ? (
                <CodeRow>
                  <div>
                    <Code>{cls.joinCode.code}</Code>
                    <div>
                      <CodeMeta>
                        {cls.joinCode.useCount} used{cls.joinCode.maxUses ? ` / ${cls.joinCode.maxUses}` : ''}
                        {cls.joinCode.expiresAt ? ` · expires ${formatDate(cls.joinCode.expiresAt)}` : ''}
                      </CodeMeta>
                    </div>
                  </div>
                  <Badge $tone={cls.joinCode.isActive ? 'reef' : 'neutral'}>
                    {cls.joinCode.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </CodeRow>
              ) : (
                <GhostButton onClick={() => handleGenerateCode(cls.id)}>Generate join code</GhostButton>
              )}

              <CardActions>
                <GhostButton onClick={() => setRosterClass(cls)}>Manage roster</GhostButton>
                <GhostButton onClick={() => setEditingClass(cls)}>Edit</GhostButton>
                {cls.joinCode?.isActive && (
                  <GhostButton onClick={() => handleRevokeCode(cls.joinCode!.id)}>Revoke code</GhostButton>
                )}
              </CardActions>
            </Card>
          ))}
        </Grid>
      )}

      {createOpen && (
        <CreateClassModal
          schoolId={session.schoolId}
          teachers={teachers}
          tracks={tracks}
          onClose={() => setCreateOpen(false)}
          onCreated={refresh}
        />
      )}

      {editingClass && (
        <EditClassModal
          cls={editingClass}
          teachers={teachers}
          tracks={tracks}
          onClose={() => setEditingClass(null)}
          onSaved={refresh}
        />
      )}

      {rosterClass && (
        <ManageRosterModal
          classId={rosterClass.id}
          className={rosterClass.name}
          schoolId={session.schoolId}
          onClose={() => setRosterClass(null)}
          onChanged={refresh}
        />
      )}
    </>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}