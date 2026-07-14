import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendStaffInviteEmail(params: {
  to: string;
  schoolName: string;
  role: 'teacher' | 'school_admin';
  token: string;
}) {
  const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?token=${params.token}`;

  await resend.emails.send({
    from: 'Plulai <noreply@plulai.com>',
    to: params.to,
    subject: `You've been invited to join ${params.schoolName} on Plulai`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#0D2B32;">You're invited to ${params.schoolName}</h2>
        <p style="color:#5B6E6C;">
          You've been invited to join as a ${params.role === 'school_admin' ? 'school admin' : 'teacher'} on Plulai.
        </p>
        <a href="${acceptUrl}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#0D2B32;color:#fff;text-decoration:none;border-radius:999px;font-weight:600;">
          Accept invite
        </a>
        <p style="color:#93A5A3;font-size:12px;margin-top:24px;">
          This invite expires in 7 days. If you didn't expect this, you can ignore this email.
        </p>
      </div>
    `,
  });
}