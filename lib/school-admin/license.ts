import type { SupabaseClient } from '@supabase/supabase-js';

// Shared license check — used by middleware (students) and by
// requireSchoolAdminSession (admins). When a teacher dashboard exists,
// its session guard should call this too.
export async function isSchoolLicenseActive(
  supabase: SupabaseClient,
  schoolId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('schools')
    .select('status, license_end')
    .eq('id', schoolId)
    .single();

  if (error || !data) return false;

  const expired = data.license_end != null && new Date(data.license_end) < new Date();
  return data.status === 'active' && !expired;
}