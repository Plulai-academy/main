'use client';

import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { PageHeader } from '@/components/school-admin/PageHeader';
import { InviteStaffModal } from '@/components/school-admin/InviteStaffModal';
import {
  Panel,
  PanelHeader,
  PanelTitle,
  Eyebrow,
  Badge,
  Table,
  TableScroll,
  PrimaryButton,
  GhostButton,
  EmptyState,
} from '@/components/school-admin/ui';
import { getSchoolStaff, getPendingInvites, revokeInvite, removeStaffMember } from '@/lib/school-admin/queries';
import { useSchoolAdminSession } from '@/components/school-admin/SchoolAdminSessionContext';
import type { SchoolStaffMember, StaffInvite } from '@/types/schoolAdmin';

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.reefMuted};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: ${({ theme }) => theme.font.display};
  font-weight: 600;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.reef};
  margin-right: 12px;
  vertical-align: middle;
`;
const NameCell = styled.span`
  display: inline-flex;
  align-items: center;
`;

export default function SchoolAdminStaffPage() {
  const session = useSchoolAdminSession();
  const [staff, setStaff] = useState<SchoolStaffMember[] | null>(null);
  const [invites, setInvites] = useState<StaffInvite[] | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  const refresh = useCallback(() => {
    getSchoolStaff(session.schoolId).then(setStaff).catch(console.error);
    getPendingInvites(session.schoolId).then(setInvites).catch(console.error);
  }, [session.schoolId]);

  useEffect(refresh, [refresh]);

  return (
    <>
      <PageHeader
        title="Staff"
        subtitle="Everyone with access to teach or administer your school."
        actions={<PrimaryButton onClick={() => setInviteOpen(true)}>Invite staff</PrimaryButton>}
      />

      <Panel style={{ marginBottom: 20 }}>
        <PanelHeader>
          <div>
            <Eyebrow>Roster</Eyebrow>
            <PanelTitle>Active staff</PanelTitle>
          </div>
        </PanelHeader>
        <div style={{ paddingTop: 12 }}>
          {staff && staff.length === 0 ? (
            <EmptyState>
              <strong>No staff yet</strong>
              Invite your first teacher or admin to get started.
            </EmptyState>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {(staff ?? []).map((member) => (
                  <tr key={member.id}>
                    <td>
                      <NameCell>
                        <Avatar>{initials(member.displayName)}</Avatar>
                        <div>
                          <div>{member.displayName}</div>
                          <div style={{ fontSize: 12, color: '#93A5A3' }}>{member.email}</div>
                        </div>
                      </NameCell>
                    </td>
                    <td>
                      <Badge $tone={member.role === 'school_admin' ? 'gold' : 'reef'}>{member.role}</Badge>
                    </td>
                    <td>{formatDate(member.createdAt)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <GhostButton onClick={() => removeStaffMember(member.id).then(refresh)}>Remove</GhostButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </Panel>

      {invites && invites.length > 0 && (
        <Panel>
          <PanelHeader>
            <div>
              <Eyebrow>Awaiting reply</Eyebrow>
              <PanelTitle>Pending invites</PanelTitle>
            </div>
          </PanelHeader>
          <div style={{ paddingTop: 12 }}>
            {staff && staff.length === 0 ? (
              <EmptyState>
                <strong>No staff yet</strong>
                Invite your first teacher or admin to get started.
              </EmptyState>
            ) : (
              <TableScroll>
                <Table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Expires</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {invites.map((invite) => (
                  <tr key={invite.id}>
                    <td>{invite.email}</td>
                    <td>
                      <Badge $tone={invite.role === 'school_admin' ? 'gold' : 'reef'}>{invite.role}</Badge>
                    </td>
                    <td>{formatDate(invite.expiresAt)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <GhostButton onClick={() => revokeInvite(invite.id).then(refresh)}>Revoke</GhostButton>
                    </td>
                  </tr>
                ))}
              </tbody>
              </Table>
              </TableScroll>
            )}
          </div>
        </Panel>
      )}

      {inviteOpen && (
        <InviteStaffModal
          schoolId={session.schoolId}
          invitedBy={session.staffId}
          onClose={() => setInviteOpen(false)}
          onInvited={refresh}
        />
      )}
    </>
  );
}

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
