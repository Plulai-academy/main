'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Panel, PanelHeader, PanelTitle, Eyebrow, Badge, Table, TableScroll, GhostButton, PrimaryButton, EmptyState } from '@/components/school-admin/ui';
import { Modal, FormField } from '@/components/school-admin/Modal';
import { searchUsers, deleteUserAccount, sendPasswordRecovery, updateUserAccount } from '@/lib/admin/queries';
import type { AdminUserRow } from '@/types/admin';

const Title = styled.h1`
  font-family: ${({ theme }) => theme.font.display};
  font-size: 28px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
  margin: 0 0 20px;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 220px;
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radius.pill};
  border: 1px solid ${({ theme }) => theme.colors.ledgerLine};
  background: ${({ theme }) => theme.colors.ledgerRaised};
  color: ${({ theme }) => theme.colors.ink};
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.reef};
  }
`;

const FilterSelect = styled.select`
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radius.pill};
  border: 1px solid ${({ theme }) => theme.colors.ledgerLine};
  background: ${({ theme }) => theme.colors.ledgerRaised};
  color: ${({ theme }) => theme.colors.ink};
  font-size: 14px;
`;

const PaginationRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.ledgerLine};
`;

const PageInfo = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.inkMuted};
`;

const PAGE_SIZE = 25;

export default function AdminUsersPage() {
  const [query, setQuery] = useState('');
  const [accountType, setAccountType] = useState('');
  const [subscription, setSubscription] = useState('');
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<AdminUserRow[] | null>(null);
  const [total, setTotal] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null);

  const refresh = () => {
    searchUsers({ query, accountType: accountType || undefined, subscription: subscription || undefined, page, pageSize: PAGE_SIZE })
      .then((res) => {
        setUsers(res.users);
        setTotal(res.total);
      })
      .catch(console.error);
  };

  useEffect(() => {
    const t = setTimeout(refresh, 300);
    return () => clearTimeout(t);
  }, [query, accountType, subscription, page]);

  useEffect(() => {
    setPage(1);
  }, [query, accountType, subscription]);

  async function handleDelete(u: AdminUserRow) {
    if (!confirm(`Permanently delete ${u.displayName} (${u.email})? This cannot be undone.`)) return;
    setBusyId(u.id);
    setActionError(null);
    try {
      await deleteUserAccount(u.id);
      refresh();
    } catch (err: any) {
      setActionError(err.message ?? 'Failed to delete');
    } finally {
      setBusyId(null);
    }
  }

  async function handleRecovery(u: AdminUserRow) {
    setBusyId(u.id);
    setActionError(null);
    try {
      await sendPasswordRecovery(u.email);
      alert(`Recovery email sent to ${u.email}`);
    } catch (err: any) {
      setActionError(err.message ?? 'Failed to send recovery email');
    } finally {
      setBusyId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <Title>Users</Title>

      <FilterRow>
        <SearchInput
          placeholder="Search by name or email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <FilterSelect value={accountType} onChange={(e) => setAccountType(e.target.value)}>
          <option value="">All types</option>
          <option value="b2c">B2C</option>
          <option value="b2b2c">B2B2C</option>
        </FilterSelect>
        <FilterSelect value={subscription} onChange={(e) => setSubscription(e.target.value)}>
          <option value="">All subscriptions</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="school">School</option>
        </FilterSelect>
      </FilterRow>

      {actionError && <p style={{ color: '#FF6B57', fontSize: 13, marginBottom: 16 }}>{actionError}</p>}

      <Panel>
        <PanelHeader>
          <div>
            <Eyebrow>Accounts</Eyebrow>
            <PanelTitle>{total} result{total === 1 ? '' : 's'}</PanelTitle>
          </div>
        </PanelHeader>
        <div style={{ paddingTop: 12 }}>
          {users && users.length === 0 ? (
            <EmptyState>
              <strong>No users found</strong>
              Try a different search or filter.
            </EmptyState>
          ) : (
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Type</th>
                    <th>Subscription</th>
                    <th>School</th>
                    <th>XP</th>
                    <th>Last active</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {(users ?? []).map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div>{u.displayName}</div>
                        <div style={{ fontSize: 12, color: '#93A5A3' }}>{u.email}</div>
                      </td>
                      <td>
                        <Badge $tone={u.accountType === 'b2b2c' ? 'gold' : 'neutral'}>{u.accountType}</Badge>
                      </td>
                      <td>{u.subscription ?? '—'}</td>
                      <td>{u.schoolName ?? '—'}</td>
                      <td>{u.xp.toLocaleString()}</td>
                      <td>{u.lastActiveDate ? formatDate(u.lastActiveDate) : 'Never'}</td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <GhostButton onClick={() => setEditingUser(u)}>Edit</GhostButton>{' '}
                        <GhostButton disabled={busyId === u.id} onClick={() => handleRecovery(u)}>
                          Send reset
                        </GhostButton>{' '}
                        <GhostButton disabled={busyId === u.id} onClick={() => handleDelete(u)}>
                          Delete
                        </GhostButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableScroll>
          )}
        </div>

        <PaginationRow>
          <PageInfo>
            Page {page} of {totalPages}
          </PageInfo>
          <div style={{ display: 'flex', gap: 8 }}>
            <GhostButton disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </GhostButton>
            <GhostButton disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              Next
            </GhostButton>
          </div>
        </PaginationRow>
      </Panel>

      {editingUser && (
        <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSaved={refresh} />
      )}
    </>
  );
}

function EditUserModal({
  user,
  onClose,
  onSaved,
}: {
  user: AdminUserRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [subscription, setSubscription] = useState(user.subscription ?? '');
  const [planId, setPlanId] = useState(user.planId ?? 'monthly');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await updateUserAccount(user.id, {
        displayName,
        subscription: subscription || null,
        planId: subscription === 'pro' ? planId : null,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError('Could not save. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Edit user" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <FormField>
          Display name
          <input required value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </FormField>
        <FormField>
          Subscription
          <select value={subscription} onChange={(e) => setSubscription(e.target.value)}>
            <option value="">None</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
          </select>
        </FormField>
        {subscription === 'pro' && (
          <FormField>
            Plan
            <select value={planId} onChange={(e) => setPlanId(e.target.value)}>
              <option value="monthly">Monthly — $79/mo</option>
              <option value="yearly">Yearly — $663/yr</option>
            </select>
          </FormField>
        )}
        {error && <p style={{ color: '#FF6B57', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <GhostButton type="button" onClick={onClose}>
            Cancel
          </GhostButton>
          <PrimaryButton type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save changes'}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}