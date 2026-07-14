'use client';

import { ReactNode } from 'react';
import styled from 'styled-components';

const Header = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.font.display};
  font-size: 28px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
  margin: 0;
`;

const Subtitle = styled.p`
  margin: 4px 0 0;
  color: ${({ theme }) => theme.colors.inkMuted};
  font-size: 14px;
`;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <Header>
      <div>
        <Title>{title}</Title>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
      </div>
      {actions}
    </Header>
  );
}
