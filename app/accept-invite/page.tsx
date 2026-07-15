'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface InviteDetails {
  email: string;
  role: string;
  schoolName: string;
  expired: boolean;
  alreadyAccepted: boolean;
}

function AcceptInviteContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token');

  const [details, setDetails] = useState<InviteDetails | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null | undefined>(undefined);
  const [accepting, setAccepting] = useState(false);
  const [acceptErr, setAcceptErr] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoadErr('This invite link is missing its token.');
      return;
    }
    fetch(`/api/school-admin/invite-details?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setLoadErr(data.error);
        else setDetails(data);
      })
      .catch(() => setLoadErr('Could not load this invite.'));
  }, [token]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
  }, []);

  async function handleAccept() {
    if (!token) return;
    setAccepting(true);
    setAcceptErr(null);
    try {
      const res = await fetch('/api/school-admin/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not accept invite');
      router.push(data.role === 'school_admin' ? '/school-admin' : '/teacher');
    } catch (err: any) {
      setAcceptErr(err.message ?? 'Something went wrong. Try again.');
    } finally {
      setAccepting(false);
    }
  }

  const wrapStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0D2B32',
    color: '#EAF3F1',
    fontFamily: 'Inter, -apple-system, sans-serif',
    padding: 24,
  };
  const cardStyle: React.CSSProperties = {
    maxWidth: 420,
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(234,243,241,0.10)',
    borderRadius: 18,
    padding: 32,
    textAlign: 'center',
  };
  const buttonStyle: React.CSSProperties = {
    display: 'inline-block',
    marginTop: 20,
    padding: '12px 28px',
    background: '#D4A24C',
    color: '#0D2B32',
    fontWeight: 700,
    border: 'none',
    borderRadius: 999,
    cursor: 'pointer',
    fontSize: 14,
  };

  if (loadErr) {
    return (
      <div style={wrapStyle}>
        <div style={cardStyle}>
          <h2>Invite not available</h2>
          <p style={{ color: '#8FAEAC' }}>{loadErr}</p>
        </div>
      </div>
    );
  }

  if (!details || userEmail === undefined) {
    return (
      <div style={wrapStyle}>
        <div style={cardStyle}>Loading your invite…</div>
      </div>
    );
  }

  if (details.alreadyAccepted) {
    return (
      <div style={wrapStyle}>
        <div style={cardStyle}>
          <h2>Already accepted</h2>
          <p style={{ color: '#8FAEAC' }}>This invite has already been used. Try signing in instead.</p>
        </div>
      </div>
    );
  }

  if (details.expired) {
    return (
      <div style={wrapStyle}>
        <div style={cardStyle}>
          <h2>This invite has expired</h2>
          <p style={{ color: '#8FAEAC' }}>Ask your school admin to send you a new one.</p>
        </div>
      </div>
    );
  }

  if (userEmail === null) {
    const redirectTo = encodeURIComponent(`/accept-invite?token=${token}`);
    return (
      <div style={wrapStyle}>
        <div style={cardStyle}>
          <h2>Join {details.schoolName}</h2>
          <p style={{ color: '#8FAEAC' }}>
            You've been invited as a {details.role === 'school_admin' ? 'school admin' : 'teacher'}. Sign in or create an
            account with <strong>{details.email}</strong> to accept.
          </p>
          <a href={`/auth/login?redirectTo=${redirectTo}`} style={{ ...buttonStyle, textDecoration: 'none' }}>
            Sign in
          </a>
          <div style={{ marginTop: 12 }}>
            <a href={`/auth/signup?redirectTo=${redirectTo}`} style={{ color: '#1FB8A6', fontSize: 13 }}>
              Don't have an account? Sign up
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (userEmail.toLowerCase() !== details.email.toLowerCase()) {
    return (
      <div style={wrapStyle}>
        <div style={cardStyle}>
          <h2>Wrong account</h2>
          <p style={{ color: '#8FAEAC' }}>
            This invite was sent to <strong>{details.email}</strong>, but you're signed in as {userEmail}. Sign out
            and try again with the invited email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={wrapStyle}>
      <div style={cardStyle}>
        <h2>Join {details.schoolName}</h2>
        <p style={{ color: '#8FAEAC' }}>You've been invited as a {details.role === 'school_admin' ? 'school admin' : 'teacher'}.</p>
        {acceptErr && <p style={{ color: '#FF6B57', fontSize: 13 }}>{acceptErr}</p>}
        <button style={buttonStyle} onClick={handleAccept} disabled={accepting}>
          {accepting ? 'Joining…' : 'Accept invite'}
        </button>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0D2B32',
            color: '#EAF3F1',
          }}
        >
          Loading…
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}