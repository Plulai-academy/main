'use client'
// components/share/ShareCardGenerator.tsx
// Draws a stunning achievement card on Canvas and lets the user download/share it.
// Card types: badge, skill, level, track
// Design direction: cosmic dark luxury — deep space gradient, gold foil accents,
// star particles, bold typography. Feels premium, not childish — kids want to show this off.

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

export type CardType = 'badge' | 'skill' | 'level' | 'track'

export interface ShareCardProps {
  type:       CardType
  // Common
  childName:  string
  childAvatar: string
  // Badge card
  badgeName?:   string
  badgeEmoji?:  string
  badgeRarity?: 'common' | 'rare' | 'epic' | 'legendary'
  badgeDesc?:   string
  // Skill card
  skillName?:  string
  skillEmoji?: string
  trackName?:  string
  xpEarned?:   number
  // Level card
  newLevel?:   number
  levelTitle?: string
  totalXP?:    number
  // Track card
  trackEmoji?: string
  lessonsCompleted?: number
}

// ── Rarity palettes ───────────────────────────────────────────
const RARITY_PALETTES = {
  common:    { bg: ['#1a1a2e', '#16213e'], glow: '#8888bb', accent: '#c0c0d0', star: '#ffffff' },
  rare:      { bg: ['#0d1b2a', '#1b4332'], glow: '#4d96ff', accent: '#60a5fa', star: '#60a5fa' },
  epic:      { bg: ['#1a0a2e', '#2d1b69'], glow: '#c77dff', accent: '#a78bfa', star: '#c77dff' },
  legendary: { bg: ['#1a1200', '#3d2b00'], glow: '#ffd93d', accent: '#fbbf24', star: '#ffd93d' },
}

const TYPE_PALETTES: Record<CardType, typeof RARITY_PALETTES.epic> = {
  badge:  RARITY_PALETTES.epic,
  skill:  { bg: ['#0d1b3e', '#1e3a5f'], glow: '#4d96ff', accent: '#60a5fa', star: '#4d96ff' },
  level:  { bg: ['#1a0d2e', '#3b1f6b'], glow: '#c77dff', accent: '#a78bfa', star: '#c77dff' },
  track:  { bg: ['#0a1f1a', '#0d3b2e'], glow: '#6bcb77', accent: '#4ade80', star: '#6bcb77' },
}

// Card dimensions — 1080×1080 (perfect for Instagram/WhatsApp)
const W = 1080
const H = 1080

function drawStars(ctx: CanvasRenderingContext2D, color: string, count = 80) {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * W
    const y = Math.random() * H
    const r = Math.random() * 1.5 + 0.3
    const alpha = Math.random() * 0.7 + 0.15
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = color.replace(')', `, ${alpha})`).replace('rgb', 'rgba').replace('#', 'rgba(')
    // simpler: just use rgba white
    ctx.fillStyle = `rgba(255,255,255,${alpha * 0.6})`
    ctx.fill()
  }
}

