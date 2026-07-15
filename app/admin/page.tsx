'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Panel, PanelHeader, PanelTitle, Eyebrow, Badge, Table, TableScroll, EmptyState } from '@/components/school-admin/ui';
import { getPlatformKPIs } from '@/lib/admin/queries';
import type { PlatformKPIs } from '@/types/admin';

const Title = styled.h1`
  font-family: ${({ theme }) => theme.font.display};
  font-size: 28px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
  margin: 0 0 20px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 960px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Card = styled(Panel)`
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.span`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.inkFaint};
`;

const Value = styled.span`
  font-family: ${({ theme }) => theme.font.display};
  font-size: 28px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
`;

const Note = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.inkMuted};
`;

export default function AdminOverviewPage() {
  const [kpis, setKpis] = useState<PlatformKPIs | null>(null);

  useEffect(() => {
    getPlatformKPIs().then(setKpis).catch(console.error);
  }, []);

  if (!kpis) {
    return (
      <>
        <Title>Overview</Title>
        <Panel style={{ padding: 32 }}>Loading platform metrics…</Panel>
      </>
    );
  }

  return (
    <>
      <Title>Overview</Title>

      <Grid>
        <Card>
          <Label>DAU</Label>
          <Value>{kpis.dau}</Value>
          <Note>Active in last 24h</Note>
        </Card>
        <Card>
          <Label>WAU</Label>
          <Value>{kpis.wau}</Value>
          <Note>Active in last 7 days</Note>
        </Card>
        <Card>
          <Label>Total users</Label>
          <Value>{kpis.totalUsers}</Value>
          <Note>{kpis.b2cUsers} B2C · {kpis.b2b2cUsers} B2B2C</Note>
        </Card>
        <Card>
          <Label>Paying users</Label>
          <Value>{kpis.payingUsers}</Value>
          <Note>subscription = &apos;pro&apos;</Note>
        </Card>
       <Card>
          <Label>MRR</Label>
          <Value>${kpis.estimatedMRR.toLocaleString()}</Value>
          <Note>Based on actual plan pricing</Note>
        </Card>
        <Card>
          <Label>Schools</Label>
          <Value>{kpis.totalSchools}</Value>
          <Note>{kpis.activeSchools} active</Note>
        </Card>
        <Card>
          <Label>Renewals due</Label>
          <Value>{kpis.renewalsDueSoon.length}</Value>
          <Note>Within 30 days</Note>
        </Card>
      </Grid>

      <Panel style={{ marginBottom: 24 }}>
        <PanelHeader>
          <div>
            <Eyebrow>Attention needed</Eyebrow>
            <PanelTitle>Schools renewing soon</PanelTitle>
          </div>
        </PanelHeader>
        <div style={{ paddingTop: 12 }}>
          {kpis.renewalsDueSoon.length === 0 ? (
            <EmptyState>
              <strong>Nothing due soon</strong>
              No schools renewing in the next 30 days.
            </EmptyState>
          ) : (
            <TableScroll>
              <Table>
                <thead>
                  <tr><th>School</th><th>License ends</th><th>Days left</th></tr>
                </thead>
                <tbody>
                  {kpis.renewalsDueSoon.map((r) => (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td>{formatDate(r.licenseEnd)}</td>
                      <td>
                        <Badge $tone={r.daysLeft <= 7 ? 'coral' : 'gold'}>{r.daysLeft}d</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableScroll>
          )}
        </div>
      </Panel>
      <Panel style={{ padding: '20px 24px' }}>
        <p style={{ fontSize: 13, color: '#7C9995', lineHeight: 1.6, margin: 0 }}>
          <strong>Note on churn:</strong> churn isn&apos;t tracked precisely yet, since there&apos;s no payment webhook integration
          recording actual cancellation events — the numbers above reflect current state (active paying users, MRR),
          not historical churn rate. Wiring up your payment provider&apos;s webhooks would let this track real cancellation
          events going forward.
        </p>
      </Panel>
    </>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}