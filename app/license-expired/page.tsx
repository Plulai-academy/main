export default function LicenseExpiredPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0D2B32',
        color: '#EAF3F1',
        fontFamily: 'Inter, -apple-system, sans-serif',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 420 }}>
        <h1 style={{ fontSize: 24, marginBottom: 12, fontWeight: 600 }}>Your school's license has expired</h1>
        <p style={{ color: '#8FAEAC', lineHeight: 1.6 }}>
          Access to the school admin dashboard is paused until your license is renewed. Contact your Plulai account
          manager to reactivate it.
        </p>
      </div>
    </div>
  );
}