function drawGlowCircle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha = 0.15) {
  const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
  grad.addColorStop(0, color + Math.round(alpha * 255).toString(16).padStart(2, '0'))
  grad.addColorStop(1, 'transparent')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export function generateShareCard(canvas: HTMLCanvasElement, props: ShareCardProps) {
  const ctx = canvas.getContext('2d')!
  canvas.width  = W
  canvas.height = H

  // Pick palette
  let palette = TYPE_PALETTES[props.type]
  if (props.type === 'badge' && props.badgeRarity) {
    palette = RARITY_PALETTES[props.badgeRarity] ?? palette
  }

  // ── Background gradient ────────────────────────────────────
  const bgGrad = ctx.createLinearGradient(0, 0, W * 0.5, H)
  bgGrad.addColorStop(0, palette.bg[0])
  bgGrad.addColorStop(1, palette.bg[1])
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, W, H)

  // ── Star field ─────────────────────────────────────────────
  drawStars(ctx, palette.star, 120)

  // ── Glow blobs (atmosphere) ────────────────────────────────
  drawGlowCircle(ctx, W * 0.15, H * 0.2, 350, palette.glow, 0.18)
  drawGlowCircle(ctx, W * 0.85, H * 0.75, 300, palette.accent, 0.12)
  drawGlowCircle(ctx, W * 0.5,  H * 0.5,  250, palette.glow, 0.06)

  // ── Card frame (glass border) ──────────────────────────────
  const pad = 48
  drawRoundRect(ctx, pad, pad, W - pad * 2, H - pad * 2, 48)
  const rgb = hexToRgb(palette.accent)
  ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.25)`
  ctx.lineWidth = 2
  ctx.stroke()

  // inner subtle fill
  ctx.fillStyle = 'rgba(255,255,255,0.03)'
  ctx.fill()

  // ── Plulai logo top-left ───────────────────────────────────
  ctx.font = 'bold 36px "Fredoka One", sans-serif'
  ctx.fillStyle = palette.accent
  ctx.fillText('🚀 Plulai', 96, 128)

  // Tagline top-right
  ctx.font = 'bold 22px sans-serif'
  ctx.fillStyle = `rgba(255,255,255,0.35)`
  ctx.textAlign = 'right'
  ctx.fillText('plulai.com', W - 96, 128)
  ctx.textAlign = 'left'

  // ── Horizontal divider ─────────────────────────────────────
  const divGrad = ctx.createLinearGradient(96, 0, W - 96, 0)
  divGrad.addColorStop(0, 'transparent')
  divGrad.addColorStop(0.3, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.4)`)
  divGrad.addColorStop(0.7, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.4)`)
  divGrad.addColorStop(1, 'transparent')
  ctx.strokeStyle = divGrad
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(96, 152)
  ctx.lineTo(W - 96, 152)
  ctx.stroke()

  // ── Content area starts at y=180 ─────────────────────────

  // ── Emoji / main icon (big, centered with glow) ───────────
  const emoji = props.badgeEmoji ?? props.skillEmoji ?? props.trackEmoji ?? '🌟'
  const emojiY = 340

  // Glow behind emoji
  drawGlowCircle(ctx, W / 2, emojiY, 180, palette.glow, 0.3)

  // Emoji circle background
  ctx.beginPath()
  ctx.arc(W / 2, emojiY, 110, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.12)`
  ctx.fill()
  ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.4)`
  ctx.lineWidth = 3
  ctx.stroke()

  // Emoji
  ctx.font = '120px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emoji, W / 2, emojiY)
  ctx.textBaseline = 'alphabetic'

  // ── Rarity / type label ────────────────────────────────────
  const labelY = 500
  let typeLabel = ''
  if (props.type === 'badge')  typeLabel = props.badgeRarity ? `✦ ${props.badgeRarity.toUpperCase()} BADGE ✦` : '✦ BADGE ✦'
  if (props.type === 'skill')  typeLabel = '✦ SKILL COMPLETE ✦'
  if (props.type === 'level')  typeLabel = '✦ LEVEL UP ✦'
  if (props.type === 'track')  typeLabel = '✦ TRACK MASTERED ✦'

  ctx.font = 'bold 26px sans-serif'
  ctx.fillStyle = palette.accent
  ctx.textAlign = 'center'
  ctx.letterSpacing = '4px'
  ctx.fillText(typeLabel, W / 2, labelY)
  ctx.letterSpacing = '0px'

  // ── Main title ─────────────────────────────────────────────
  const titleY = 590
  let title = ''
  if (props.type === 'badge')  title = props.badgeName ?? 'Achievement Unlocked'
  if (props.type === 'skill')  title = props.skillName ?? 'Skill Mastered'
  if (props.type === 'level')  title = props.levelTitle ? `Level ${props.newLevel} — ${props.levelTitle}` : `Level ${props.newLevel}`
  if (props.type === 'track')  title = `${props.trackName ?? 'Track'} Master`

  // Text glow
  ctx.shadowColor = palette.glow
  ctx.shadowBlur = 30
  ctx.font = 'bold 72px "Fredoka One", cursive, sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'

  // Word-wrap if too long
  const maxW = W - 200
  const words = title.split(' ')
  let line = '', lines: string[] = []
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line); line = word
    } else { line = test }
  }
  lines.push(line)

  lines.forEach((l, i) => ctx.fillText(l, W / 2, titleY + i * 82))
  ctx.shadowBlur = 0

  // ── Subtitle / description ────────────────────────────────
  const descY = titleY + lines.length * 82 + 28
  let desc = ''
  if (props.type === 'badge')  desc = props.badgeDesc ?? ''
  if (props.type === 'skill')  desc = props.trackName ? `${props.trackName} track${props.xpEarned ? ` · +${props.xpEarned} XP` : ''}` : ''
  if (props.type === 'level')  desc = props.totalXP ? `${props.totalXP.toLocaleString()} total XP` : ''
  if (props.type === 'track')  desc = props.lessonsCompleted ? `${props.lessonsCompleted} lessons completed` : ''

  if (desc) {
    ctx.font = '32px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.textAlign = 'center'
    ctx.fillText(desc, W / 2, descY)
  }

  // ── Achieved by (child name + avatar) ────────────────────
  const achievedY = H - 200

  // Divider
  const div2 = ctx.createLinearGradient(180, 0, W - 180, 0)
  div2.addColorStop(0, 'transparent')
  div2.addColorStop(0.4, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.35)`)
  div2.addColorStop(0.6, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.35)`)
  div2.addColorStop(1, 'transparent')
  ctx.strokeStyle = div2
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(180, achievedY - 32)
  ctx.lineTo(W - 180, achievedY - 32)
  ctx.stroke()

  // Avatar bubble
  const avatarX = W / 2 - 120
  const avatarY = achievedY + 12
  ctx.beginPath()
  ctx.arc(avatarX, avatarY + 28, 44, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.15)`
  ctx.fill()
  ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.5)`
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.font = '52px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(props.childAvatar, avatarX, avatarY + 28)
  ctx.textBaseline = 'alphabetic'

  // Name
  ctx.font = 'bold 42px "Fredoka One", sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'left'
  ctx.fillText(props.childName, W / 2 - 60, achievedY + 22)

  ctx.font = 'bold 24px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.fillText('achieved this', W / 2 - 60, achievedY + 56)

  // ── Date bottom-right ──────────────────────────────────────
  ctx.font = '22px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.textAlign = 'right'
  ctx.fillText(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), W - 96, H - 80)

  // ── Decorative corner stars ────────────────────────────────
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '28px serif'
  ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.5)`
  ctx.fillText('✦', 96 + 36, 96 + 36)
  ctx.fillText('✦', W - 96 - 36, 96 + 36)
  ctx.fillText('✦', 96 + 36, H - 96 - 36)
  ctx.fillText('✦', W - 96 - 36, H - 96 - 36)
}


