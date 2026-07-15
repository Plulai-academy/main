'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Panel, PanelHeader, PanelTitle, Eyebrow, Badge, Table, TableScroll, EmptyState } from '@/components/school-admin/ui';
import { getFinanceOverview } from '@/lib/admin/queries';
import type { FinanceOverview } from '@/types/admin';

const Title = styled.h1`
  font-family: ${({ theme }) => theme.font.display};
  font-size: 28px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
  margin: 0 0 20px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
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
  font-size: 32px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
`;

const ChartBody = styled.div`
  padding: 20px 24px 28px;
`;

const BarChart = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 10px;
  height: 140px;
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
  max-width: 40px;
  height: ${({ $pct }) => Math.max($pct, 3)}%;
  background: ${({ theme }) => theme.colors.gold};
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

export default function AdminFinancesPage() {
  const [data, setData] = useState<FinanceOverview | null>(null);

  useEffect(() => {
    getFinanceOverview().then(setData).catch(console.error);
  }, []);

  if (!data) {
    return (
      <>
        <Title>Finances</Title>
        <Panel style={{ padding: 32 }}>Loading…</Panel>
      </>
    );
  }

  const maxTrend = Math.max(...data.trend.map((t) => t.newSubscribers), 1);

  return (
    <>
      <Title>Finances</Title>

      <Grid>
        <Card>
          <Label>MRR</Label>
          <Value>${data.totalMRR.toLocaleString()}</Value>
        </Card>
        <Card>
          <Label>Paying users</Label>
          <Value>{data.totalPayingUsers}</Value>
        </Card>
      </Grid>

      <Panel style={{ marginBottom: 24 }}>
        <PanelHeader>
          <div>
            <Eyebrow>By plan</Eyebrow>
            <PanelTitle>Revenue breakdown</PanelTitle>
          </div>
        </PanelHeader>
        <div style={{ paddingTop: 12 }}>
          {data.byPlan.length === 0 ? (
            <EmptyState>
              <strong>No paying subscribers yet</strong>
            </EmptyState>
          ) : (
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Price</th>
                    <th>Subscribers</th>
                    <th>Monthly revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byPlan.map((p) => (
                    <tr key={p.planId}>
                      <td>{p.planName}</td>
                      <td>${p.price.toLocaleString()}/{p.interval === 'year' ? 'yr' : 'mo'}</td>
                      <td>{p.subscriberCount}</td>
                      <td>${p.monthlyRevenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableScroll>
          )}
        </div>
      </Panel>

      <Panel style={{ marginBottom: 24 }}>
        <PanelHeader>
          <div>
            <Eyebrow>Last 6 months</Eyebrow>
            <PanelTitle>New subscribers</PanelTitle>
          </div>
        </PanelHeader>
        <ChartBody>
          <BarChart>
            {data.trend.map((t) => (
              <BarCol key={t.month}>
                <BarValue>{t.newSubscribers}</BarValue>
                <Bar $pct={(t.newSubscribers / maxTrend) * 100} />
                <BarLabel>{formatMonth(t.month)}</BarLabel>
              </BarCol>
            ))}
          </BarChart>
        </ChartBody>
      </Panel>

      <Panel style={{ padding: '20px 24px' }}>
        <p style={{ fontSize: 13, color: '#7C9995', lineHeight: 1.6, margin: 0 }}>
          <strong>Note:</strong> this trend reflects new subscriptions by <code>subscribed_at</code> — it doesn&apos;t
          account for cancellations, so it shows growth in new sign-ups, not net revenue change month over month.
          Accurate churn/net-revenue tracking needs payment webhook integration.
        </p>
      </Panel>
    </>
  );
}

function formatMonth(ym: string) {
  const [year, month] = ym.split('-');
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(undefined, { month: 'short' });
}