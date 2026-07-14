import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendStaffInviteEmail } from '@/lib/resend';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { inviteId } = await req.json();

  const { data: invite, error } = await supabase
    .from('staff_invites')
    .select('email, role, token, schools(name)')
    .eq('id', inviteId)
    .single();

  if (error || !invite) return NextResponse.json({ error: 'Invite not found' }, { status: 404 });

  try {
    await sendStaffInviteEmail({
      to: invite.email,
      schoolName: (invite as any).schools?.name ?? 'your school',
      role: invite.role as 'teacher' | 'school_admin',
      token: invite.token,
    });
  } catch (err) {
    console.error('Failed to send invite email', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}