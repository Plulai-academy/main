import styled from 'styled-components';

interface LedgerBarProps {
  /** Entries currently recorded against the ledger (e.g. seats used). */
  used: number;
  /** Total capacity. If null/undefined, renders as an open ledger (no ceiling). */
  capacity: number | null | undefined;
  /** Small caption under the numerals, e.g. "seats", "students enrolled". */
  label: string;
  /** Switches the fill color when capacity is nearly or fully used. */
  warnAt?: number; // 0–1, defaults to 0.85
}

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Numerals = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-family: ${({ theme }) => theme.font.display};
`;

const Used = styled.span`
  font-size: 32px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
  line-height: 1;
`;

const Of = styled.span`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.inkFaint};
`;

const Cap = styled.span`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.inkMuted};
`;

const Label = styled.span`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.inkFaint};
`;

const Track = styled.div`
  position: relative;
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);   /* was: #f1ece0 */
  overflow: hidden;
`;
const Fill = styled.div<{ $pct: number; $tone: 'gold' | 'coral' }>`
  height: 100%;
  width: ${({ $pct }) => Math.min($pct, 1) * 100}%;
  background: ${({ theme, $tone }) => (($tone === 'coral') ? theme.colors.coral : theme.colors.gold)};
  transition: width 0.4s ease;
`;

const Ticks = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 1px;

  span {
    width: 1px;
    height: 100%;
    background: rgba(255, 255, 255, 0.10);   /* was: rgba(21, 35, 37, 0.08) */
  }
`;
export function LedgerBar({ used, capacity, label, warnAt = 0.85 }: LedgerBarProps) {
  const pct = capacity ? used / capacity : 0;
  const tone = capacity && pct >= warnAt ? 'coral' : 'gold';

  return (
    <Wrap>
      <Numerals>
        <Used>{used.toLocaleString()}</Used>
        {capacity != null && (
          <>
            <Of>of</Of>
            <Cap>{capacity.toLocaleString()}</Cap>
          </>
        )}
      </Numerals>
      <Label>{label}</Label>
      <Track>
        {capacity != null && <Fill $pct={pct} $tone={tone} />}
        <Ticks aria-hidden>
          {Array.from({ length: 11 }).map((_, i) => (
            <span key={i} />
          ))}
        </Ticks>
      </Track>
    </Wrap>
  );
}
