// File: brand.ts
// Placement: lib/brand.ts
//
// Mirrors the tokens in globals.css/page.module.css for parts of the app
// that use Tailwind + inline styles instead of CSS Modules (like the
// dashboard). If the palette ever changes, this is the one place to edit
// for anything using inline style={{ }} with a brand color.

export const BRAND = {
  depth: '#0D2B32',      // deep sea navy — dashboard/app background
  ink: '#081D22',        // deepest variant, reserve for rare emphasis

  coral: '#FF6B57',      // the ONE call-to-action color — buttons only
  coralDark: '#C94433',  // pressed/shadow state for coral buttons

  gold: '#D4A24C',       // luxury-mode pearl/reward gold
  sungold: '#FFB930',    // energetic-mode reward gold — streaks, XP, badges
  sungoldText: '#4A3403',// dark text for readability on sungold backgrounds

  reef: '#1FB8A6',       // luxury-mode teal
  reefBright: '#17D9C0', // energetic-mode teal — progress bars, "done" states

  pearlwhite: '#F6F3EA',
  lagoon: '#EAF7F4',
} as const