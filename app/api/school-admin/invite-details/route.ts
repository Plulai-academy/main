import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  const supabase = createAdminClient();
  const { data: invite, error } = await supabase
    .from('staff_invites')
    .select('email, role, expires_at, accepted_at, schools(name)')
    .eq('token', token)
    .maybeSingle();

  if (error) return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  if (!invite) return NextResponse.json({ error: 'Invite not found' }, { status: 404 });

  const expired = new Date(invite.expires_at) < new Date();

  return NextResponse.json({
    email: invite.email,
    role: invite.role,
    schoolName: (invite as any).schools?.name ?? 'your school',
    expired,
    alreadyAccepted: invite.accepted_at != null,
  });
}