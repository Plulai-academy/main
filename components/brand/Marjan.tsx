// File: Marjan.tsx
// Placement: components/brand/Marjan.tsx
//
// Plulai's mascot — a hermit crab named Marjan (Arabic for "coral").
// Rendered as inline SVG rather than an image asset: there's no final
// illustrated artwork yet, and inline SVG means no broken-image fallback
// to worry about while that art gets commissioned.
//
// This is a concept-level rendering (flat shapes, no shading/animation) —
// treat it as the reference for whoever illustrates the final version,
// not production-ready character art.

interface MarjanProps {
  mood?: 'neutral' | 'celebrating'
  size?: number
  className?: string
}

export default function Marjan({ mood = 'neutral', size = 180, className }: MarjanProps) {
  if (mood === 'celebrating') {
    return (
      <svg width={size} height={size} viewBox="0 0 200 200" className={className}>
        <path d="M 55 135 L 38 142 L 28 152" fill="none" stroke="#0FA894" strokeWidth="7" strokeLinecap="round" />
        <path d="M 66 144 L 54 160 L 50 174" fill="none" stroke="#0FA894" strokeWidth="7" strokeLinecap="round" />
        <path d="M 145 135 L 162 142 L 172 152" fill="none" stroke="#0FA894" strokeWidth="7" strokeLinecap="round" />
        <path d="M 134 144 L 146 160 L 150 174" fill="none" stroke="#0FA894" strokeWidth="7" strokeLinecap="round" />
        <path
          d="M 52 132 C 46 92 66 56 100 50 C 134 56 154 92 148 132 C 148 140 142 144 136 144 L 64 144 C 58 144 52 140 52 132 Z"
          fill="#D4A24C"
        />
        <path d="M 94 58 Q 100 49 106 58 Q 100 66 94 58 Z" fill="#B8863A" />
        <circle cx="122" cy="92" r="8" fill="#FFB930" stroke="#B8863A" strokeWidth="2" />
        <path d="M 74 146 Q 100 168 126 146 L 122 158 Q 100 172 78 158 Z" fill="#17D9C0" />
        <ellipse cx="100" cy="150" rx="26" ry="18" fill="#17D9C0" />
        <path d="M 96 126 L 112 102" stroke="#D4A24C" strokeWidth="4" strokeLinecap="round" />
        <path d="M 85 132 C 78 118 72 108 66 98" fill="none" stroke="#0D2B32" strokeWidth="4" strokeLinecap="round" />
        <path d="M 115 132 C 122 118 128 108 134 98" fill="none" stroke="#0D2B32" strokeWidth="4" strokeLinecap="round" />
        <circle cx="66" cy="95" r="8" fill="#F6F3EA" />
        <circle cx="134" cy="95" r="8" fill="#F6F3EA" />
        <path d="M 60 95 Q 66 88 72 95" fill="none" stroke="#0D2B32" strokeWidth="3" strokeLinecap="round" />
        <path d="M 128 95 Q 134 88 140 95" fill="none" stroke="#0D2B32" strokeWidth="3" strokeLinecap="round" />
        <circle cx="42" cy="120" r="13" fill="#FF6B57" />
        <circle cx="50" cy="112" r="10" fill="#EAF7F4" />
        <circle cx="158" cy="120" r="13" fill="#FF6B57" />
        <circle cx="150" cy="112" r="10" fill="#EAF7F4" />
        <circle cx="40" cy="55" r="3" fill="#FFB930" />
        <circle cx="165" cy="60" r="2.5" fill="#FF6B57" />
        <circle cx="150" cy="35" r="2" fill="#17D9C0" />
      </svg>
    )
  }

  return (
    <svg width={size} height={size} viewBox="0 0 200 200" className={className}>
      <path d="M 58 138 L 42 150 L 36 164" fill="none" stroke="#0FA894" strokeWidth="7" strokeLinecap="round" />
      <path d="M 68 144 L 56 160 L 52 174" fill="none" stroke="#0FA894" strokeWidth="7" strokeLinecap="round" />
      <path d="M 142 138 L 158 150 L 164 164" fill="none" stroke="#0FA894" strokeWidth="7" strokeLinecap="round" />
      <path d="M 132 144 L 144 160 L 148 174" fill="none" stroke="#0FA894" strokeWidth="7" strokeLinecap="round" />
      <path
        d="M 52 132 C 46 92 66 56 100 50 C 134 56 154 92 148 132 C 148 140 142 144 136 144 L 64 144 C 58 144 52 140 52 132 Z"
        fill="#D4A24C"
      />
      <path d="M 100 62 C 90 90 85 115 82 140" fill="none" stroke="#B8863A" strokeWidth="2" opacity="0.55" />
      <path d="M 100 60 C 110 90 115 115 118 140" fill="none" stroke="#B8863A" strokeWidth="2" opacity="0.55" />
      <path d="M 94 58 Q 100 49 106 58 Q 100 66 94 58 Z" fill="#B8863A" />
      <circle cx="122" cy="92" r="8" fill="#F6F3EA" stroke="#B8863A" strokeWidth="2" />
      <path d="M 74 146 Q 100 168 126 146 L 122 158 Q 100 172 78 158 Z" fill="#17D9C0" />
      <ellipse cx="100" cy="150" rx="26" ry="18" fill="#17D9C0" />
      <path d="M 98 128 L 110 108" stroke="#D4A24C" strokeWidth="4" strokeLinecap="round" />
      <path d="M 88 135 C 85 122 84 112 84 104" fill="none" stroke="#0D2B32" strokeWidth="4" strokeLinecap="round" />
      <path d="M 112 135 C 115 122 116 112 116 104" fill="none" stroke="#0D2B32" strokeWidth="4" strokeLinecap="round" />
      <circle cx="84" cy="101" r="8" fill="#F6F3EA" />
      <circle cx="116" cy="101" r="8" fill="#F6F3EA" />
      <circle cx="85" cy="102" r="4" fill="#0D2B32" />
      <circle cx="117" cy="102" r="4" fill="#0D2B32" />
      <circle cx="62" cy="158" r="13" fill="#FF6B57" />
      <circle cx="70" cy="151" r="10" fill="#EAF7F4" />
      <circle cx="138" cy="158" r="13" fill="#FF6B57" />
      <circle cx="130" cy="151" r="10" fill="#EAF7F4" />
    </svg>
  )
}