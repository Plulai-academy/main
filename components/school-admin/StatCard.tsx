import styled from 'styled-components';
import { Panel } from './ui';

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
  font-size: 30px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
  line-height: 1.1;
`;

const Delta = styled.span<{ $tone: 'reef' | 'coral' | 'neutral' }>`
  font-size: 12.5px;
  font-weight: 500;
  color: ${({ theme, $tone }) =>
    $tone === 'reef' ? '#0e6e63' : $tone === 'coral' ? theme.colors.coral : theme.colors.inkMuted};
`;

interface StatCardProps {
  label: string;
  value: string | number;
  note?: string;
  tone?: 'reef' | 'coral' | 'neutral';
}

export function StatCard({ label, value, note, tone = 'neutral' }: StatCardProps) {
  return (
    <Card>
      <Label>{label}</Label>
      <Value>{value}</Value>
      {note && <Delta $tone={tone}>{note}</Delta>}
    </Card>
  );
}
