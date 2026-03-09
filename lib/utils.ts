// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export const formatXP = (xp: number) => xp.toLocaleString()

export const getRarityColor = (rarity: string) => {
  const map: Record<string, string> = {
    common:    'text-gray-300 border-gray-600',
    rare:      'text-accent4 border-accent4/40',
    epic:      'text-accent5 border-accent5/40',
    legendary: 'text-accent2 border-accent2/40',
  }
  return map[rarity] || map.common
}

export const getRarityGlow = (rarity: string) => {
  const map: Record<string, string> = {
    common:    '',
    rare:      'shadow-[0_0_20px_rgba(77,150,255,0.3)]',
    epic:      'shadow-[0_0_20px_rgba(199,125,255,0.3)]',
    legendary: 'shadow-[0_0_30px_rgba(255,217,61,0.4)]',
  }
  return map[rarity] || ''
}

export const getTrackColor = (track: string) => {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    coding:           { bg: 'bg-accent4/10',  text: 'text-accent4',  border: 'border-accent4/30'  },
    ai:               { bg: 'bg-accent5/10',  text: 'text-accent5',  border: 'border-accent5/30'  },
    entrepreneurship: { bg: 'bg-accent3/10',  text: 'text-accent3',  border: 'border-accent3/30'  },
  }
  return map[track] || map.coding
}

export const truncate = (str: string, max: number) =>
  str.length > max ? str.slice(0, max) + '…' : str
