/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        fredoka: ['Fredoka One', 'cursive'],
        nunito: ['Nunito', 'sans-serif'],
      },
      colors: {
        bg:       '#0d0d1a',
        card:     '#16162a',
        card2:    '#1e1e38',
        accent1:  '#ff6b6b',
        accent2:  '#ffd93d',
        accent3:  '#6bcb77',
        accent4:  '#4d96ff',
        accent5:  '#c77dff',
        muted:    '#8888bb',
      },
      keyframes: {
        'slide-up':   { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        'bounce-slow': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        'glow-pulse': { '0%,100%': { boxShadow: '0 0 20px rgba(77,150,255,0.3)' }, '50%': { boxShadow: '0 0 40px rgba(77,150,255,0.6)' } },
        'xp-fill':    { from: { width: '0%' }, to: { width: 'var(--xp-width)' } },
        'star-pop':   { '0%': { transform: 'scale(0) rotate(0deg)' }, '60%': { transform: 'scale(1.3) rotate(15deg)' }, '100%': { transform: 'scale(1) rotate(0deg)' } },
        'fade-in':    { from: { opacity: 0 }, to: { opacity: 1 } },
        shimmer:      { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: {
        'slide-up':    'slide-up 0.4s cubic-bezier(.4,0,.2,1)',
        'bounce-slow': 'bounce-slow 2s ease-in-out infinite',
        'glow-pulse':  'glow-pulse 2s ease-in-out infinite',
        'star-pop':    'star-pop 0.5s cubic-bezier(.4,0,.2,1)',
        'fade-in':     'fade-in 0.3s ease',
        shimmer:       'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}
