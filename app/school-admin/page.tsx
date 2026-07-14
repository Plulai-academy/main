'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { PageHeader } from '@/components/school-admin/PageHeader';
import { StatCard } from '@/components/school-admin/StatCard';
import { LedgerBar } from '@/components/school-admin/LedgerBar';
import { Panel, PanelHeader, PanelTitle, Eyebrow, Badge, Table, TableScroll, EmptyState } from '@/components/school-admin/ui';
import { getSchoolOverview, getAtRiskStudents, getSchoolAssignmentStats, getEngagementTrend } from '@/lib/school-admin/queries';
import { useSchoolAdminSession } from '@/components/school-admin/SchoolAdminSessionContext';
import type { SchoolOverview, SchoolStudent, SchoolAssignmentStats as AssignmentStats, EngagementDay } from '@/types/schoolAdmin';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;

  @media (max-width: 960px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const LedgerGrid = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const LedgerBody = styled.div`
  padding: 20px 24px 28px;
`;

const License = styled.div`
  padding: 20px 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.inkMuted};

  span:last-child {
    color: ${({ theme }) => theme.colors.ink};
    font-weight: 500;
  }
`;

const ChartBody = styled.div`
  padding: 20px 24px 28px;
`;

const BarChart = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 120px;
  margin-top: 12px;
`;

const BarCol = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  height: 100%;
  justify-content: flex-end;
`;

const Bar = styled.div<{ $pct: number }>`
  width: 100%;
  max-width: 32px;
  height: ${({ $pct }) => Math.max($pct, 3)}%;
  background: ${({ theme }) => theme.colors.reef};
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
`;

const BarLabel = styled.span`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 10px;
  color: ${({ theme }) => theme.colors.inkFaint};
`;

const BarValue = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
`;

export default function SchoolAdminOverviewPage() {
  const session = useSchoolAdminSession();
  const [overview, setOverview] = useState<SchoolOverview | null>(null);
  const [atRisk, setAtRisk] = useState<SchoolStudent[] | null>(null);
  const [assignmentStats, setAssignmentStats] = useState<AssignmentStats | null>(null);
  const [trend, setTrend] = useState<EngagementDay[] | null>(null);

  useEffect(() => {
    getSchoolOverview(session.schoolId).then(setOverview).catch(console.error);
    getAtRiskStudents(session.schoolId).then(setAtRisk).catch(console.error);
    getSchoolAssignmentStats(session.schoolId).then(setAssignmentStats).catch(console.error);
    getEngagementTrend(session.schoolId).then(setTrend).catch(console.error);
  }, [session.schoolId]);

  if (!overview) {
    return (
      <>
        <PageHeader title="Overview" />
        <Panel style={{ padding: 32 }}>Fetching your school&apos;s records…</Panel>
      </>
    );
  }

  const { school } = overview;
  const licenseStatus = school.status === 'active' ? 'reef' : 'coral';
  const daysToRenewal = school.license_end
    ? Math.ceil((new Date(school.license_end).getTime() - Date.now()) / 86400_000)
    : null;

  const maxActive = trend ? Math.max(...trend.map((d) => d.activeCount), 1) : 1;

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="A ledger of who's enrolled, who's teaching, and what's left on your license."
      />

      <Grid>
        <StatCard
          label="Staff"
          value={overview.staffCount}
          note={`${overview.pendingInvites} pending invite${overview.pendingInvites === 1 ? '' : 's'}`}
        />
        <StatCard label="Classes" value={overview.classCount} />
        <StatCard label="Students" value={overview.studentCount} />
        <StatCard
          label="Active this week"
          value={overview.activeLast7Days}
          note={`${overview.studentCount ? Math.round((overview.activeLast7Days / overview.studentCount) * 100) : 0}% of roster`}
          tone="reef"
        />
      </Grid>

      <KpiGrid>
        <StatCard
          label="Assignment completion"
          value={assignmentStats ? `${assignmentStats.completionPct}%` : '—'}
          note={
            assignmentStats
              ? `${assignmentStats.totalCompleted}/${assignmentStats.totalPossible} completed`
              : 'Loading…'
          }
          tone={assignmentStats && assignmentStats.completionPct < 50 ? 'coral' : 'reef'}
        />
        <StatCard
          label="Ungraded submissions"
          value={assignmentStats?.ungradedCount ?? '—'}
          note="Waiting on teacher review"
          tone={assignmentStats && assignmentStats.ungradedCount > 0 ? 'coral' : 'neutral'}
        />
      </KpiGrid>

      <LedgerGrid>
        <Panel>
          <PanelHeader>
            <div>
              <Eyebrow>Seat ledger</Eyebrow>
              <PanelTitle>License capacity</PanelTitle>
            </div>
            <Badge $tone={licenseStatus}>{school.status}</Badge>
          </PanelHeader>
          <LedgerBody>
            <LedgerBar used={overview.seatsUsed} capacity={school.license_seats} label="seats enrolled" />
          </LedgerBody>
        </Panel>

        <Panel>
          <PanelHeader>
            <div>
              <Eyebrow>Agreement</Eyebrow>
              <PanelTitle>License details</PanelTitle>
            </div>
          </PanelHeader>
          <License>
            <Row>
              <span>Country</span>
              <span>{school.country ?? '—'}</span>
            </Row>
            <Row>
              <span>Term starts</span>
              <span>{school.license_start ? formatDate(school.license_start) : '—'}</span>
            </Row>
            <Row>
              <span>Term ends</span>
              <span>
                {school.license_end ? formatDate(school.license_end) : '—'}
                {daysToRenewal != null && daysToRenewal <= 30 && daysToRenewal >= 0 && <> · {daysToRenewal}d left</>}
              </span>
            </Row>
          </License>
        </Panel>
      </LedgerGrid>

      <LedgerGrid>
        <Panel>
          <PanelHeader>
            <div>
              <Eyebrow>Last 7 days</Eyebrow>
              <PanelTitle>Engagement trend</PanelTitle>
            </div>
          </PanelHeader>
          <ChartBody>
            {trend ? (
              <BarChart>
                {trend.map((d) => (
                  <BarCol key={d.date}>
                    <BarValue>{d.activeCount}</BarValue>
                    <Bar $pct={(d.activeCount / maxActive) * 100} />
                    <BarLabel>
                      {new Date(d.date).toLocaleDateString(undefined, { weekday: 'narrow' })}
                    </BarLabel>
                  </BarCol>
                ))}
              </BarChart>
            ) : (
              <Row>
                <span>Loading…</span>
              </Row>
            )}
          </ChartBody>
        </Panel>

        <Panel>
          <PanelHeader>
            <div>
              <Eyebrow>Needs attention</Eyebrow>
              <PanelTitle>At-risk students</PanelTitle>
            </div>
            <Badge $tone={atRisk && atRisk.length > 0 ? 'coral' : 'reef'}>
              {atRisk ? atRisk.length : '—'}
            </Badge>
          </PanelHeader>
          <div style={{ paddingTop: 12 }}>
            {atRisk && atRisk.length === 0 ? (
              <EmptyState>
                <strong>Everyone&apos;s active</strong>
                No students inactive for 14+ days.
              </EmptyState>
            ) : (
              <TableScroll>
                <Table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Last active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(atRisk ?? []).slice(0, 8).map((s) => (
                      <tr key={s.profileId}>
                        <td>
                          <div>{s.displayName}</div>
                          <div style={{ fontSize: 12, color: '#93A5A3' }}>{s.email}</div>
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
      </LedgerGrid>

      <Panel>
        <PanelHeader>
          <div>
            <Eyebrow>By class</Eyebrow>
            <PanelTitle>Completion leaderboard</PanelTitle>
          </div>
        </PanelHeader>
        <div style={{ paddingTop: 12 }}>
          {assignmentStats && assignmentStats.byClass.length === 0 ? (
            <EmptyState>
              <strong>No classes yet</strong>
              Completion rates will show up here once classes have assignments.
            </EmptyState>
          ) : (
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Enrolled</th>
                    <th>Completion</th>
                  </tr>
                </thead>
                <tbody>
                  {(assignmentStats?.byClass ?? []).map((c) => (
                    <tr key={c.classId}>
                      <td>{c.className}</td>
                      <td>{c.enrolledCount}</td>
                      <td>
                        <Badge $tone={c.completionPct >= 70 ? 'reef' : c.completionPct >= 40 ? 'gold' : 'coral'}>
                          {c.completionPct}%
                        </Badge>
                      </td>
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
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}