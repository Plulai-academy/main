// Luxury-mode design tokens for school & teacher dashboards.
// Depth / Reef / Pearl gold / Coral, as specified in the brand palette.

export const theme = {
  colors: {
    // Chrome — sidebar, topbar, dark surfaces
    depth: '#0D2B32',
    depthDeep: '#081C21',
    depthLine: 'rgba(212, 162, 76, 0.16)',
    onDepth: '#EAF3F1',
    onDepthMuted: '#8FAEAC',

    // Accents
    reef: '#1FB8A6',
    reefMuted: 'rgba(31, 184, 166, 0.16)',
    gold: '#D4A24C',
    goldMuted: 'rgba(212, 162, 76, 0.18)',
    coral: '#FF6B57',
    coralMuted: 'rgba(255, 107, 87, 0.16)',

    // "Ledger" — content surfaces (now dark, matching the luxury-mode dashboard)
    ledger: '#0D2B32',
    ledgerRaised: 'rgba(255, 255, 255, 0.035)',
    ledgerLine: 'rgba(234, 243, 241, 0.10)',
    ink: '#EAF3F1',
    inkMuted: '#8FAEAC',
    inkFaint: '#5E7C7A',
  },
font: {
    display: `'Sora', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
    mono: `'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace`,
  },
  radius: { sm: '6px', md: '10px', lg: '18px', pill: '999px' },
  shadow: {
    card: '0 1px 0 rgba(255,255,255,0.03) inset, 0 10px 30px rgba(0,0,0,0.25)',
    panel: '0 24px 70px rgba(0,0,0,0.45)',
    focus: '0 0 0 3px rgba(31,184,166,0.35)',
  },
} as const;

export type AppTheme = typeof theme;