import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { AdminSession } from '@/types/admin';

export async function requireAdminSession(): Promise<AdminSession> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (error) throw error;

  if (!profile?.is_admin) {
    redirect('/dashboard');
  }

  return { userId: user.id };
}