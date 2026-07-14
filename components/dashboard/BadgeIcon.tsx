import React from 'react'

type BadgeIconKind =
  | 'streak-3' | 'lessons-5' | 'code-runner' | 'py-starter' | 'first-lesson' | 'xp-100'
  | 'oop-arch' | 'ml-starter' | 'xp-500' | 'lessons-10' | 'streak-7' | 'api-hero'
  | 'ai-deployer' | 'xp-1000' | 'lessons-25' | 'dream-builder' | 'early-bird' | 'bias-buster'
  | 'gcc-star' | 'ai-engineer' | 'entrepreneur' | 'code-master' | 'ai-pioneer' | 'streak-30' | 'py-developer'

const ICON_PATHS: Record<BadgeIconKind, string> = {
  'streak-3':      'M13 2c1 3-2 4-2 7a3 3 0 1 0 6 0c1 1 2 3 2 5a7 7 0 1 1-14 0c0-4 3-5 4-8 0 1 .5 2 1.5 2C11 6 12 4 13 2Z',
  'streak-7':      'M13 2c1 3-2 4-2 7a3 3 0 1 0 6 0c1 1 2 3 2 5a7 7 0 1 1-14 0c0-4 3-5 4-8 0 1 .5 2 1.5 2C11 6 12 4 13 2Z',
  'streak-30':     'M12 3a9 9 0 1 0 8.9 10.4A7 7 0 0 1 12 3Z',
  'lessons-5':     'M5 4a2 2 0 0 1 2-2h11v17H7a2 2 0 0 0-2 2V4Zm2 14h9V4H7v14Z',
  'lessons-10':    'M12 2 1 8l11 6 9-4.9V17h2V8L12 2Zm-7 9.2V16c0 2 3.1 4 7 4s7-2 7-4v-4.8l-7 3.8-7-3.8Z',
  'lessons-25':    'M4 3h6a3 3 0 0 1 3 3v14a2.5 2.5 0 0 0-2.5-2.5H4V3Zm16 0h-6a3 3 0 0 0-3 3v14a2.5 2.5 0 0 1 2.5-2.5H20V3Z',
  'code-runner':   'M8 5v14l11-7L8 5Z',
  'py-starter':    'M11 18h2v2h-2v-2Zm1-14a5 5 0 0 0-5 5h2a3 3 0 1 1 4.5 2.6c-.9.55-1.5 1.5-1.5 2.4v1h2v-1c0-.4.3-.85.8-1.15A5 5 0 0 0 12 4Z',
  'first-lesson':  'M9.5 16.6 4.9 12l-1.4 1.4 6 6L21 7.9l-1.4-1.4z',
  'xp-100':        'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 3a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm0 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z',
  'xp-500':        'M12 2.5l2.9 6.1 6.6.7-4.9 4.6 1.4 6.5L12 17.3l-6 3.1 1.4-6.5L2.5 9.3l6.6-.7L12 2.5Z',
  'xp-1000':       'M4 8l3-4 5 3 5-3 3 4-2 3v6a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-6L4 8Zm8 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z',
  'oop-arch':      'M6.7 3 3 6.7l3 3 1.4-1.4-1.6-1.6 1.6-1.6L6.7 3Zm10.6 0-1.4 1.4 1.6 1.6-1.6 1.6 1.4 1.4 3-3-3-3ZM12 6l-3 12h2l.6-2.4h2.8L15 18h2L14 6h-2Zm-.1 7.6 1.1-4.6 1.1 4.6h-2.2Z',
  'ml-starter':    'M12 3 3 9v12h6v-7h6v7h6V9l-9-6Z',
  'api-hero':      'M6 14a4 4 0 0 1 .6-7.9A6 6 0 0 1 18 8a4 4 0 0 1-.5 8H6Zm5 1v4m-3-2h6',
  'ai-deployer':   'M12 2a5 5 0 0 1 5 5c0 2-1.2 3.4-2 4.4V15h-6v-3.6C8.2 10.4 7 9 7 7a5 5 0 0 1 5-5ZM9 17h6v2H9v-2Zm1 3h4v2h-4v-2Z',
  'dream-builder': 'M13 2 4 14h6l-1 8 9-12h-6l1-8Z',
  'early-bird':    'M12 4a1 1 0 0 1 1 1v2h-2V5a1 1 0 0 1 1-1Zm6.4 2.6 1.4 1.4-1.5 1.5-1.4-1.4 1.5-1.5ZM12 9a5 5 0 0 1 4.9 6H7.1A5 5 0 0 1 12 9Zm-9 7h18v2H3v-2Z',
  'bias-buster':   'M12 2v3M4 8l4-2 4 2-2 6a2.5 2.5 0 0 1-4 0L4 8Zm16 0-4-2-4 2 2 6a2.5 2.5 0 0 0 4 0l2-6ZM8 20h8M12 11v9',
  'gcc-star':      'M12 2.5l2.9 6.1 6.6.7-4.9 4.6 1.4 6.5L12 17.3l-6 3.1 1.4-6.5L2.5 9.3l6.6-.7L12 2.5Z',
  'ai-engineer':   'M12 2a1.5 1.5 0 0 1 1.5 1.5V5h3A2.5 2.5 0 0 1 19 7.5V9a3 3 0 0 1 0 6v1.5A2.5 2.5 0 0 1 16.5 19h-9A2.5 2.5 0 0 1 5 16.5V15a3 3 0 0 1 0-6V7.5A2.5 2.5 0 0 1 7.5 5h3V3.5A1.5 1.5 0 0 1 12 2ZM9 11a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z',
  'entrepreneur':  'M12 2a5 5 0 0 0-4 8L4 14v3l4 1-1 4h10l-1-4 4-1v-3l-4-4a5 5 0 0 0-4-8Zm0 2a3 3 0 0 1 3 3c0 1.5-1 2.6-1.5 3.6L12 12l-1.5-1.4C10 9.6 9 8.5 9 7a3 3 0 0 1 3-3Z',
  'code-master':   'M8.6 16.6 4 12l4.6-4.6L7.2 6 1.4 12l5.8 6 1.4-1.4Zm6.8 0L20 12l-4.6-4.6L16.8 6l5.8 6-5.8 6-1.4-1.4ZM11 19h2L14 5h-2l-1 14Z',
  'ai-pioneer':    'M12 2a1.5 1.5 0 0 1 1.5 1.5V5h3A2.5 2.5 0 0 1 19 7.5V9a3 3 0 0 1 0 6v1.5A2.5 2.5 0 0 1 16.5 19h-9A2.5 2.5 0 0 1 5 16.5V15a3 3 0 0 1 0-6V7.5A2.5 2.5 0 0 1 7.5 5h3V3.5A1.5 1.5 0 0 1 12 2ZM9 11a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z',
  'py-developer':  'M6 3h12v3h3v3a4 4 0 0 1-4 4 6 6 0 0 1-4 3.9V19h3v2H8v-2h3v-2.1A6 6 0 0 1 7 13a4 4 0 0 1-4-4V6h3V3Zm0 5H5v1a2 2 0 0 0 1 1.7V8Zm12 0v2.7A2 2 0 0 0 19 9V8h-1Z',
}

