'use client'

import { useEffect, useRef, useState } from 'react'
import BadgeIcon, { RARITY, ICON_PATHS, type BadgeIconKind } from '@/components/dashboard/BadgeIcon'

export type ShareCardProps =
  | {
      type: 'level'
      childName: string
      childAvatar: string
      newLevel: number
      levelTitle?: string
      totalXP?: number
    }
  | {
      type: 'skill'
      childName: string
      childAvatar: string
      skillName: string
      skillEmoji: string
      trackName: string
      xpEarned: number
    }
  | {
      type: 'badge'
      childName: string
      childAvatar: string
      badgeId: string
      badgeName: string
      badgeEmoji: string
      badgeDescription: string
      rarity: 'common' | 'rare' | 'epic' | 'legendary'
      xpBonus: number
    }

const RARITY_LABEL: Record<string, string> = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
}

function buildShareText(props: ShareCardProps): string {
  switch (props.type) {
    case 'level':
      return `I just hit Level ${props.newLevel}${props.levelTitle ? ` — ${props.levelTitle}` : ''} on Plulai! 🚀`
    case 'skill':
      return `I just finished ${props.skillName} (${props.trackName}) on Plulai! ${props.skillEmoji}`
    case 'badge':
      return `I just earned the "${props.badgeName}" badge on Plulai! ${props.badgeEmoji}`
  }
}

function accentFor(props: ShareCardProps): string {
  if (props.type === 'badge') return RARITY[props.rarity]?.ring ?? '#17D9C0'
  if (props.type === 'level') return '#FFC93C'
  return '#17D9C0'
}

function subtitleFor(props: ShareCardProps): string {
  switch (props.type) {
    case 'level':
      return props.levelTitle ?? `${(props.totalXP ?? 0).toLocaleString()} total XP`
    case 'skill':
      return `${props.trackName} · +${props.xpEarned.toLocaleString()} XP`
    case 'badge':
      return props.badgeDescription
  }
}

function titleFor(props: ShareCardProps): string {
  switch (props.type) {
    case 'level':
      return `Level ${props.newLevel}`
    case 'skill':
      return props.skillName
    case 'badge':
      return props.badgeName
  }
}

// Builds a self-contained SVG string for the whole card, at export
// resolution, so it can be rasterized to a real downloadable PNG without
// any external screenshot/rendering library.
function buildCardSVG(props: ShareCardProps): string {
  const W = 1080
  const H = 1350
  const accent = accentFor(props)
  const title = titleFor(props).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  const subtitle = subtitleFor(props).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  const name = props.childName.replace(/&/g, '&amp;').replace(/</g, '&lt;')

  let emoji = '🏆'
  let iconSvg = ''

  if (props.type === 'level') emoji = '🏆'
  if (props.type === 'skill') emoji = props.skillEmoji
  if (props.type === 'badge') {
    emoji = props.badgeEmoji
    const path = ICON_PATHS[props.badgeId as BadgeIconKind]
    const iconColor = RARITY[props.rarity]?.iconColor ?? '#0F9B87'
    if (path) {
      iconSvg = `<svg x="440" y="330" width="200" height="200" viewBox="0 0 24 24"><path d="${path}" fill="${iconColor}" fill-opacity="0.9" stroke="${iconColor}" stroke-width="0.6"/></svg>`
    }
  }

  const emojiFallback = iconSvg
    ? ''
    : `<text x="540" y="470" font-size="140" text-anchor="middle" dominant-baseline="middle">${emoji}</text>`

  const rarityPill =
    props.type === 'badge'
      ? `<rect x="440" y="580" width="200" height="52" rx="26" fill="${accent}" fill-opacity="0.18"/>
         <text x="540" y="614" font-size="26" font-weight="800" text-anchor="middle" fill="${accent}" letter-spacing="2">${RARITY_LABEL[props.rarity].toUpperCase()}</text>`
      : ''

  return `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#EAF7F4"/>
      <stop offset="1" stop-color="#D9F1EC"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.45"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" rx="56" fill="url(#bg)"/>

  <circle cx="540" cy="420" r="280" fill="url(#glow)"/>
  <circle cx="540" cy="420" r="210" fill="#FFFFFF"/>
  <circle cx="540" cy="420" r="210" fill="none" stroke="${accent}" stroke-width="6"/>

  ${iconSvg}
  ${emojiFallback}

  ${rarityPill}

  <text x="540" y="${props.type === 'badge' ? 700 : 640}" font-size="72" font-weight="900" text-anchor="middle" fill="#0D2B32" font-family="Nunito, sans-serif">${title}</text>
  <text x="540" y="${props.type === 'badge' ? 760 : 700}" font-size="34" font-weight="700" text-anchor="middle" fill="#4E7169" font-family="Nunito, sans-serif">${subtitle}</text>

  <line x1="180" y1="1140" x2="900" y2="1140" stroke="#0D2B32" stroke-opacity="0.08" stroke-width="2"/>

  <text x="540" y="1210" font-size="30" font-weight="800" text-anchor="middle" fill="#0D2B32" font-family="Nunito, sans-serif">Earned by ${name}</text>
  <text x="540" y="1260" font-size="26" font-weight="700" text-anchor="middle" fill="${accent}" letter-spacing="1" font-family="Nunito, sans-serif">PLULAI</text>
</svg>`.trim()
}

