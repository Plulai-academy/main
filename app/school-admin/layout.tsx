// app/school-admin/layout.tsx
import { ReactNode } from 'react';
import { requireSchoolAdminSession, getSchoolNameServer } from '@/lib/school-admin/session';
import { SchoolAdminSessionProvider } from '@/components/school-admin/SchoolAdminSessionContext';
import { DashboardShell } from '@/components/school-admin/DashboardShell';

export default async function SchoolAdminLayout({ children }: { children: ReactNode }) {
  const session = await requireSchoolAdminSession();
  const schoolName = await getSchoolNameServer(session.schoolId);

  return (
    <SchoolAdminSessionProvider session={session}>
      <DashboardShell schoolName={schoolName}>{children}</DashboardShell>
    </SchoolAdminSessionProvider>
  );
}