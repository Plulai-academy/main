// File: NavIcons.tsx
// Placement: components/brand/NavIcons.tsx
//
// Small inline icon set for DashboardNav — replaces the /icons/*.png
// references, which don't exist in the new brand. All use currentColor
// so active/inactive opacity styling on the parent Link keeps working
// without needing separate colored variants.

type IconProps = { className?: string }

export function HomeIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M3 9 L10 3 L17 9 V16 A1 1 0 0 1 16 17 H4 A1 1 0 0 1 3 16 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

export function PathIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M4 16 Q7 10 10 10 Q13 10 16 4" stroke="currentColor" strokeWidth="1.4" opacity="0.4" />
      <circle cx="4" cy="16" r="2.4" fill="currentColor" />
      <circle cx="10" cy="10" r="2.4" fill="currentColor" />
      <circle cx="16" cy="4" r="2.4" fill="currentColor" />
    </svg>
  )
}

export function CoachIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M3 4 h14 v9 h-7 l-3.5 3.5 V13 H3 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

export function ChallengesIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="10" cy="10" r="1" fill="currentColor" />
    </svg>
  )
}

export function ShopIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M5 7 L6.5 3 H13.5 L15 7 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="4" y="7" width="12" height="9.5" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

export function BadgesIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="8" r="5" fill="currentColor" opacity="0.9" />
      <path d="M7 12 L5 17 L10 15 L15 17 L13 12" fill="currentColor" opacity="0.9" />
    </svg>
  )
}

export function LeaderboardIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <rect x="3" y="11" width="4" height="6" fill="currentColor" />
      <rect x="8" y="6" width="4" height="11" fill="currentColor" />
      <rect x="13" y="9" width="4" height="8" fill="currentColor" />
    </svg>
  )
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4M15.3 15.3l-1.4-1.4M6.1 6.1L4.7 4.7"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
      />
    </svg>
  )
}

export function CoinIcon({ className }: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className={className}>
      <circle cx="9" cy="9" r="7" fill="currentColor" />
      <circle cx="9" cy="9" r="4.5" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
    </svg>
  )
}

export function PricingIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M8 2 L14 5.5 V10.5 L8 14 L2 10.5 V5.5 Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}

export function SignOutIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M6 2 H3 a1 1 0 0 0 -1 1 V13 a1 1 0 0 0 1 1 H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 5 L14 8 L10 11 M14 8 H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}