interface RarityStyle {
  ring: string
  glow: string
  iconColor: string
  bgFrom: string
  bgTo: string
}

const RARITY: Record<'common' | 'rare' | 'epic' | 'legendary', RarityStyle> = {
  common: {
    ring: '#C7D2CC',
    glow: 'none',
    iconColor: '#7C9995',
    bgFrom: '#F1F5F4',
    bgTo: '#EAF0EE',
  },
  rare: {
    ring: '#17D9C0',
    glow: '0 0 10px rgba(23,217,192,0.35)',
    iconColor: '#0F9B87',
    bgFrom: '#E3F8F4',
    bgTo: '#D3F2EC',
  },
  epic: {
    ring: '#A78BFA',
    glow: '0 0 14px rgba(167,139,250,0.45)',
    iconColor: '#7C5CE0',
    bgFrom: '#EFE9FE',
    bgTo: '#E3D8FD',
  },
  legendary: {
    ring: '#FFC93C',
    glow: '0 0 18px rgba(255,201,60,0.6)',
    iconColor: '#B8790E',
    bgFrom: '#FFF4D6',
    bgTo: '#FFE9A8',
  },
}

interface BadgeIconProps {
  badgeId: string
  fallbackEmoji: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  earned: boolean
  size?: number
}

export default function BadgeIcon({ badgeId, fallbackEmoji, rarity, earned, size = 44 }: BadgeIconProps) {
  const path = ICON_PATHS[badgeId as BadgeIconKind]
  const style = RARITY[rarity] ?? RARITY.common

  return (
    <div
      className="relative flex items-center justify-center rounded-2xl shrink-0"
      style={{
        width: size,
        height: size,
        background: earned ? `linear-gradient(160deg, ${style.bgFrom}, ${style.bgTo})` : '#F1F5F4',
        border: `2px solid ${earned ? style.ring : '#E2ECE8'}`,
        boxShadow: earned ? style.glow : 'none',
        opacity: earned ? 1 : 0.45,
        transition: 'all 0.2s ease',
      }}
    >
      {path ? (
        <svg
          width={size * 0.5}
          height={size * 0.5}
          viewBox="0 0 24 24"
          fill="none"
          stroke={earned ? style.iconColor : '#9BB3AA'}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={path} fill={earned ? style.iconColor : '#9BB3AA'} fillOpacity={0.15} />
        </svg>
      ) : (
        <span style={{ fontSize: size * 0.45, filter: earned ? 'none' : 'grayscale(1)' }}>{fallbackEmoji}</span>
      )}

      {earned && rarity === 'legendary' && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: 'linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)',
            backgroundSize: '200% 200%',
            animation: 'badgeShimmer 2.5s ease-in-out infinite',
          }}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes badgeShimmer {
          0% { background-position: 200% 200%; }
          100% { background-position: -200% -200%; }
        }
      ` }} />
    </div>
  )
}

export { RARITY, ICON_PATHS }
export type { BadgeIconKind }