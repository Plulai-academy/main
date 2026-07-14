'use client';

import styled, { css } from 'styled-components';

export const Panel = styled.div`
  background: ${({ theme }) => theme.colors.ledgerRaised};
  border: 1px solid ${({ theme }) => theme.colors.ledgerLine};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.card};
`;

export const PanelHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px 0;
`;
export const TableScroll = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 640px) {
    margin: 0 -22px;
    padding: 0 22px;
  }
`;
export const PanelTitle = styled.h2`
  font-family: ${({ theme }) => theme.font.display};
  font-size: 19px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
  margin: 0;
`;

export const Eyebrow = styled.span`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.inkFaint};
`;

export const PrimaryButton = styled.button<{ $tone?: 'reef' | 'coral' }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: none;
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme, $tone }) => ($tone === 'coral' ? theme.colors.coral : theme.colors.depth)};
  color: #fff;
  font-family: ${({ theme }) => theme.font.body};
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    box-shadow: 0 8px 20px rgba(13, 43, 50, 0.22);
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(0);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export const GhostButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid ${({ theme }) => theme.colors.ledgerLine};
  border-radius: ${({ theme }) => theme.radius.pill};
  background: transparent;
  color: ${({ theme }) => theme.colors.inkMuted};
  font-family: ${({ theme }) => theme.font.body};
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.reef};
    color: ${({ theme }) => theme.colors.depth};
  }
`;

export const Badge = styled.span<{ $tone?: 'reef' | 'gold' | 'coral' | 'neutral' }>`
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: ${({ theme }) => theme.radius.pill};
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 11px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-weight: 500;

  ${({ theme, $tone = 'neutral' }) => {
    const map = {
      reef: css`
        background: ${theme.colors.reefMuted};
        color: ${theme.colors.reef};
      `,
      gold: css`
        background: ${theme.colors.goldMuted};
        color: ${theme.colors.gold};
      `,
      coral: css`
        background: ${theme.colors.coralMuted};
        color: ${theme.colors.coral};
      `,
      neutral: css`
        background: rgba(255, 255, 255, 0.06);
        color: ${theme.colors.inkMuted};
      `,
    };
    return map[$tone];
  }}
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  thead th {
    text-align: left;
    padding: 10px 24px;
    font-family: ${({ theme }) => theme.font.mono};
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.inkFaint};
    border-bottom: 1px solid ${({ theme }) => theme.colors.ledgerLine};
    font-weight: 500;
  }

  tbody td {
    padding: 14px 24px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.ledgerLine};
    color: ${({ theme }) => theme.colors.ink};
    vertical-align: middle;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr {
    transition: background 0.15s ease;
  }

  tbody tr:hover {
    background: rgba(212, 162, 76, 0.05);
  }

  @media (max-width: 640px) {
    thead th,
    tbody td {
      padding: 10px 14px;
      white-space: nowrap;
    }
  }
`;

export const EmptyState = styled.div`
  padding: 48px 24px;
  text-align: center;
  color: ${({ theme }) => theme.colors.inkFaint};
  font-size: 14px;

  strong {
    display: block;
    font-family: ${({ theme }) => theme.font.display};
    font-size: 17px;
    color: ${({ theme }) => theme.colors.ink};
    margin-bottom: 4px;
    font-weight: 600;
  }
`;