function downloadCard(props: ShareCardProps, onDone: () => void) {
  const svgString = buildCardSVG(props)
  const svg64 = typeof window !== 'undefined' ? window.btoa(unescape(encodeURIComponent(svgString))) : ''
  const dataUrl = `data:image/svg+xml;base64,${svg64}`

  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1350
    const ctx = canvas.getContext('2d')
    if (!ctx) { onDone(); return }
    ctx.drawImage(img, 0, 0)
    canvas.toBlob((blob) => {
      if (!blob) { onDone(); return }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const safeName = props.childName.trim().replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'plulai'
      const kind = props.type === 'badge' ? 'badge' : props.type === 'level' ? 'level' : 'skill'
      a.href = url
      a.download = `${safeName}-${kind}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      onDone()
    }, 'image/png')
  }
  img.onerror = () => onDone()
  img.src = dataUrl
}

export default function ShareCardModal({ props, onClose }: { props: ShareCardProps; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const shareText = buildShareText(props)
  const accent = accentFor(props)

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({ text: shareText, title: 'Plulai' })
        return
      } catch {
        // cancelled or unsupported — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable — nothing else to do
    }
  }

  const handleDownload = () => {
    setDownloading(true)
    downloadCard(props, () => setDownloading(false))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D2B32]/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center text-[#4E7169] bg-white/80 hover:bg-white transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6 6.4 5Z" />
          </svg>
        </button>

        {/* ── Hero panel ── */}
        <div
          className="relative flex flex-col items-center pt-10 pb-8 px-6 text-center"
          style={{ background: 'linear-gradient(160deg, #EAF7F4, #D9F1EC)' }}
        >
          <div
            aria-hidden
            className="absolute rounded-full"
            style={{
              width: 260,
              height: 260,
              background: `radial-gradient(circle, ${accent}55, transparent 70%)`,
              top: 10,
            }}
          />

          <div className="relative mb-5">
            {props.type === 'badge' ? (
              <BadgeIcon badgeId={props.badgeId} fallbackEmoji={props.badgeEmoji} rarity={props.rarity} earned size={130} />
            ) : (
              <div
                className="w-[130px] h-[130px] rounded-full bg-white flex items-center justify-center text-6xl"
                style={{ border: `4px solid ${accent}`, boxShadow: `0 0 24px ${accent}55` }}
              >
                {props.type === 'level' ? '🏆' : props.skillEmoji}
              </div>
            )}
          </div>

          {props.type === 'badge' && (
            <span
              className="relative inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest mb-3"
              style={{ background: `${accent}22`, color: accent }}
            >
              {RARITY_LABEL[props.rarity]}
            </span>
          )}

          <h2 className="relative font-extrabold text-2xl text-[#0D2B32] mb-1.5 leading-tight">
            {titleFor(props)}
          </h2>
          <p className="relative text-sm font-bold text-[#4E7169] leading-relaxed max-w-[260px]">
            {subtitleFor(props)}
          </p>
        </div>

        {/* ── Signature footer ── */}
        <div className="px-6 py-5 border-t border-[#0D2B32]/8 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0"
              style={{ background: '#F1F5F4', color: '#4E7169' }}
            >
              {props.childAvatar}
            </div>
            <p className="text-sm font-bold text-[#0D2B32] truncate">{props.childName}</p>
          </div>
          <span className="text-xs font-black uppercase tracking-widest shrink-0" style={{ color: accent }}>
            Plulai
          </span>
        </div>

        {/* ── Actions ── */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 py-3 rounded-2xl font-extrabold text-sm border-2 border-[#0D2B32]/10 text-[#0D2B32] hover:border-[#0D2B32]/25 transition-all disabled:opacity-50"
          >
            {downloading ? 'Saving…' : 'Download'}
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-3 rounded-2xl font-extrabold text-sm text-white transition-transform hover:-translate-y-0.5"
            style={{ background: '#FF6B57', boxShadow: '0 4px 0 rgba(13,43,50,0.18)' }}
          >
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  )
}