// ── ShareCardModal component ──────────────────────────────────
interface ModalProps {
  props:    ShareCardProps
  onClose: () => void
}

export default function ShareCardModal({ props, onClose }: ModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rendered,  setRendered]  = useState(false)
  const [shareSupported, setShareSupported] = useState(false)
  const [copying,   setCopying]   = useState(false)

  useEffect(() => {
    setShareSupported(typeof navigator !== 'undefined' && !!navigator.share && !!navigator.canShare)
  }, [])

  // Re-draw whenever props change
  const draw = useCallback(() => {
    if (!canvasRef.current) return
    generateShareCard(canvasRef.current, props)
    setRendered(true)
  }, [props])

  useEffect(() => { draw() }, [draw])

  const getBlob = (): Promise<Blob> =>
    new Promise((res, rej) => {
      if (!canvasRef.current) return rej(new Error('No canvas'))
      canvasRef.current.toBlob((b: Blob | null) => b ? res(b) : rej(new Error('Failed')), 'image/png', 1)
    })

  const download = async () => {
    const blob = await getBlob()
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `plulai-${props.type}-${props.childName.toLowerCase().replace(/\s/g, '-')}.png`
    a.click()
    URL.revokeObjectURL(url)
  }

  const share = async () => {
    try {
      const blob = await getBlob()
      const file = new File([blob], 'plulai-achievement.png', { type: 'image/png' })
      await navigator.share({ title: `I earned the ${props.badgeName ?? props.skillName ?? 'achievement'} on Plulai!`, files: [file] })
    } catch {}
  }

  const copyImage = async () => {
    try {
      setCopying(true)
      const blob = await getBlob()
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setTimeout(() => setCopying(false), 2000)
    } catch {
      setCopying(false)
    }
  }

  const rarity = props.badgeRarity ?? 'epic'
  const glowColor = {
    common: '#8888bb', rare: '#4d96ff', epic: '#c77dff', legendary: '#ffd93d',
  }[rarity] ?? '#c77dff'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-white/10 rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-star-pop"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-fredoka text-xl">🎉 Share Your Achievement!</h2>
          <button onClick={onClose} className="text-muted hover:text-white text-2xl leading-none transition-colors">×</button>
        </div>

        {/* Canvas preview */}
        <div className="relative rounded-2xl overflow-hidden mb-5 shadow-xl" style={{ boxShadow: `0 0 40px ${glowColor}40` }}>
          <canvas
            ref={canvasRef}
            className="w-full h-auto block"
            style={{ aspectRatio: '1/1' }}
          />
          {!rendered && (
            <div className="absolute inset-0 flex items-center justify-center bg-card text-muted font-bold text-sm">
              Generating card...
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={download}
            className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-card2 border border-white/8 hover:border-accent4/40 hover:bg-accent4/10 transition-all group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">⬇️</span>
            <span className="text-xs font-extrabold text-muted group-hover:text-white transition-colors">Download</span>
          </button>

          {shareSupported && (
            <button
              onClick={share}
              className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-gradient-to-br from-accent5/20 to-accent1/20 border border-accent5/30 hover:-translate-y-0.5 hover:shadow-lg transition-all group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">📤</span>
              <span className="text-xs font-extrabold text-accent5">Share</span>
            </button>
          )}

          <button
            onClick={copyImage}
            className={cn(
              'flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all group',
              copying
                ? 'bg-accent3/15 border-accent3/40'
                : 'bg-card2 border-white/8 hover:border-accent3/40 hover:bg-accent3/10'
            )}
          >
            <span className="text-xl group-hover:scale-110 transition-transform">{copying ? '✅' : '📋'}</span>
            <span className={cn('text-xs font-extrabold transition-colors', copying ? 'text-accent3' : 'text-muted group-hover:text-white')}>
              {copying ? 'Copied!' : 'Copy'}
            </span>
          </button>
        </div>

        <p className="text-center text-xs text-muted font-semibold mt-4">
          1080×1080px · Perfect for Instagram, WhatsApp & Snapchat
        </p>
      </div>
    </div>
  )
}
