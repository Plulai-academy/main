'use client';

import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { PageHeader } from '@/components/school-admin/PageHeader';
import { Panel, PanelHeader, PanelTitle, Eyebrow, Badge, Table, TableScroll, EmptyState } from '@/components/school-admin/ui';
import { getSchoolStudents, getSchoolClasses } from '@/lib/school-admin/queries';
import { useSchoolAdminSession } from '@/components/school-admin/SchoolAdminSessionContext';
import type { SchoolStudent, SchoolClass } from '@/types/schoolAdmin';

const Toolbar = styled.div`
  display: flex;
  gap: 12px;
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
  font-size: 14px;
  color: ${({ theme }) => theme.colors.ink};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.reef};
  }
`;

const ClassSelect = styled.select`
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radius.pill};
  border: 1px solid ${({ theme }) => theme.colors.ledgerLine};
  background: ${({ theme }) => theme.colors.ledgerRaised};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.ink};
`;

const StreakCell = styled.span<{ $warm: boolean }>`
  font-family: ${({ theme }) => theme.font.mono};
  color: ${({ theme, $warm }) => ($warm ? theme.colors.gold : theme.colors.inkFaint)};
  font-weight: ${({ $warm }) => ($warm ? 600 : 400)};
`;

export default function SchoolAdminStudentsPage() {
  const session = useSchoolAdminSession();
  const [students, setStudents] = useState<SchoolStudent[] | null>(null);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [classFilter, setClassFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getSchoolClasses(session.schoolId).then(setClasses).catch(console.error);
  }, [session.schoolId]);

  useEffect(() => {
    getSchoolStudents(session.schoolId, classFilter || undefined)
      .then(setStudents)
      .catch(console.error);
  }, [session.schoolId, classFilter]);

  const filtered = useMemo(() => {
    if (!students) return null;
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => s.displayName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
  }, [students, search]);

  return (
    <>
      <PageHeader title="Students" subtitle="Progress across every enrolled student." />

      <Toolbar>
        <SearchInput placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
        <ClassSelect value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
          <option value="">All classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </ClassSelect>
      </Toolbar>

      <Panel>
        <PanelHeader>
          <div>
            <Eyebrow>Roster</Eyebrow>
            <PanelTitle>{filtered ? `${filtered.length} student${filtered.length === 1 ? '' : 's'}` : 'Students'}</PanelTitle>
          </div>
        </PanelHeader>
        <div style={{ paddingTop: 12 }}>
          {filtered && filtered.length === 0 ? (
            <EmptyState>
              <strong>No students found</strong>
              Try a different search or class filter.
            </EmptyState>
          ) : (
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Class</th>
                    <th>Level</th>
                    <th>XP</th>
                    <th>Streak</th>
                    <th>Last active</th>
                  </tr>
                </thead>
                <tbody>
                  {(filtered ?? []).map((s) => (
                    <tr key={s.profileId}>
                      <td>
                        <div>{s.displayName}</div>
                        <div style={{ fontSize: 12, color: '#93A5A3' }}>{s.email}</div>
                      </td>
                      <td>{s.classNames.length ? s.classNames.join(', ') : '—'}</td>
                      <td>
                        <Badge $tone="gold">Lv {s.level}</Badge>
                      </td>
                      <td>{s.xp.toLocaleString()}</td>
                      <td>
                        <StreakCell $warm={s.streak >= 3}>{s.streak}🔥</StreakCell>
                      </td>
                      <td>{s.lastActiveDate ? formatDate(s.lastActiveDate) : 'Never'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableScroll>
          )}
        </div>
      </Panel>
    </>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}