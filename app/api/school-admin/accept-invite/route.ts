import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  const admin = createAdminClient();

  const { data: invite, error: inviteErr } = await admin
    .from('staff_invites')
    .select('id, school_id, email, role, expires_at, accepted_at')
    .eq('token', token)
    .maybeSingle();

  if (inviteErr) return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  if (!invite) return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
  if (invite.accepted_at) return NextResponse.json({ error: 'Invite already used' }, { status: 409 });
  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Invite has expired' }, { status: 410 });
  }
  if (invite.email.toLowerCase() !== user.email?.toLowerCase()) {
    return NextResponse.json({ error: 'This invite was sent to a different email address' }, { status: 403 });
  }

  // staff_invites.role uses 'admin' | 'teacher', but school_staff.role uses
  // 'school_admin' | 'teacher' (different check constraints — same mismatch
  // we hit earlier). Map between them here.
  const staffRole = invite.role;

  const { data: existing } = await admin
    .from('school_staff')
    .select('id')
    .eq('school_id', invite.school_id)
    .eq('profile_id', user.id)
    .maybeSingle();

  if (!existing) {
    const { error: staffErr } = await admin
      .from('school_staff')
      .insert({ school_id: invite.school_id, profile_id: user.id, role: staffRole });
    if (staffErr) return NextResponse.json({ error: staffErr.message }, { status: 500 });
  }

  await admin.from('staff_invites').update({ accepted_at: new Date().toISOString() }).eq('id', invite.id);

return NextResponse.json({ ok: true, schoolId: invite.school_id, role: staffRole });
}