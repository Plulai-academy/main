import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSchoolLicenseActive } from '@/lib/school-admin/license';
import type { TeacherSession } from '@/types/teacher';

export async function requireTeacherSession(): Promise<TeacherSession> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: staffRow, error: staffErr } = await supabase
    .from('school_staff')
    .select('id, school_id, role')
    .eq('profile_id', user.id)
    .in('role', ['teacher', 'school_admin'])
    .maybeSingle();

  if (staffErr) throw staffErr;

  if (!staffRow) {
    redirect('/dashboard');
  }

  const licenseOk = await isSchoolLicenseActive(supabase, staffRow.school_id);
  if (!licenseOk) {
    redirect('/license-expired');
  }

  return {
    schoolId: staffRow.school_id,
    staffId: staffRow.id,
    userId: user.id,
    role: staffRow.role as 'teacher' | 'school_admin',
  };
}