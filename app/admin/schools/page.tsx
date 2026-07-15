'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Panel, PanelHeader, PanelTitle, Eyebrow, Badge, Table, TableScroll, PrimaryButton, GhostButton, EmptyState } from '@/components/school-admin/ui';
import { Modal, FormField } from '@/components/school-admin/Modal';
import { getAllSchools, createSchool, updateSchool, deleteSchool } from '@/lib/admin/queries';
import { exportToCSV } from '@/lib/admin/export';
import type { AdminSchoolRow } from '@/types/admin';

const PageHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 12px;
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.font.display};
  font-size: 28px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
  margin: 0;
`;

export default function AdminSchoolsPage() {
  const [schools, setSchools] = useState<AdminSchoolRow[] | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<AdminSchoolRow | null>(null);

  const refresh = () => {
    getAllSchools().then(setSchools).catch(console.error);
  };

  useEffect(refresh, []);

  async function handleDelete(school: AdminSchoolRow) {
    if (!confirm(`Delete "${school.name}"? This removes the school and cascades to its classes/staff. This cannot be undone.`)) return;
    await deleteSchool(school.id);
    refresh();
  }
  function handleExport() {
  if (!schools) return;
  exportToCSV('schools-export.csv', schools.map((s) => ({
    Name: s.name,
    Country: s.country ?? '',
    Status: s.status,
    Seats: s.licenseSeats,
    Staff: s.staffCount,
    Students: s.studentCount,
    LicenseStart: s.licenseStart ?? '',
    LicenseEnd: s.licenseEnd ?? '',
    CreatedAt: s.createdAt,
  })));
}

  return (
    <>
      <PageHead>
      <Title>Schools</Title>
      <div style={{ display: 'flex', gap: 10 }}>
        <GhostButton onClick={handleExport}>Export CSV</GhostButton>
        <PrimaryButton onClick={() => setCreateOpen(true)}>Add school</PrimaryButton>
      </div>
    </PageHead>

      <Panel>
        <PanelHeader>
          <div>
            <Eyebrow>All schools</Eyebrow>
            <PanelTitle>{schools ? `${schools.length} school${schools.length === 1 ? '' : 's'}` : 'Loading…'}</PanelTitle>
          </div>
        </PanelHeader>
        <div style={{ paddingTop: 12 }}>
          {schools && schools.length === 0 ? (
            <EmptyState>
              <strong>No schools yet</strong>
              Add your first school to get started.
            </EmptyState>
          ) : (
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    <th>School</th>
                    <th>Status</th>
                    <th>Seats</th>
                    <th>Staff</th>
                    <th>Students</th>
                    <th>License ends</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {(schools ?? []).map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div>{s.name}</div>
                        <div style={{ fontSize: 12, color: '#93A5A3' }}>{s.country ?? '—'}</div>
                      </td>
                      <td>
                        <Badge $tone={s.status === 'active' ? 'reef' : 'coral'}>{s.status}</Badge>
                      </td>
                      <td>{s.studentCount}/{s.licenseSeats}</td>
                      <td>{s.staffCount}</td>
                      <td>{s.studentCount}</td>
                      <td>{s.licenseEnd ? formatDate(s.licenseEnd) : '—'}</td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <GhostButton onClick={() => setEditingSchool(s)}>Edit</GhostButton>{' '}
                        <GhostButton onClick={() => handleDelete(s)}>Delete</GhostButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableScroll>
          )}
        </div>
      </Panel>  

      {createOpen && <SchoolFormModal mode="create" onClose={() => setCreateOpen(false)} onSaved={refresh} />}
      {editingSchool && (
        <SchoolFormModal mode="edit" school={editingSchool} onClose={() => setEditingSchool(null)} onSaved={refresh} />
      )}
    </>
  );
}

function SchoolFormModal({
  mode,
  school,
  onClose,
  onSaved,
}: {
  mode: 'create' | 'edit';
  school?: AdminSchoolRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(school?.name ?? '');
  const [country, setCountry] = useState(school?.country ?? '');
  const [status, setStatus] = useState(school?.status ?? 'active');
  const [seats, setSeats] = useState(school?.licenseSeats ?? 50);
  const [start, setStart] = useState(school?.licenseStart?.slice(0, 10) ?? '');
  const [end, setEnd] = useState(school?.licenseEnd?.slice(0, 10) ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'create') {
        await createSchool({
          name,
          country: country || null,
          licenseSeats: seats,
          licenseStart: start || null,
          licenseEnd: end || null,
        });
      } else if (school) {
        await updateSchool(school.id, {
          name,
          country: country || null,
          status,
          licenseSeats: seats,
          licenseStart: start || null,
          licenseEnd: end || null,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError('Could not save. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={mode === 'create' ? 'Add school' : 'Edit school'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <FormField>
          School name
          <input required value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField>
          Country
          <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. United Arab Emirates" />
        </FormField>
        {mode === 'edit' && (
          <FormField>
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </FormField>
        )}
        <FormField>
          License seats
          <input type="number" min={1} required value={seats} onChange={(e) => setSeats(Number(e.target.value))} />
        </FormField>
        <FormField>
          License start
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </FormField>
        <FormField>
          License end
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </FormField>
        {error && <p style={{ color: '#FF6B57', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <GhostButton type="button" onClick={onClose}>
            Cancel
          </GhostButton>
          <PrimaryButton type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : mode === 'create' ? 'Create school' : 'Save changes'}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
