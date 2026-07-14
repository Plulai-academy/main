import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSchoolLicenseActive } from '@/lib/school-admin/license';
import type { SchoolAdminSession } from '@/types/schoolAdmin';

export async function requireSchoolAdminSession(): Promise<SchoolAdminSession> {
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
    .eq('role', 'school_admin')
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
  };
}

export async function getSchoolNameServer(schoolId: string): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.from('schools').select('name').eq('id', schoolId).single();
  if (error) throw error;
  return data.name;
}