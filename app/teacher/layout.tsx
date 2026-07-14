import { ReactNode } from 'react';
import { requireTeacherSession } from '@/lib/school-admin/teacher-session';
import { getSchoolNameServer } from '@/lib/school-admin/session';
import { TeacherSessionProvider } from '@/components/teacher/TeacherSessionContext';
import { TeacherDashboardShell } from '@/components/teacher/TeacherDashboardShell';

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  const session = await requireTeacherSession();
  const schoolName = await getSchoolNameServer(session.schoolId);

  return (
    <TeacherSessionProvider session={session}>
      <TeacherDashboardShell schoolName={schoolName}>{children}</TeacherDashboardShell>
    </TeacherSessionProvider>
  );
}