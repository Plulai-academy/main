'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styled, { ThemeProvider } from 'styled-components';
import { theme } from '@/lib/school-admin/theme';
import { SchoolAdminGlobalStyle } from '@/styles/school-admin-global';

const NAV = [
  { href: '/school-admin', label: 'Overview', key: 'overview', icon: OverviewIcon },
  { href: '/school-admin/staff', label: 'Staff', key: 'staff', icon: StaffIcon },
  { href: '/school-admin/classes', label: 'Classes', key: 'classes', icon: ClassesIcon },
  { href: '/school-admin/students', label: 'Students', key: 'students', icon: StudentsIcon },
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

  /* keep content clear of the fixed bottom nav on mobile/tablet */
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
  transition: color 0.15s ease;

  svg {
    width: 20px;
    height: 20px;
    stroke: currentColor;
  }
`;

const BottomNavLabel = styled.span`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 10px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
`;

const BottomNavDot = styled.span<{ $active: boolean }>`
  position: absolute;
  margin-top: -30px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${({ theme, $active }) => ($active ? theme.colors.gold : 'transparent')};
`;

interface DashboardShellProps {
  schoolName: string;
  children: ReactNode;
}

export function DashboardShell({ schoolName, children }: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <ThemeProvider theme={theme}>
      <SchoolAdminGlobalStyle />
      <div className="school-admin-root">
        <Shell>
          <Sidebar>
            <Nameplate>
              <Mark>{schoolName}</Mark>
              <MarkSub>School admin</MarkSub>
            </Nameplate>
            <NavList>
              {NAV.map((item) => (
                <NavItem key={item.key} href={item.href} $active={pathname === item.href}>
                  {item.label}
                </NavItem>
              ))}
            </NavList>
            <SidebarFoot>Seat &amp; roster records, kept current.</SidebarFoot>
          </Sidebar>
          <Main>{children}</Main>
        </Shell>

        <BottomNav aria-label="School admin navigation">
          {NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <BottomNavItem key={item.key} href={item.href} $active={active}>
                <BottomNavDot $active={active} />
                <Icon />
                <BottomNavLabel>{item.label}</BottomNavLabel>
              </BottomNavItem>
            );
          })}
        </BottomNav>
      </div>
    </ThemeProvider>
  );
}

// Minimal inline icons — no external icon library dependency.
function OverviewIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}

function StaffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c0-3.4 2.6-6 5.9-6 1.4 0 2.6.4 3.6 1.2" />
      <circle cx="17" cy="8.5" r="2.6" />
      <path d="M14.8 12.6c2.9.2 5.2 2.6 5.2 5.9" />
    </svg>
  );
}

function ClassesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6.5c2.5-1.3 5.5-1.3 8 0v11c-2.5-1.3-5.5-1.3-8 0v-11z" />
      <path d="M20 6.5c-2.5-1.3-5.5-1.3-8 0v11c2.5-1.3 5.5-1.3 8 0v-11z" />
    </svg>
  );
}

function StudentsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 2 8l10 5 10-5-10-5z" />
      <path d="M6 12v5c0 1.3 2.7 2.5 6 2.5s6-1.2 6-2.5v-5" />
    </svg>
  );
}