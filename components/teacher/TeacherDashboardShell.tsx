'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styled, { ThemeProvider } from 'styled-components';
import { theme } from '@/lib/school-admin/theme';
import { SchoolAdminGlobalStyle } from '@/styles/school-admin-global';

const NAV = [
  { href: '/teacher', label: 'My classes', key: 'classes' },
  { href: '/teacher/lessons', label: 'Curriculum', key: 'lessons' },
] as const;
const Shell = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 264px 1fr;
  background: ${({ theme }) => theme.colors.ledger};

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.aside`
  background: linear-gradient(180deg, ${({ theme }) => theme.colors.depth} 0%, ${({ theme }) => theme.colors.depthDeep} 100%);
  color: ${({ theme }) => theme.colors.onDepth};
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  gap: 36px;

  @media (max-width: 860px) {
    display: none;
  }
`;

const Nameplate = styled.div`
  padding: 0 4px;
`;

const Mark = styled.div`
  font-family: ${({ theme }) => theme.font.display};
  font-size: 21px;
  font-weight: 600;
  letter-spacing: 0.01em;
`;

const MarkSub = styled.div`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 10.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.onDepthMuted};
  margin-top: 3px;
`;

const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const NavItem = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radius.md};
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme, $active }) => ($active ? theme.colors.onDepth : theme.colors.onDepthMuted)};
  background: ${({ $active }) => ($active ? 'rgba(212,162,76,0.14)' : 'transparent')};
  border-left: 2px solid ${({ theme, $active }) => ($active ? theme.colors.gold : 'transparent')};
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.onDepth};
    background: rgba(255, 255, 255, 0.04);
  }
`;

const SidebarFoot = styled.div`
  margin-top: auto;
  padding: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.depthLine};
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.onDepthMuted};
`;

const Main = styled.main`
  padding: 32px 40px 64px;

  @media (max-width: 640px) {
    padding: 20px 18px 48px;
  }

  @media (max-width: 860px) {
    padding-bottom: calc(84px + env(safe-area-inset-bottom, 0px));
  }
`;

const BottomNav = styled.nav`
  display: none;

  @media (max-width: 860px) {
    display: flex;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 50;
    padding: 8px 10px calc(8px + env(safe-area-inset-bottom, 0px));
    background: linear-gradient(180deg, ${({ theme }) => theme.colors.depth} 0%, ${({ theme }) => theme.colors.depthDeep} 100%);
    border-top: 1px solid ${({ theme }) => theme.colors.depthLine};
    box-shadow: 0 -12px 30px rgba(0, 0, 0, 0.35);
  }
`;

const BottomNavItem = styled(Link)<{ $active: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 4px 6px;
  border-radius: ${({ theme }) => theme.radius.md};
  text-decoration: none;
  color: ${({ theme, $active }) => ($active ? theme.colors.gold : theme.colors.onDepthMuted)};
`;

const BottomNavLabel = styled.span`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 10px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
`;

interface TeacherDashboardShellProps {
  schoolName: string;
  children: ReactNode;
}

export function TeacherDashboardShell({ schoolName, children }: TeacherDashboardShellProps) {
  const pathname = usePathname();

  return (
    <ThemeProvider theme={theme}>
      <SchoolAdminGlobalStyle />
      <div className="school-admin-root">
        <Shell>
          <Sidebar>
            <Nameplate>
              <Mark>{schoolName}</Mark>
              <MarkSub>Teacher</MarkSub>
            </Nameplate>
            <NavList>
              {NAV.map((item) => (
                <NavItem key={item.key} href={item.href} $active={pathname === item.href}>
                  {item.label}
                </NavItem>
              ))}
            </NavList>
            <SidebarFoot>Your rosters, kept current.</SidebarFoot>
          </Sidebar>
          <Main>{children}</Main>
        </Shell>

        <BottomNav aria-label="Teacher navigation">
          {NAV.map((item) => (
            <BottomNavItem key={item.key} href={item.href} $active={pathname === item.href}>
              <BottomNavLabel>{item.label}</BottomNavLabel>
            </BottomNavItem>
          ))}
        </BottomNav>
      </div>
    </ThemeProvider>
  );
}