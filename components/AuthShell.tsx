// File: AuthShell.tsx
// Placement: components/AuthShell.tsx
// Shared by app/auth/login/page.tsx and app/auth/signup/page.tsx:
// the dark brand panel, the mobile logo, and the auth stylesheet.
// No font is set anywhere, so text inherits your site font.

import Link from 'next/link'
import Image from 'next/image'

export function AuthAside({ title, text, points }: { title: string; text: string; points?: string[] }) {
  return (
    <aside className="pl-aside">
      <Link href="/" className="pl-pill-logo" aria-label="Plulai home">
        <Image src="/logo.png" alt="Plulai" width={132} height={36} priority style={{ height: 'auto', width: 'auto', maxHeight: 32 }} />
      </Link>

      <div className="pl-asidebody">
        <h1>{title}</h1>
        <p>{text}</p>
        {points && (
          <ul className="pl-points">
            {points.map((t) => (
              <li key={t}>
                <span className="dot" aria-hidden>
                  <svg width={12} height={12} viewBox="0 0 16 16"><path d="M3 8.5l3.2 3.2L13 4.8" stroke="currentColor" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                {t}
              </li>
            ))}
          </ul>
        )}

        <div className="pl-mascot">
          <div className="pl-orb" aria-hidden />
          <Image src="/avatars/heroplulai.png" alt="Marjan the camel, Plulai's mascot" width={300} height={300} priority />
          <div className="pl-chipcard">
            <span className="pl-pearl" />
            <div><b>4-pearl streak</b><small>One more today</small></div>
          </div>
        </div>
      </div>

      <dl className="pl-asidestats">
        <div><dt>20,000+</dt><dd>Kids reached</dd></div>
        <div><dt>500+</dt><dd>Missions</dd></div>
        <div><dt>11+</dt><dd>Partners in MENA</dd></div>
      </dl>
    </aside>
  )
}

export function AuthMobileLogo() {
  return (
    <Link href="/" className="pl-mobilelogo" aria-label="Plulai home">
      <Image src="/logo.png" alt="Plulai" width={132} height={36} priority style={{ height: 'auto', width: 'auto', maxHeight: 34 }} />
    </Link>
  )
}

