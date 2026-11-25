// Shared stylesheet for the landing page and the About page.
// Placement: components/plulai-styles.ts
// No font-family is declared: text inherits your site font.

export const css = `
.pl-root {
  --pl-ink: #0D2B32; --pl-ink-2: #153B44; --pl-teal: #1FB8A6; --pl-teal-d: #12907F;
  --pl-gold: #D4A24C; --pl-cream: #F6F3EA; --pl-white: #FFFFFF; --pl-line: #E4E9E7;
  --pl-muted: #4F6B66; --pl-muted-d: #9DB5B0;
  --pl-shadow: 0 1px 2px rgba(13,43,50,.04), 0 12px 32px rgba(13,43,50,.07);
  --pl-shadow-lg: 0 2px 4px rgba(13,43,50,.05), 0 24px 56px rgba(13,43,50,.14);
  color: var(--pl-ink); background: var(--pl-cream);
}
.pl-root *, .pl-root *::before, .pl-root *::after { box-sizing: border-box; }
.pl-root button, .pl-root a { font-family: inherit; }
.pl-root :is(h1, h2, h3, h4) { color: inherit; }
.pl-root a:focus-visible, .pl-root button:focus-visible { outline: 3px solid var(--pl-teal); outline-offset: 3px; }
.pl-wrap { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
.pl-center { text-align: center; }

/* sections */
.pl-sec { padding: 104px 0; scroll-margin-top: 90px; position: relative; }
.pl-cream { background: var(--pl-cream); --fade: #F6F3EA; }
.pl-white { background: var(--pl-white); --fade: #FFFFFF; }
.pl-dark { background: var(--pl-ink); color: var(--pl-cream); overflow: hidden; }
.pl-flush { padding-bottom: 96px; }
.pl-head { max-width: 700px; margin: 0 auto 60px; text-align: center; }
.pl-head h2, .pl-h2 { font-size: clamp(30px, 4.2vw, 46px); font-weight: 800; line-height: 1.1; letter-spacing: -0.03em; margin: 0; }
.pl-head p, .pl-sub { font-size: 17.5px; line-height: 1.65; color: var(--pl-muted); margin: 18px 0 0; max-width: 520px; }
.pl-head p { margin-inline: auto; max-width: 580px; }
.pl-dark .pl-head p { color: var(--pl-muted-d); }
.pl-foot { text-align: center; font-size: 14.5px; color: var(--pl-muted); margin: 40px 0 0; line-height: 1.6; }
.pl-link { color: var(--pl-teal-d); font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }
.pl-kicker { text-align: center; font-size: 15px; font-weight: 600; color: var(--pl-muted); margin: 0 0 28px; }
.pl-tag { display: inline-block; font-size: 12.5px; font-weight: 700; padding: 6px 14px; border-radius: 999px; background: rgba(13,43,50,.07); color: var(--pl-muted); margin-bottom: 22px; }
.pl-tag-teal { background: rgba(31,184,166,.16); color: var(--pl-teal); }
.pl-glow { position: absolute; width: 720px; height: 720px; border-radius: 50%; top: -360px; left: 50%; transform: translateX(-50%); background: radial-gradient(circle, rgba(31,184,166,.22), transparent 65%); pointer-events: none; }
.pl-glow-sm { width: 420px; height: 420px; top: -200px; left: auto; right: -80px; transform: none; }

/* buttons */
.pl-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 13px 24px; border-radius: 999px; font-size: 15px; font-weight: 700; border: 1.5px solid transparent; cursor: pointer; text-decoration: none; transition: transform .15s ease, box-shadow .15s ease, background .15s ease, border-color .15s ease; }
.pl-btn:hover { transform: translateY(-2px); }
.pl-btn svg { transition: transform .15s ease; }
.pl-btn:hover svg { transform: translateX(3px); }
.pl-btn-primary { background: var(--pl-teal); color: var(--pl-ink); box-shadow: 0 8px 20px rgba(31,184,166,.32); }
.pl-btn-primary:hover { background: #2BD2BE; }
.pl-btn-dark { background: var(--pl-ink); color: var(--pl-cream); box-shadow: 0 8px 20px rgba(13,43,50,.22); }
.pl-btn-ghost { background: transparent; color: var(--pl-ink); border-color: rgba(13,43,50,.22); }
.pl-btn-ghost:hover { border-color: var(--pl-ink); }
.pl-btn-glass { background: rgba(255,255,255,.08); color: var(--pl-cream); border-color: rgba(255,255,255,.22); }
.pl-btn-glass:hover { background: rgba(255,255,255,.14); }
.pl-btn-sm { padding: 9px 18px; font-size: 14px; box-shadow: none; }
.pl-btn-lg { padding: 16px 30px; font-size: 16px; }
.pl-btn-block { width: 100%; }
.pl-row { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px; }

/* cards & grids */
.pl-card { background: var(--pl-white); border: 1px solid var(--pl-line); border-radius: 24px; padding: 30px 26px; box-shadow: var(--pl-shadow); }
.pl-white .pl-card { background: var(--pl-cream); border-color: transparent; box-shadow: none; }
.pl-card h3 { font-size: 19px; font-weight: 800; letter-spacing: -0.01em; margin: 0 0 10px; }
.pl-card p { font-size: 14.5px; line-height: 1.65; color: var(--pl-muted); margin: 0; }
.pl-grid { display: grid; gap: 22px; }
.pl-grid-3 { grid-template-columns: repeat(3, 1fr); }
.pl-grid-4 { grid-template-columns: repeat(4, 1fr); }
.pl-split { display: grid; grid-template-columns: 1.05fr 1fr; gap: 72px; align-items: center; }
.pl-check { display: inline-flex; flex-shrink: 0; width: 20px; height: 20px; margin-top: 2px; border-radius: 50%; align-items: center; justify-content: center; background: rgba(31,184,166,.16); color: var(--pl-teal-d); }
.pl-check.light { background: rgba(31,184,166,.2); color: var(--pl-teal); }

/* nav */
.pl-skip { position: absolute; left: -9999px; top: 0; z-index: 100; background: var(--pl-ink); color: var(--pl-cream); padding: 10px 18px; border-radius: 8px; font-weight: 700; }
.pl-skip:focus { left: 16px; top: 16px; }
.pl-navwrap { position: sticky; top: 0; z-index: 50; height: 0; }
.pl-nav { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 20px; max-width: 1072px; margin: 14px auto 0; padding: 9px 12px 9px 24px; border-radius: 999px; background: rgba(13,43,50,.78); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,.1); box-shadow: 0 10px 30px rgba(13,43,50,.25); }
.pl-logo { display: flex; align-items: center; background: #F6F3EA; border-radius: 999px; padding: 6px 14px; }
.pl-navlinks { display: flex; gap: 6px; }
.pl-navlinks a { color: #C9D8D5; font-size: 14.5px; font-weight: 600; text-decoration: none; padding: 8px 14px; border-radius: 999px; transition: background .15s ease, color .15s ease; }
.pl-navlinks a:hover { color: #fff; background: rgba(255,255,255,.08); }
.pl-navlinks a.on { color: var(--pl-ink); background: var(--pl-cream); }
.pl-navright { display: flex; align-items: center; gap: 14px; }
.pl-login { color: #C9D8D5; font-size: 14.5px; font-weight: 600; text-decoration: none; }
.pl-login:hover { color: #fff; }
.pl-lang { font-size: 14px; font-weight: 700; color: var(--pl-cream); text-decoration: none; padding: 7px 13px; border-radius: 999px; border: 1.5px solid rgba(255,255,255,.2); }
.pl-burger { display: none; width: 44px; height: 44px; background: none; border: 0; cursor: pointer; flex-direction: column; justify-content: center; gap: 5px; padding: 11px; }
.pl-burger span { display: block; height: 2px; background: var(--pl-cream); border-radius: 2px; transition: transform .2s ease, opacity .2s ease; }
.pl-burger .x1 { transform: translateY(7px) rotate(45deg); }
.pl-burger .x2 { opacity: 0; }
.pl-burger .x3 { transform: translateY(-7px) rotate(-45deg); }
.pl-mobile { display: none; flex-direction: column; gap: 2px; margin: 8px 16px 0; padding: 14px 20px 20px; border-radius: 24px; background: rgba(13,43,50,.96); box-shadow: 0 16px 40px rgba(13,43,50,.35); }
.pl-mobile a { color: var(--pl-cream); font-weight: 600; text-decoration: none; padding: 12px 0; }
.pl-mobile a.pl-btn { margin-top: 10px; color: var(--pl-ink); }

/* hero */
.pl-hero { position: relative; background: linear-gradient(160deg, #0D2B32 0%, #153B44 60%, #0F3A40 100%); color: var(--pl-cream); padding: 168px 0 168px; overflow: hidden; }
.pl-hero::before { content: ''; position: absolute; inset: 0; background-image: radial-gradient(rgba(246,243,234,.09) 1px, transparent 1px); background-size: 28px 28px; mask-image: radial-gradient(ellipse at 70% 40%, #000, transparent 70%); -webkit-mask-image: radial-gradient(ellipse at 70% 40%, #000, transparent 70%); }
.pl-hero::after { content: ''; position: absolute; width: 620px; height: 620px; border-radius: 50%; right: -120px; top: -120px; background: radial-gradient(circle, rgba(31,184,166,.28), transparent 65%); pointer-events: none; }
.pl-herogrid { position: relative; z-index: 1; display: grid; grid-template-columns: 1.1fr .9fr; gap: 48px; align-items: center; }
.pl-hero h1 { color: var(--pl-cream); font-size: clamp(38px, 5.6vw, 66px); font-weight: 800; line-height: 1.04; letter-spacing: -0.035em; margin: 0; }
.pl-lead { font-size: 18.5px; line-height: 1.65; color: #B7CCC8; max-width: 540px; margin: 24px 0 0; }
.pl-toggle { display: inline-flex; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12); border-radius: 999px; padding: 4px; margin-bottom: 30px; max-width: 100%; }
.pl-toggle button { border: 0; cursor: pointer; font-size: 13.5px; font-weight: 700; padding: 9px 18px; border-radius: 999px; background: transparent; color: #B7CCC8; transition: background .15s ease; }
.pl-toggle button[aria-selected='true'] { background: var(--pl-cream); color: var(--pl-ink); }
.pl-trust { list-style: none; display: flex; flex-wrap: wrap; gap: 10px 24px; padding: 0; margin: 34px 0 0; font-size: 14px; font-weight: 600; color: #C9D8D5; }
.pl-trust li { display: flex; align-items: center; gap: 8px; }
.pl-trust .pl-check { margin: 0; }
.pl-herovisual { position: relative; display: flex; justify-content: center; align-items: center; }
.pl-herovisual img { position: relative; max-width: 100%; height: auto; filter: drop-shadow(0 24px 40px rgba(0,0,0,.35)); }
.pl-orb { position: absolute; width: 82%; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle at 35% 30%, rgba(31,184,166,.5), rgba(31,184,166,.08) 70%); border: 1px solid rgba(255,255,255,.12); }
.pl-float { position: absolute; display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,.96); color: var(--pl-ink); border-radius: 16px; padding: 11px 16px; box-shadow: 0 16px 36px rgba(0,0,0,.28); }
.pl-float b { display: block; font-size: 13.5px; }
.pl-float small { font-size: 12px; color: var(--pl-muted); }
.pl-float-a { top: 8px; left: -4px; }
.pl-float-b { bottom: 28px; right: -4px; }
.pl-pearl { width: 16px; height: 16px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #fff, var(--pl-gold)); animation: pl-pulse 1.8s ease-in-out infinite; }
.pl-badge-ico { width: 28px; height: 28px; border-radius: 9px; background: var(--pl-teal); display: flex; align-items: center; justify-content: center; }
@keyframes pl-pulse { 50% { transform: scale(1.25); opacity: .75; } }

/* sheet that slides over the hero */
.pl-sheet { margin-top: -72px; border-radius: 44px 44px 0 0; padding-top: 80px; z-index: 2; }

/* marquees */
.pl-marquee { position: relative; overflow: hidden; }
.pl-marquee::before, .pl-marquee::after { content: ''; position: absolute; top: 0; bottom: 0; width: 100px; z-index: 2; pointer-events: none; }
.pl-marquee::before { left: 0; } .pl-marquee::after { right: 0; }
.pl-marquee::before { background: linear-gradient(90deg, var(--fade, #fff), transparent); }
.pl-marquee::after { background: linear-gradient(270deg, var(--fade, #fff), transparent); }
.pl-fade-dark::before { background: linear-gradient(90deg, var(--pl-ink), transparent); }
.pl-fade-dark::after { background: linear-gradient(270deg, var(--pl-ink), transparent); }
.pl-track { display: flex; gap: 16px; width: max-content; padding: 8px 0 14px; animation: pl-scroll var(--dur, 40s) linear infinite; }
.pl-marquee:hover .pl-track { animation-play-state: paused; }
@keyframes pl-scroll { to { transform: translateX(-50%); } }
.pl-logo-tile { flex: 0 0 auto; width: 160px; height: 84px; padding: 16px 24px; border-radius: 18px; border: 1px solid var(--pl-line); background: #fff; box-shadow: var(--pl-shadow); display: flex; align-items: center; justify-content: center; }
.pl-logo-tile img { filter: grayscale(1); opacity: .6; transition: filter .2s ease, opacity .2s ease; }
.pl-logo-tile:hover img { filter: none; opacity: 1; }

/* stats */
.pl-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 52px 0 0; }
.pl-stat { background: var(--pl-white); border-radius: 24px; padding: 30px 24px; text-align: center; box-shadow: var(--pl-shadow); }
.pl-stat dt { font-size: clamp(34px, 4vw, 48px); font-weight: 800; letter-spacing: -0.03em; color: var(--pl-ink); }
.pl-stat dd { margin: 4px 0 0; font-size: 14.5px; font-weight: 600; color: var(--pl-muted); }

/* pitch */
.pl-list { list-style: none; padding: 0; margin: 30px 0 0; display: flex; flex-direction: column; gap: 20px; }
.pl-list li { display: flex; gap: 14px; }
.pl-list b { display: block; font-size: 16px; margin-bottom: 2px; }
.pl-list span { font-size: 14.5px; color: var(--pl-muted); line-height: 1.55; }
.pl-dashwrap { position: relative; }
.pl-dashwrap::before { content: ''; position: absolute; inset: -24px; border-radius: 40px; background: radial-gradient(circle at 70% 30%, rgba(31,184,166,.25), transparent 65%); }
.pl-dash { position: relative; background: linear-gradient(160deg, var(--pl-ink), var(--pl-ink-2)); border-radius: 28px; padding: 28px; box-shadow: var(--pl-shadow-lg); color: var(--pl-cream); }
.pl-dots { display: flex; gap: 6px; margin-bottom: 20px; }
.pl-dots i { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,.2); }
.pl-dashtitle { font-weight: 800; font-size: 17px; margin: 0 0 22px; }
.pl-bar + .pl-bar { margin-top: 18px; }
.pl-barhead { display: flex; justify-content: space-between; font-size: 14px; color: #C9D8D5; margin-bottom: 8px; font-weight: 600; }
.pl-barhead em { font-style: normal; font-size: 11.5px; font-weight: 700; color: #402F12; background: var(--pl-gold); padding: 2px 8px; border-radius: 999px; margin-left: 8px; }
.pl-barbg { height: 8px; border-radius: 6px; background: rgba(255,255,255,.1); overflow: hidden; }
.pl-barbg div { height: 100%; border-radius: 6px; }

/* timeline (steps + path) */
.pl-timeline { list-style: none; padding: 0; margin: 0; position: relative; }
.pl-timeline::before { content: ''; position: absolute; top: 27px; left: 12%; right: 12%; height: 2px; background: repeating-linear-gradient(90deg, #BFD6D1 0 8px, transparent 8px 16px); }
.pl-step { position: relative; padding-top: 44px; }
.pl-node { position: absolute; top: -27px; left: 26px; width: 54px; height: 54px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; background: var(--pl-ink); color: var(--pl-cream); box-shadow: 0 0 0 6px var(--pl-cream), 0 10px 20px rgba(13,43,50,.2); }
.pl-white .pl-node { box-shadow: 0 0 0 6px var(--pl-white), 0 10px 20px rgba(13,43,50,.2); }
.pl-node-c { background: var(--c); color: #fff; }
.pl-step:has(.pl-node-c) { border-top: 0; }
.pl-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 18px; }
.pl-tags span { font-size: 12px; font-weight: 700; padding: 5px 11px; border-radius: 999px; background: rgba(13,43,50,.07); color: var(--pl-ink); }

/* projects */
.pl-proj { position: relative; margin: 0; flex: 0 0 auto; width: 260px; aspect-ratio: 4 / 3.3; border-radius: 22px; overflow: hidden; background: var(--pl-ink-2); border: 1px solid rgba(255,255,255,.12); transition: transform .25s ease, border-color .25s ease; }
.pl-proj:hover { transform: translateY(-6px); border-color: rgba(212,162,76,.6); }
.pl-proj::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 45%, rgba(8,28,33,.92)); }
.pl-pill { position: absolute; top: 12px; left: 12px; z-index: 2; font-size: 11.5px; font-weight: 700; padding: 4px 11px; border-radius: 999px; background: var(--pl-teal); color: var(--pl-ink); }
.pl-pill.gold { background: var(--pl-gold); color: #402F12; }
.pl-proj figcaption { position: absolute; left: 0; right: 0; bottom: 0; z-index: 2; padding: 14px 16px; }
.pl-proj b { display: block; font-size: 15px; color: #fff; }
.pl-proj small { display: block; margin-top: 3px; font-size: 12.5px; color: #B7CCC8; }

/* before / after */
.pl-ba { display: grid; grid-template-columns: 1fr auto 1fr; gap: 18px; align-items: stretch; max-width: 960px; margin: 0 auto; }
.pl-ba ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 16px; }
.pl-ba li { display: flex; gap: 12px; align-items: flex-start; font-size: 16px; line-height: 1.5; }
.pl-before li { color: var(--pl-muted); }
.pl-before li i { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #C5D3D0; flex-shrink: 0; margin-top: 2px; }
.pl-ba-arrow { align-self: center; width: 46px; height: 46px; border-radius: 50%; background: var(--pl-ink); color: var(--pl-teal); display: flex; align-items: center; justify-content: center; box-shadow: var(--pl-shadow); }
.pl-card.pl-after { background: linear-gradient(160deg, var(--pl-ink), var(--pl-ink-2)); border-color: transparent; color: var(--pl-cream); box-shadow: var(--pl-shadow-lg); }
.pl-after li { font-weight: 700; }

/* case study */
.pl-case { position: relative; overflow: hidden; display: grid; grid-template-columns: 1.1fr 1fr; gap: 56px; align-items: center; background: linear-gradient(160deg, var(--pl-ink), var(--pl-ink-2)); border-radius: 36px; padding: 60px 52px; box-shadow: var(--pl-shadow-lg); }
.pl-case .pl-h2 { font-size: clamp(26px, 3.4vw, 38px); }
.pl-casestats { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.pl-casestats > div { background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.1); border-radius: 20px; padding: 22px 18px; }
.pl-casestats b { display: block; font-size: 36px; font-weight: 800; letter-spacing: -0.03em; color: var(--pl-teal); margin-bottom: 6px; }
.pl-casestats span { font-size: 13px; line-height: 1.45; color: #B7CCC8; }

/* pricing */
.pl-plans { align-items: stretch; }
.pl-plan { position: relative; display: flex; flex-direction: column; padding: 34px 28px; }
.pl-plan small { font-size: 13.5px; font-weight: 700; color: var(--pl-teal-d); }
.pl-plan > p { margin: 12px 0 22px; }
.pl-plan ul { list-style: none; padding: 0; margin: 0 0 28px; display: flex; flex-direction: column; gap: 12px; flex: 1; }
.pl-plan li { display: flex; gap: 10px; font-size: 14.5px; }
.pl-card.pl-plan.hi { background: linear-gradient(160deg, var(--pl-ink), var(--pl-ink-2)); border-color: rgba(212,162,76,.45); color: var(--pl-cream); box-shadow: var(--pl-shadow-lg); transform: translateY(-8px); }
.pl-plan.hi p, .pl-plan.hi li { color: #C9D8D5; }
.pl-plan.hi small { color: var(--pl-teal); }
.pl-flag { position: absolute; top: -13px; left: 28px; font-size: 12px; font-weight: 800; padding: 5px 14px; border-radius: 999px; background: var(--pl-gold); color: #402F12; }
.pl-single { max-width: 420px; margin: 0 auto; text-align: center; padding-top: 44px; }
.pl-single li { text-align: left; }
.pl-single .pl-flag { left: 50%; transform: translateX(-50%); }
.pl-price { font-size: 15px; color: #C9D8D5 !important; margin: 0 0 4px !important; }
.pl-price b { font-size: 52px; font-weight: 800; letter-spacing: -0.03em; color: var(--pl-cream); }
.pl-single small { margin-bottom: 26px; }

/* testimonials, security, faq */
.pl-quote { position: relative; margin: 0; display: flex; flex-direction: column; justify-content: space-between; gap: 26px; padding-top: 48px; }
.pl-qmark { position: absolute; top: 12px; left: 24px; font-size: 72px; line-height: 1; font-weight: 800; color: var(--pl-teal); opacity: .5; }
.pl-quote blockquote { margin: 0; font-size: 17.5px; line-height: 1.6; font-weight: 600; }
.pl-quote figcaption { display: flex; align-items: center; gap: 12px; }
.pl-quote b { display: block; font-size: 14.5px; }
.pl-quote small { font-size: 13px; color: var(--pl-muted); }
.pl-avatar { width: 42px; height: 42px; border-radius: 50%; background: var(--pl-ink); color: var(--pl-cream); display: flex; align-items: center; justify-content: center; font-weight: 800; }
.pl-icon { display: flex; width: 42px; height: 42px; border-radius: 12px; background: rgba(31,184,166,.16); align-items: center; justify-content: center; margin-bottom: 16px; }
.pl-faq { max-width: 780px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px; }
.pl-faqitem { background: #fff; border: 1px solid var(--pl-line); border-radius: 18px; overflow: hidden; box-shadow: var(--pl-shadow); transition: border-color .2s ease; }
.pl-white .pl-faqitem { background: var(--pl-cream); border-color: transparent; box-shadow: none; }
.pl-faqitem.open { border-color: rgba(31,184,166,.5); }
.pl-faqitem button { width: 100%; text-align: left; background: none; border: 0; cursor: pointer; padding: 20px 22px; display: flex; justify-content: space-between; align-items: center; gap: 12px; font-size: 16px; font-weight: 700; color: var(--pl-ink); }
.pl-faqitem button span { flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; line-height: 1; background: rgba(31,184,166,.16); color: var(--pl-teal-d); transition: transform .2s ease; }
.pl-faqitem.open button span { transform: rotate(45deg); }
.pl-faqitem p { margin: 0; padding: 0 22px 22px; font-size: 15px; line-height: 1.7; color: var(--pl-muted); }

/* final CTA + footer */
.pl-final { position: relative; overflow: hidden; text-align: center; background: linear-gradient(160deg, var(--pl-ink), var(--pl-ink-2)); color: var(--pl-cream); border-radius: 40px; padding: 84px 32px; box-shadow: var(--pl-shadow-lg); }
.pl-final h2 { font-size: clamp(30px, 4.4vw, 48px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; margin: 0; }
.pl-final p { font-size: 18px; color: #B7CCC8; max-width: 520px; margin: 18px auto 0; line-height: 1.6; }
.pl-footer { background: var(--pl-ink); color: var(--pl-cream); }
.pl-footgrid { display: grid; grid-template-columns: 1.6fr repeat(3, 1fr); gap: 40px; padding: 64px 0 44px; }
.pl-wordmark { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; margin: 0 0 10px; }
.pl-footnote { font-size: 14.5px; color: var(--pl-muted-d); line-height: 1.6; max-width: 280px; margin: 0; }
.pl-footer h4 { font-size: 14px; font-weight: 800; margin: 0 0 14px; color: var(--pl-cream); }
.pl-footer a { display: block; color: var(--pl-muted-d); font-size: 14.5px; text-decoration: none; padding: 5px 0; }
.pl-footer a:hover { color: var(--pl-cream); }
.pl-footbottom { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; padding: 24px 0 36px; border-top: 1px solid rgba(255,255,255,.1); font-size: 13px; color: var(--pl-muted-d); }

/* responsive */
@media (max-width: 1000px) {
  .pl-grid-4 { grid-template-columns: repeat(2, 1fr); }
  .pl-timeline::before { display: none; }
  .pl-step { margin-top: 20px; }
  .pl-navlinks, .pl-navright { display: none; }
  .pl-burger { display: flex; }
  .pl-mobile { display: flex; }
  .pl-nav { margin: 12px 16px 0; padding: 7px 8px 7px 14px; }
}
@media (max-width: 800px) {
  .pl-sec { padding: 76px 0; }
  .pl-hero { padding: 128px 0 132px; }
  .pl-herogrid, .pl-split, .pl-case { grid-template-columns: 1fr; }
  .pl-split { gap: 48px; }
  .pl-grid-3, .pl-stats { grid-template-columns: 1fr; }
  .pl-herovisual { order: -1; max-width: 300px; margin: 0 auto; }
  .pl-ba { grid-template-columns: 1fr; }
  .pl-ba-arrow { transform: rotate(90deg); margin: 0 auto; }
  .pl-case { padding: 40px 26px; }
  .pl-card.pl-plan.hi { transform: none; }
  .pl-footgrid { grid-template-columns: 1fr 1fr; }
  .pl-sheet { border-radius: 32px 32px 0 0; }
}
@media (max-width: 520px) {
  .pl-grid-4, .pl-casestats { grid-template-columns: 1fr; }
  .pl-toggle { flex-direction: column; border-radius: 18px; width: 100%; }
  .pl-btn-lg { width: 100%; }
  .pl-float-a { left: -8px; } .pl-float-b { right: -8px; }
  .pl-final { padding: 56px 22px; border-radius: 30px; }
}
@media (prefers-reduced-motion: reduce) {
  .pl-track, .pl-pearl { animation: none; }
  .pl-btn, .pl-proj { transition: none; }
}
/* ---- v3 additions ---- */
.pl-grad { background: linear-gradient(90deg, #4FE0CD, #F0C46E); -webkit-background-clip: text; background-clip: text; color: transparent; }
.pl-float-b { bottom: 110px; right: -10px; }
.pl-mission { position: absolute; left: -14px; bottom: -12px; width: 240px; padding: 14px 16px; border-radius: 18px; background: rgba(255,255,255,.97); color: var(--pl-ink); box-shadow: 0 18px 40px rgba(0,0,0,.3); }
.pl-mission small { display: block; font-size: 11.5px; font-weight: 700; color: var(--pl-teal-d); margin-bottom: 2px; }
.pl-mission b { display: block; font-size: 15px; margin-bottom: 10px; }
.pl-mission .meta { display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; color: var(--pl-muted); margin-bottom: 7px; }
.pl-mbar { height: 7px; border-radius: 6px; background: #E4E9E7; overflow: hidden; }
.pl-mbar div { height: 100%; width: 60%; border-radius: 6px; background: var(--pl-teal); }

/* proof panel */
.pl-proof { margin-top: 56px; background: #fff; border-radius: 32px; padding: 46px 40px 32px; box-shadow: var(--pl-shadow-lg); }
.pl-proofhead { text-align: center; margin-bottom: 38px; }
.pl-proofhead h3 { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; margin: 0; }
.pl-proofhead p { margin: 6px 0 0; font-size: 15px; color: var(--pl-muted); }
.pl-proof .pl-stats { margin: 0; gap: 0; }
.pl-proof .pl-stat { background: none; box-shadow: none; border-radius: 0; padding: 4px 32px; text-align: left; display: flex; flex-direction: column; }
.pl-proof .pl-stat + .pl-stat { border-left: 1px solid var(--pl-line); }
.pl-statico { width: 48px; height: 48px; border-radius: 15px; background: rgba(31,184,166,.14); color: var(--pl-teal-d); display: flex; align-items: center; justify-content: center; margin-bottom: 18px; }
.pl-statnum { font-size: clamp(42px, 5vw, 62px); font-weight: 800; letter-spacing: -0.04em; line-height: 1; color: var(--pl-ink); font-variant-numeric: tabular-nums; }
.pl-statlabel { display: block; margin-top: 10px; font-size: 16.5px; font-weight: 800; }
.pl-stat p { margin: 4px 0 0; font-size: 14px; line-height: 1.5; color: var(--pl-muted); }
.pl-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 36px; padding-top: 26px; border-top: 1px solid var(--pl-line); }
.pl-chip { display: inline-flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 700; padding: 8px 15px; border-radius: 999px; background: var(--pl-cream); }
.pl-chip i { width: 7px; height: 7px; border-radius: 50%; background: var(--pl-teal); }

/* path: interactive stages */
.pl-path { max-width: 980px; margin: 0 auto; }
.pl-pathtabs { position: relative; display: grid; grid-template-columns: repeat(4, 1fr); margin-bottom: 40px; }
.pl-pathtabs::before { content: ''; position: absolute; top: 27px; left: 12.5%; right: 12.5%; height: 3px; border-radius: 2px; background: #D5E3E0; }
.pl-pathtab { position: relative; background: none; border: 0; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 0; color: var(--pl-muted); font-size: 15.5px; font-weight: 700; }
.pl-pathnode { position: relative; z-index: 1; width: 54px; height: 54px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 19px; font-weight: 800; background: #fff; color: var(--pl-muted); border: 3px solid #D5E3E0; transition: transform .2s ease, background .2s ease, border-color .2s ease, box-shadow .2s ease; }
.pl-pathtab:hover .pl-pathnode { border-color: var(--c); }
.pl-pathtab.done .pl-pathnode, .pl-pathtab.on .pl-pathnode { background: var(--c); border-color: var(--c); color: var(--fg); }
.pl-pathtab.on .pl-pathnode { transform: scale(1.12); box-shadow: 0 0 0 7px color-mix(in srgb, var(--c) 22%, transparent); }
.pl-pathtab.on .pl-pathname { color: var(--pl-ink); }
.pl-panel { display: grid; grid-template-columns: 1.1fr 1fr; gap: 20px; background: #fff; border-radius: 34px; padding: 14px; box-shadow: var(--pl-shadow-lg); animation: pl-in .35s ease; }
.pl-white .pl-panel { background: var(--pl-cream); box-shadow: none; }
.pl-panelcopy { padding: 34px 30px 30px 34px; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; }
.pl-panelcopy h3 { font-size: clamp(36px, 5vw, 54px); font-weight: 800; letter-spacing: -0.035em; line-height: 1; margin: 0 0 16px; }
.pl-panelsub { font-size: 17.5px; line-height: 1.65; color: var(--pl-muted); margin: 0 0 28px; }
.pl-panelvis { position: relative; overflow: hidden; border-radius: 24px; background: var(--c); color: var(--fg); padding: 34px 30px; display: flex; flex-direction: column; justify-content: flex-end; min-height: 330px; }
.pl-panelvis::before { content: ''; position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,.22) 1.4px, transparent 1.6px); background-size: 22px 22px; mask-image: linear-gradient(160deg, #000, transparent 70%); -webkit-mask-image: linear-gradient(160deg, #000, transparent 70%); }
.pl-bignum { position: absolute; top: 4px; right: 22px; font-size: 128px; font-weight: 800; line-height: 1; letter-spacing: -0.05em; opacity: .2; }
.pl-skillhead { position: relative; font-size: 13.5px; font-weight: 700; opacity: .8; margin: 0 0 12px; }
.pl-panelvis ul { position: relative; list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.pl-panelvis li { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 16px; background: rgba(255,255,255,.22); font-weight: 700; font-size: 15.5px; }
.pl-panelvis .pl-check { margin: 0; background: rgba(255,255,255,.35); color: inherit; }
@keyframes pl-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

/* projects on light background */
.pl-proj { border: 0; box-shadow: var(--pl-shadow); }
.pl-proj:hover { box-shadow: var(--pl-shadow-lg); }

/* whatsapp button */
.pl-btn-wa { background: #25D366; color: #06361A; box-shadow: 0 8px 20px rgba(37,211,102,.35); }
.pl-btn-wa:hover { background: #2EE274; }

/* final CTA headline colour: change --pl-final-title to taste */
.pl-final { --pl-final-title: #E9B95F; }
.pl-final h2 { color: var(--pl-final-title); }

@media (max-width: 800px) {
  .pl-proof { padding: 34px 22px 24px; border-radius: 26px; }
  .pl-proof .pl-stats { grid-template-columns: 1fr; gap: 28px; }
  .pl-proof .pl-stat { padding: 0; }
  .pl-proof .pl-stat + .pl-stat { border-left: 0; border-top: 1px solid var(--pl-line); padding-top: 28px; }
  .pl-panel { grid-template-columns: 1fr; }
  .pl-panelcopy { padding: 24px 18px 8px; }
  .pl-bignum { font-size: 92px; }
}
@media (max-width: 520px) {
  .pl-pathname { font-size: 13px; }
  .pl-pathnode { width: 44px; height: 44px; font-size: 16px; }
  .pl-pathtabs::before { top: 22px; }
  .pl-mission { display: none; }
  .pl-float-b { bottom: 40px; }
}
@media (prefers-reduced-motion: reduce) {
  .pl-panel { animation: none; }
}
/* ---- v4: proof bento + security ---- */
.pl-proofhead { margin: 44px auto 0; }
.pl-bento { margin-top: 36px; display: grid; grid-template-columns: 1.15fr 1fr; grid-template-rows: auto auto; gap: 20px; }
.pl-bcard { position: relative; overflow: hidden; background: #fff; border: 1px solid var(--pl-line); border-radius: 30px; padding: 32px 30px; box-shadow: var(--pl-shadow); }
.pl-bnum { display: block; font-size: clamp(48px, 6vw, 72px); font-weight: 800; letter-spacing: -0.045em; line-height: 1; font-variant-numeric: tabular-nums; color: var(--pl-ink); }
.pl-blabel { display: block; margin-top: 12px; font-size: 18px; font-weight: 800; }
.pl-bcard p { margin: 6px 0 0; font-size: 14.5px; line-height: 1.55; color: var(--pl-muted); }
.pl-bcard-main { grid-row: span 2; display: flex; flex-direction: column; justify-content: space-between; min-height: 400px; padding: 42px 38px; border: 0; color: var(--pl-cream); background: linear-gradient(160deg, var(--pl-ink), var(--pl-ink-2)); box-shadow: var(--pl-shadow-lg); }
.pl-bcard-main::before { content: ''; position: absolute; inset: 0; background-image: radial-gradient(rgba(246,243,234,.1) 1.4px, transparent 1.6px); background-size: 24px 24px; mask-image: radial-gradient(ellipse at 80% 20%, #000, transparent 70%); -webkit-mask-image: radial-gradient(ellipse at 80% 20%, #000, transparent 70%); }
.pl-bcard-main::after { content: ''; position: absolute; width: 420px; height: 420px; right: -140px; top: -160px; border-radius: 50%; background: radial-gradient(circle, rgba(31,184,166,.35), transparent 65%); }
.pl-bcard-main .pl-bnum { font-size: clamp(76px, 11vw, 132px); background: linear-gradient(90deg, #4FE0CD, #F0C46E); -webkit-background-clip: text; background-clip: text; color: transparent; }
.pl-bcard-main p { color: #B7CCC8; max-width: 300px; }
.pl-ages { position: relative; z-index: 1; margin-top: 36px; }
.pl-ages small { display: block; font-size: 13px; font-weight: 700; color: #B7CCC8; margin-bottom: 12px; }
.pl-agetrack { height: 10px; border-radius: 6px; background: linear-gradient(90deg, #FF6B57, #D4A24C, #1FB8A6); }
.pl-agelabels { display: flex; justify-content: space-between; margin-top: 10px; font-size: 13px; font-weight: 800; color: var(--pl-cream); }
.pl-stagechips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; }
.pl-stagechips span { display: inline-flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 700; padding: 6px 12px; border-radius: 999px; background: var(--pl-cream); }
.pl-stagechips i { width: 8px; height: 8px; border-radius: 50%; background: var(--c); }
.pl-logostack { display: flex; margin-top: 22px; }
.pl-logostack span { width: 46px; height: 46px; padding: 8px; border-radius: 50%; background: #fff; box-shadow: 0 0 0 2px #fff, 0 0 0 3px var(--pl-line); margin-left: -10px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.pl-logostack span:first-child { margin-left: 0; }
.pl-logostack .more { background: var(--pl-ink); color: var(--pl-cream); font-size: 12.5px; font-weight: 800; padding: 0; box-shadow: 0 0 0 2px #fff; }

.pl-secwrap { display: grid; grid-template-columns: 5fr 7fr; gap: 24px; align-items: stretch; }
.pl-seccard { position: relative; overflow: hidden; display: flex; flex-direction: column; border-radius: 32px; padding: 44px 38px; color: var(--pl-cream); background: linear-gradient(160deg, var(--pl-ink), var(--pl-ink-2)); box-shadow: var(--pl-shadow-lg); }
.pl-seccard::after { content: ''; position: absolute; width: 380px; height: 380px; right: -140px; top: -140px; border-radius: 50%; background: radial-gradient(circle, rgba(31,184,166,.32), transparent 65%); }
.pl-seccard > * { position: relative; z-index: 1; }
.pl-shield { width: 68px; height: 68px; border-radius: 22px; display: flex; align-items: center; justify-content: center; color: var(--pl-teal); background: rgba(31,184,166,.16); border: 1px solid rgba(31,184,166,.4); margin-bottom: 28px; }
.pl-seccard h2 { font-size: clamp(28px, 3.4vw, 38px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; margin: 0 0 14px; }
.pl-seccard > p { font-size: 16.5px; line-height: 1.6; color: #B7CCC8; margin: 0 0 26px; }
.pl-seccard ul { list-style: none; padding: 0; margin: 0 0 34px; display: flex; flex-direction: column; gap: 14px; font-size: 15px; font-weight: 700; }
.pl-seccard li { display: flex; align-items: center; gap: 12px; }
.pl-seccard li .pl-check { margin: 0; }
.pl-seccard .pl-btn { margin-top: auto; align-self: flex-start; }
.pl-secgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.pl-seccell { display: flex; flex-direction: column; background: #fff; border: 1px solid var(--pl-line); border-radius: 26px; padding: 28px 24px; box-shadow: var(--pl-shadow); transition: transform .2s ease, box-shadow .2s ease; }
.pl-seccell:hover { transform: translateY(-4px); box-shadow: var(--pl-shadow-lg); }
.pl-white .pl-seccell { background: var(--pl-cream); border-color: transparent; box-shadow: none; }
.pl-secico { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: var(--c); background: color-mix(in srgb, var(--c) 14%, transparent); margin-bottom: 20px; }
.pl-seccell small { font-size: 12.5px; font-weight: 700; color: var(--pl-muted); margin-bottom: 6px; }
.pl-seccell h3 { font-size: 18px; font-weight: 800; letter-spacing: -0.01em; margin: 0 0 8px; }
.pl-seccell p { font-size: 14.5px; line-height: 1.6; color: var(--pl-muted); margin: 0; }

@media (max-width: 1000px) {
  .pl-secwrap { grid-template-columns: 1fr; }
}
@media (max-width: 800px) {
  .pl-bento { grid-template-columns: 1fr; }
  .pl-bcard-main { grid-row: auto; min-height: 340px; padding: 34px 26px; }
  .pl-seccard { padding: 36px 26px; }
}
@media (max-width: 520px) {
  .pl-secgrid { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .pl-seccell { transition: none; }
}
/* ---- v5: compact proof ---- */
.pl-sheet { padding-bottom: 72px; }
.pl-proofhead { margin-top: 32px; }
.pl-proofhead h3 { font-size: 22px; }
.pl-bento { margin-top: 24px; gap: 14px; }
.pl-bcard { padding: 22px 24px; border-radius: 24px; }
.pl-bnum { font-size: clamp(36px, 4.4vw, 50px); }
.pl-blabel { margin-top: 8px; font-size: 16px; }
.pl-bcard p { font-size: 13.5px; }
.pl-bcard-main { min-height: 0; padding: 28px 28px; }
.pl-bcard-main .pl-bnum { font-size: clamp(56px, 8vw, 88px); }
.pl-ages { margin-top: 22px; }
.pl-ages small { margin-bottom: 8px; font-size: 12.5px; }
.pl-agetrack { height: 8px; }
.pl-agelabels { margin-top: 8px; font-size: 12.5px; }
.pl-logostack { margin-top: 14px; }
.pl-logostack span { width: 40px; height: 40px; padding: 7px; }
.pl-chips { margin-top: 24px; padding-top: 0; border-top: 0; }
@media (max-width: 800px) {
  .pl-bcard-main { min-height: 0; padding: 26px 22px; }
}
/* ---- v6: slim proof strip ---- */
.pl-sheet { padding-bottom: 56px; }
.pl-strip { margin-top: 26px; display: grid; grid-template-columns: repeat(3, 1fr); border-radius: 22px; overflow: hidden; color: var(--pl-cream); background: linear-gradient(160deg, var(--pl-ink), var(--pl-ink-2)); box-shadow: var(--pl-shadow-lg); }
.pl-sitem { display: flex; align-items: center; gap: 14px; padding: 18px 24px; min-width: 0; }
.pl-sitem + .pl-sitem { border-left: 1px solid rgba(255,255,255,.1); }
.pl-snum { font-size: clamp(30px, 3.4vw, 40px); font-weight: 800; letter-spacing: -0.04em; line-height: 1; font-variant-numeric: tabular-nums; }
.pl-snum-grad { background: linear-gradient(90deg, #4FE0CD, #F0C46E); -webkit-background-clip: text; background-clip: text; color: transparent; }
.pl-slab b { display: block; font-size: 14.5px; font-weight: 800; }
.pl-slab small { display: block; margin-top: 2px; font-size: 12.5px; color: var(--pl-muted-d); }
.pl-strip .pl-logostack { margin: 0 0 0 auto; }
.pl-strip .pl-logostack span { width: 32px; height: 32px; padding: 5px; margin-left: -8px; }
.pl-strip .pl-logostack span:first-child { margin-left: 0; }
.pl-strip .pl-logostack .more { background: var(--pl-teal); color: var(--pl-ink); font-size: 11.5px; padding: 0; }
.pl-chips { margin-top: 18px; gap: 8px; }
.pl-chip { font-size: 12.5px; padding: 6px 12px; }
@media (max-width: 800px) {
  .pl-strip { grid-template-columns: 1fr; }
  .pl-sitem + .pl-sitem { border-left: 0; border-top: 1px solid rgba(255,255,255,.1); }
}
/* ---- v7: rollout steps + light security card ---- */
.pl-roll { list-style: none; padding: 0; margin: 0 auto; max-width: 980px; position: relative; display: flex; flex-direction: column; gap: 30px; }
.pl-roll::before { content: ''; position: absolute; top: 28px; bottom: 28px; left: 50%; width: 3px; transform: translateX(-50%); background: repeating-linear-gradient(180deg, #BFD6D1 0 8px, transparent 8px 16px); }
.pl-rstep { position: relative; display: grid; grid-template-columns: 1fr 64px 1fr; align-items: center; }
.pl-rtext { order: 1; padding: 8px 14px 8px 0; }
.pl-rnode { order: 2; justify-self: center; position: relative; z-index: 1; width: 54px; height: 54px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 19px; font-weight: 800; background: var(--pl-ink); color: var(--pl-cream); box-shadow: 0 0 0 7px var(--pl-cream), 0 10px 20px rgba(13,43,50,.2); }
.pl-white .pl-rnode { box-shadow: 0 0 0 7px #fff, 0 10px 20px rgba(13,43,50,.2); }
.pl-rprev { order: 3; background: linear-gradient(160deg, var(--pl-ink), var(--pl-ink-2)); color: var(--pl-cream); border-radius: 24px; padding: 22px 24px; box-shadow: var(--pl-shadow-lg); }
.pl-rstep:nth-child(even) .pl-rtext { order: 3; padding: 8px 0 8px 14px; }
.pl-rstep:nth-child(even) .pl-rprev { order: 1; }
.pl-rchip { display: inline-block; font-size: 12.5px; font-weight: 700; padding: 5px 12px; border-radius: 999px; margin-bottom: 12px; background: rgba(31,184,166,.16); color: var(--pl-teal-d); }
.pl-rtext h3 { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; margin: 0 0 8px; }
.pl-rtext p { font-size: 16px; line-height: 1.65; color: var(--pl-muted); margin: 0; max-width: 400px; }
.pl-rprev h4 { font-size: 15px; font-weight: 800; margin: 0 0 16px; }
.pl-rprev .pl-bar + .pl-bar { margin-top: 14px; }
.pl-cal { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-bottom: 12px; }
.pl-cal span { aspect-ratio: 1; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; background: rgba(255,255,255,.08); color: #B7CCC8; }
.pl-cal span.on { background: var(--pl-teal); color: var(--pl-ink); }
.pl-mrow { display: flex; justify-content: space-between; align-items: center; padding: 11px 0; border-top: 1px solid rgba(255,255,255,.1); font-size: 13.5px; font-weight: 600; color: #C9D8D5; }
.pl-mrow .ok { color: var(--pl-teal); font-weight: 800; }
@media (max-width: 800px) {
  .pl-roll::before { left: 27px; transform: none; }
  .pl-rstep { grid-template-columns: 54px 1fr; column-gap: 18px; align-items: start; }
  .pl-rnode { grid-column: 1; grid-row: 1; }
  .pl-rtext, .pl-rstep:nth-child(even) .pl-rtext { grid-column: 2; grid-row: 1; padding: 4px 0 0; }
  .pl-rprev, .pl-rstep:nth-child(even) .pl-rprev { grid-column: 2; grid-row: 2; margin-top: 16px; }
}

.pl-seccard { color: var(--pl-ink); background: linear-gradient(160deg, #E8F6F3, #F6F3EA); border: 1px solid rgba(31,184,166,.28); box-shadow: var(--pl-shadow); }
.pl-seccard::after { background: radial-gradient(circle, rgba(31,184,166,.2), transparent 65%); }
.pl-shield { color: var(--pl-teal-d); background: #fff; border: 1px solid rgba(31,184,166,.35); box-shadow: 0 8px 20px rgba(31,184,166,.18); }
.pl-seccard > p { color: var(--pl-muted); }
/* ---- v8: rollout as one clean four-column card ---- */
.pl-flow { max-width: 1040px; margin: 0 auto; overflow: hidden; border-radius: 30px; background: #fff; box-shadow: var(--pl-shadow-lg); }
.pl-white .pl-flow { background: var(--pl-cream); box-shadow: none; }
.pl-flowgrid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, 1fr); }
.pl-fstep { display: flex; flex-direction: column; }
.pl-fbar { height: 6px; background: var(--c); }
.pl-fbody { display: flex; flex-direction: column; flex: 1; padding: 28px 24px 26px; }
.pl-fstep + .pl-fstep .pl-fbody { border-left: 1px solid var(--pl-line); }
.pl-white .pl-fstep + .pl-fstep .pl-fbody { border-left-color: rgba(13,43,50,.1); }
.pl-fnum { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 18px; font-size: 17px; font-weight: 800; color: var(--pl-ink); background: color-mix(in srgb, var(--c) 18%, transparent); }
.pl-fbody h3 { font-size: 19px; font-weight: 800; letter-spacing: -0.01em; margin: 0 0 10px; }
.pl-fbody p { flex: 1; font-size: 14.5px; line-height: 1.65; color: var(--pl-muted); margin: 0; }
.pl-fchip { align-self: flex-start; margin-top: 22px; font-size: 12.5px; font-weight: 700; padding: 5px 12px; border-radius: 999px; color: var(--pl-ink); background: color-mix(in srgb, var(--c) 18%, transparent); }
.pl-flowfoot { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; padding: 18px 28px; color: var(--pl-cream); background: linear-gradient(160deg, var(--pl-ink), var(--pl-ink-2)); }
.pl-flowfoot p { margin: 0; font-size: 15px; font-weight: 600; }
@media (max-width: 1000px) {
  .pl-flowgrid { grid-template-columns: 1fr 1fr; }
  .pl-fstep:nth-child(3) .pl-fbody { border-left: 0; }
}
@media (max-width: 560px) {
  .pl-flowgrid { grid-template-columns: 1fr; }
  .pl-fstep + .pl-fstep .pl-fbody { border-left: 0; }
}
/* ---- v9: founder + footer entity ---- */
.pl-who { display: grid; grid-template-columns: 5fr 7fr; gap: 44px; align-items: center; background: #fff; border-radius: 36px; padding: 16px; box-shadow: var(--pl-shadow-lg); }
.pl-white .pl-who { background: var(--pl-cream); box-shadow: none; }
.pl-whophoto { position: relative; overflow: hidden; border-radius: 26px; aspect-ratio: 4 / 4.4; display: flex; align-items: center; justify-content: center; background: linear-gradient(160deg, var(--pl-ink), var(--pl-ink-2)); }
.pl-whophoto::before { content: ''; position: absolute; inset: 0; background-image: radial-gradient(rgba(246,243,234,.12) 1.4px, transparent 1.6px); background-size: 24px 24px; mask-image: radial-gradient(ellipse at 70% 20%, #000, transparent 70%); -webkit-mask-image: radial-gradient(ellipse at 70% 20%, #000, transparent 70%); }
.pl-whophoto::after { content: ''; position: absolute; width: 360px; height: 360px; right: -120px; top: -120px; border-radius: 50%; background: radial-gradient(circle, rgba(31,184,166,.35), transparent 65%); }
.pl-initials { position: relative; z-index: 1; font-size: clamp(84px, 12vw, 150px); font-weight: 800; letter-spacing: -0.05em; background: linear-gradient(90deg, #4FE0CD, #F0C46E); -webkit-background-clip: text; background-clip: text; color: transparent; }
.pl-whobadge { position: absolute; z-index: 2; left: 18px; bottom: 18px; font-size: 13px; font-weight: 800; padding: 8px 15px; border-radius: 999px; background: rgba(255,255,255,.96); color: var(--pl-ink); }
.pl-whocopy { padding: 16px 30px 16px 0; }
.pl-whocopy .pl-h2 { font-size: clamp(32px, 4.4vw, 48px); }
.pl-frole { margin: 10px 0 0; font-size: 16px; font-weight: 700; color: var(--pl-teal-d); }
.pl-whocopy .pl-sub { max-width: 540px; }
.pl-whochips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 22px; }
.pl-whochips .pl-chip { background: rgba(31,184,166,.14); }
@media (max-width: 800px) {
  .pl-who { grid-template-columns: 1fr; gap: 8px; }
  .pl-whophoto { aspect-ratio: 16 / 10; }
  .pl-whocopy { padding: 20px 14px 18px; }
}
.pl-entity { display: flex; gap: 10px; align-items: flex-start; margin: 22px 0 0; max-width: 320px; font-size: 13px; line-height: 1.5; color: var(--pl-muted-d); }
.pl-entity svg { flex-shrink: 0; margin-top: 2px; color: var(--pl-teal); }
.pl-entity b { display: block; font-size: 14px; color: var(--pl-cream); }
/* ---- v10: richer founder block ---- */
.pl-who { align-items: stretch; }
.pl-whophoto { aspect-ratio: auto; min-height: 460px; }
.pl-whocopy { padding: 22px 30px 22px 0; }
.pl-hl { list-style: none; padding: 0; margin: 24px 0 0; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.pl-hl li { display: flex; flex-direction: column; gap: 2px; padding: 14px 16px; border: 1px solid rgba(13,43,50,.1); border-radius: 16px; }
.pl-hl b { font-size: 15px; font-weight: 800; }
.pl-hl span { font-size: 13px; color: var(--pl-muted); }
.pl-learnlabel { margin: 22px 0 10px; font-size: 13px; font-weight: 700; color: var(--pl-muted); }
.pl-learnlabel + .pl-whochips { margin-top: 0; }
@media (max-width: 800px) {
  .pl-whophoto { min-height: 240px; aspect-ratio: auto; }
  .pl-whocopy { padding: 20px 14px 18px; }
}
@media (max-width: 520px) {
  .pl-hl { grid-template-columns: 1fr; }
}

/* ---- v11: pitch section (both audiences) ---- */
.pl-pitch { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
.pl-feats { display: flex; flex-direction: column; gap: 14px; }
.pl-feat { display: flex; gap: 16px; align-items: flex-start; padding: 20px 22px; border-radius: 22px; background: #fff; border: 1px solid var(--pl-line); box-shadow: var(--pl-shadow); transition: transform .2s ease, box-shadow .2s ease; }
.pl-feat:hover { transform: translateY(-3px); box-shadow: var(--pl-shadow-lg); }
.pl-white .pl-feat { background: var(--pl-cream); border-color: transparent; box-shadow: none; }
.pl-feat .ico { flex-shrink: 0; width: 48px; height: 48px; border-radius: 15px; display: flex; align-items: center; justify-content: center; color: var(--c); background: color-mix(in srgb, var(--c) 14%, transparent); }
.pl-feat b { display: block; font-size: 16.5px; font-weight: 800; margin-bottom: 3px; }
.pl-feat .t { font-size: 14.5px; line-height: 1.55; color: var(--pl-muted); }
.pl-pitch .pl-row { margin-top: 28px; }

.pl-weekcard { position: relative; overflow: hidden; border-radius: 30px; padding: 28px; color: var(--pl-cream); background: linear-gradient(160deg, var(--pl-ink), var(--pl-ink-2)); box-shadow: var(--pl-shadow-lg); }
.pl-weekcard::after { content: ''; position: absolute; width: 360px; height: 360px; right: -140px; top: -150px; border-radius: 50%; background: radial-gradient(circle, rgba(31,184,166,.3), transparent 65%); }
.pl-weekcard > * { position: relative; z-index: 1; }
.pl-live { display: flex; align-items: center; gap: 14px; padding: 18px 20px; border-radius: 20px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.14); }
.pl-liveico { flex-shrink: 0; width: 48px; height: 48px; border-radius: 15px; display: flex; align-items: center; justify-content: center; background: var(--pl-teal); color: var(--pl-ink); }
.pl-live b { display: block; font-size: 17px; font-weight: 800; }
.pl-live small { display: block; margin-top: 2px; font-size: 13px; color: #B7CCC8; }
.pl-livetime { margin-left: auto; text-align: right; font-size: 24px; font-weight: 800; letter-spacing: -0.03em; color: #4FE0CD; line-height: 1; }
.pl-livetime small { margin-top: 4px; }
.pl-weeklabel { margin: 26px 0 14px; display: flex; align-items: center; gap: 12px; font-size: 13.5px; font-weight: 700; color: #B7CCC8; }
.pl-weeklabel::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,.14); }
.pl-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; align-items: end; }
.pl-day { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 8px; height: 104px; }
.pl-day i { display: block; width: 100%; border-radius: 10px; background: linear-gradient(180deg, var(--pl-teal), rgba(31,184,166,.3)); }
.pl-day small { font-size: 12px; font-weight: 700; color: #9DB5B0; }
.pl-weeknote { margin: 18px 0 0; font-size: 14px; line-height: 1.55; color: #C9D8D5; }
@media (max-width: 900px) {
  .pl-pitch { grid-template-columns: 1fr; gap: 32px; }
}
@media (max-width: 520px) {
  .pl-live { flex-wrap: wrap; }
  .pl-livetime { margin-left: 62px; text-align: left; }
}

/* ---- v11: about page ---- */
.pl-aboutTop { padding-top: 132px; }
.pl-rows { max-width: 860px; margin: 0 auto; }
.pl-rowitem { display: grid; grid-template-columns: 190px 1fr; gap: 24px; padding: 26px 0; border-top: 1px solid rgba(13,43,50,.12); }
.pl-rowitem:last-child { border-bottom: 1px solid rgba(13,43,50,.12); }
.pl-rowitem .when { font-size: 14px; font-weight: 700; color: var(--pl-teal-d); padding-top: 3px; }
.pl-rowitem h3 { font-size: 19px; font-weight: 800; letter-spacing: -0.01em; margin: 0 0 4px; }
.pl-rowitem p { margin: 0; font-size: 15px; line-height: 1.6; color: var(--pl-muted); }
.pl-twocol { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
.pl-certs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
.pl-listcard ul { list-style: none; padding: 0; margin: 18px 0 0; display: flex; flex-direction: column; gap: 12px; }
.pl-listcard li { display: flex; gap: 12px; font-size: 14.5px; line-height: 1.5; }
.pl-skills { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 34px; }
.pl-skills .pl-chip { background: rgba(31,184,166,.13); }
@media (max-width: 800px) {
  .pl-rowitem { grid-template-columns: 1fr; gap: 6px; }
  .pl-twocol, .pl-certs { grid-template-columns: 1fr; }
  .pl-aboutTop { padding-top: 112px; }
}
`