export const authCss = `
.pl-auth {
  --ink: #0D2B32; --ink2: #153B44; --teal: #1FB8A6; --teal-d: #12907F; --gold: #D4A24C;
  --cream: #F6F3EA; --line: #D9E2DF; --muted: #4F6B66; --coral: #E5533D;
  min-height: 100vh; display: grid; grid-template-columns: 1.05fr 1fr; background: var(--cream); color: var(--ink);
}
.pl-auth *, .pl-auth *::before, .pl-auth *::after { box-sizing: border-box; }
.pl-auth a:focus-visible, .pl-auth button:focus-visible, .pl-auth input:focus-visible { outline: 3px solid var(--teal); outline-offset: 2px; }

/* brand panel */
.pl-aside { position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; gap: 32px; padding: 40px 56px; color: var(--cream); background: linear-gradient(160deg, #0D2B32 0%, #153B44 60%, #0F3A40 100%); }
.pl-aside::before { content: ''; position: absolute; inset: 0; background-image: radial-gradient(rgba(246,243,234,.09) 1px, transparent 1px); background-size: 28px 28px; mask-image: radial-gradient(ellipse at 70% 40%, #000, transparent 70%); -webkit-mask-image: radial-gradient(ellipse at 70% 40%, #000, transparent 70%); }
.pl-aside::after { content: ''; position: absolute; width: 560px; height: 560px; right: -160px; top: -140px; border-radius: 50%; background: radial-gradient(circle, rgba(31,184,166,.3), transparent 65%); pointer-events: none; }
.pl-aside > * { position: relative; z-index: 1; }
.pl-pill-logo { align-self: flex-start; display: inline-flex; align-items: center; padding: 8px 18px; border-radius: 999px; background: var(--cream); }
.pl-asidebody h1 { margin: 0; color: var(--cream); font-size: clamp(38px, 4.6vw, 58px); font-weight: 800; line-height: 1.05; letter-spacing: -0.035em; }
.pl-asidebody p { margin: 14px 0 0; max-width: 360px; font-size: 18px; line-height: 1.6; color: #B7CCC8; }
.pl-mascot { position: relative; display: flex; justify-content: center; margin-top: 28px; }
.pl-mascot img { position: relative; max-width: 100%; height: auto; filter: drop-shadow(0 24px 40px rgba(0,0,0,.35)); }
.pl-orb { position: absolute; top: 4%; width: 78%; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle at 35% 30%, rgba(31,184,166,.5), rgba(31,184,166,.08) 70%); border: 1px solid rgba(255,255,255,.12); }
.pl-chipcard { position: absolute; left: 4%; bottom: 10%; display: flex; align-items: center; gap: 10px; padding: 11px 16px; border-radius: 16px; background: rgba(255,255,255,.96); color: var(--ink); box-shadow: 0 16px 36px rgba(0,0,0,.28); }
.pl-chipcard b { display: block; font-size: 13.5px; }
.pl-chipcard small { font-size: 12px; color: var(--muted); }
.pl-pearl { width: 16px; height: 16px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #fff, var(--gold)); animation: pl-pulse 1.8s ease-in-out infinite; }
@keyframes pl-pulse { 50% { transform: scale(1.25); opacity: .75; } }
.pl-asidestats { display: flex; gap: 32px; margin: 0; padding-top: 24px; border-top: 1px solid rgba(255,255,255,.12); }
.pl-asidestats dt { font-size: 26px; font-weight: 800; letter-spacing: -0.03em; background: linear-gradient(90deg, #4FE0CD, #F0C46E); -webkit-background-clip: text; background-clip: text; color: transparent; }
.pl-asidestats dd { margin: 2px 0 0; font-size: 13px; font-weight: 600; color: #9DB5B0; }

/* form side */
.pl-main { display: flex; align-items: center; justify-content: center; padding: 40px 24px; }
.pl-formwrap { width: 100%; max-width: 430px; }
.pl-mobilelogo { display: none; margin-bottom: 24px; }
.pl-card { background: #fff; border-radius: 28px; padding: 36px 34px 30px; box-shadow: 0 2px 4px rgba(13,43,50,.05), 0 24px 56px rgba(13,43,50,.12); }
.pl-card h2 { margin: 0; color: var(--ink); font-size: 30px; font-weight: 800; letter-spacing: -0.03em; }
.pl-sub { margin: 6px 0 26px; font-size: 15.5px; color: var(--muted); }

.pl-gbtn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 13px 18px; border-radius: 999px; border: 1.5px solid var(--line); background: #fff; color: var(--ink); font-size: 15px; font-weight: 700; cursor: pointer; transition: border-color .15s ease, background .15s ease; }
.pl-gbtn:hover:not(:disabled) { border-color: var(--ink); background: #FAFBFA; }
.pl-gbtn:disabled, .pl-submit:disabled { opacity: .7; cursor: not-allowed; }
.pl-or { display: flex; align-items: center; gap: 14px; margin: 22px 0; font-size: 13px; font-weight: 600; color: #7A918D; }
.pl-or::before, .pl-or::after { content: ''; flex: 1; height: 1px; background: #E4E9E7; }

.pl-field { margin-bottom: 18px; }
.pl-field label { display: block; margin-bottom: 7px; font-size: 14px; font-weight: 700; }
.pl-field input { width: 100%; padding: 13px 16px; border: 1.5px solid var(--line); border-radius: 14px; background: #fff; color: var(--ink); font-size: 15.5px; transition: border-color .15s ease, box-shadow .15s ease; }
.pl-field input::placeholder { color: #9DB0AC; }
.pl-field input:focus { outline: none; border-color: var(--teal); box-shadow: 0 0 0 4px rgba(31,184,166,.18); }
.pl-field input.err { border-color: var(--coral); }
.pl-field input.err:focus { box-shadow: 0 0 0 4px rgba(229,83,61,.15); }
.pl-pw { position: relative; }
.pl-pw input { padding-right: 48px; }
.pl-eye { position: absolute; top: 50%; right: 8px; transform: translateY(-50%); width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border: 0; border-radius: 10px; background: none; color: #6F8782; cursor: pointer; }
.pl-eye:hover { color: var(--ink); background: #F1F5F4; }
.pl-err { margin: 6px 2px 0; font-size: 13px; font-weight: 600; color: var(--coral); }
.pl-server { margin: 4px 0 16px; padding: 12px 14px; border-radius: 12px; font-size: 14px; font-weight: 600; line-height: 1.45; color: #9B2F1E; background: #FDEDEA; border: 1px solid #F6C9C0; }

.pl-submit { width: 100%; display: flex; align-items: center; justify-content: center; min-height: 50px; margin-top: 6px; padding: 14px 20px; border: 0; border-radius: 999px; background: var(--teal); color: var(--ink); font-size: 16px; font-weight: 800; cursor: pointer; box-shadow: 0 8px 20px rgba(31,184,166,.32); transition: transform .15s ease, background .15s ease; }
.pl-submit:hover:not(:disabled) { background: #2BD2BE; transform: translateY(-1px); }
.pl-foot { margin: 22px 0 0; text-align: center; font-size: 14.5px; color: var(--muted); }
.pl-foot a { color: var(--teal-d); font-weight: 800; text-decoration: underline; text-underline-offset: 3px; }
.pl-back { margin: 20px 0 0; text-align: center; font-size: 14px; font-weight: 600; }
.pl-back a { color: var(--muted); text-decoration: none; }
.pl-back a:hover { color: var(--ink); }

.pl-spin { width: 20px; height: 20px; border-radius: 50%; border: 2.5px solid rgba(13,43,50,.25); border-top-color: var(--ink); animation: pl-spin .7s linear infinite; }
.pl-spin-dark { border-color: rgba(13,43,50,.15); border-top-color: var(--ink); }
@keyframes pl-spin { to { transform: rotate(360deg); } }

@media (max-width: 960px) {
  .pl-auth { grid-template-columns: 1fr; }
  .pl-aside { display: none; }
  .pl-mobilelogo { display: inline-flex; }
  .pl-main { align-items: flex-start; padding: 32px 18px 40px; }
  .pl-formwrap { max-width: 460px; }
}
@media (max-width: 420px) {
  .pl-card { padding: 28px 22px 24px; border-radius: 24px; }
}
@media (prefers-reduced-motion: reduce) {
  .pl-pearl, .pl-spin { animation: none; }
  .pl-submit { transition: none; }
}

/* aside extras */
.pl-points { list-style: none; margin: 24px 0 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.pl-points li { display: flex; align-items: center; gap: 12px; font-size: 15.5px; font-weight: 600; color: #C9D8D5; }
.pl-points .dot { flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(31,184,166,.2); color: var(--teal); }

/* signup extras */
.pl-two { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.pl-hint { margin: 6px 2px 0; font-size: 12.5px; color: #7A918D; }
.pl-opt { font-weight: 500; color: #7A918D; }
.pl-codebox { margin: 4px 0 18px; padding: 16px 16px 14px; border-radius: 18px; border: 1.5px dashed rgba(31,184,166,.55); background: #EFF9F7; }
.pl-codebox b { display: block; font-size: 14.5px; }
.pl-codebox p { margin: 4px 0 12px; font-size: 13px; line-height: 1.5; color: var(--muted); }
.pl-codebox input { width: 100%; padding: 12px 14px; border: 1.5px solid var(--line); border-radius: 12px; background: #fff; color: var(--ink); font-size: 15px; }
.pl-codebox input:focus { outline: none; border-color: var(--teal); box-shadow: 0 0 0 4px rgba(31,184,166,.18); }
.pl-agree { display: flex; align-items: flex-start; gap: 10px; margin: 4px 0 6px; cursor: pointer; font-size: 13px; line-height: 1.55; color: var(--muted); }
.pl-agree input { flex-shrink: 0; width: 18px; height: 18px; margin-top: 2px; accent-color: var(--teal); cursor: pointer; }
.pl-agree a { color: var(--teal-d); font-weight: 700; text-decoration: underline; text-underline-offset: 2px; }
.pl-valuerow { display: none; flex-wrap: wrap; justify-content: center; gap: 8px; margin: 18px 0 0; }
.pl-valuerow span { font-size: 12.5px; font-weight: 700; padding: 6px 12px; border-radius: 999px; background: #fff; border: 1px solid #E4E9E7; }
.pl-success { text-align: center; padding-top: 44px; }
.pl-successicon { width: 72px; height: 72px; margin: 0 auto 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--teal); box-shadow: 0 0 0 8px rgba(31,184,166,.18); }
.pl-success h2 { margin-bottom: 10px; }
.pl-success p { margin: 0 0 28px; font-size: 15.5px; line-height: 1.6; color: var(--muted); }
.pl-linkbtn { display: flex; align-items: center; justify-content: center; min-height: 50px; padding: 14px 20px; border-radius: 999px; background: var(--teal); color: var(--ink); font-size: 16px; font-weight: 800; text-decoration: none; box-shadow: 0 8px 20px rgba(31,184,166,.32); }
.pl-linkbtn:hover { background: #2BD2BE; }
@media (max-width: 960px) { .pl-valuerow { display: flex; } }
@media (max-width: 520px) { .pl-two { grid-template-columns: 1fr; gap: 0; } }
`