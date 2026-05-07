/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Violet primary (kept as `cyber` for backward compat)
        cyber: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        // Purple secondary
        neon: {
          50:  '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        // True-black surface palette with slight purple tint
        slate: {
          850: '#0f0f14',
          925: '#09090e',
          950: '#05050a',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern':    "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%238b5cf6' stroke-opacity='0.05'%3E%3Cpath d='M0 0h60v60H0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'cyber-gradient':  'linear-gradient(135deg, #05050a 0%, #0f0f14 50%, #16161e 100%)',
        'glow-gradient':   'radial-gradient(ellipse at center, rgba(139,92,246,0.1) 0%, transparent 70%)',
        'header-gradient': 'linear-gradient(135deg, #0f0f14 0%, #16161e 100%)',
      },
      boxShadow: {
        'neon':        '0 0 20px rgba(139,92,246,0.3), 0 0 40px rgba(139,92,246,0.08)',
        'neon-strong': '0 0 30px rgba(139,92,246,0.45), 0 0 60px rgba(139,92,246,0.15)',
        'glow':        '0 4px 30px rgba(139,92,246,0.2)',
        'card':        '0 4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%':   { boxShadow: '0 0 20px rgba(139,92,246,0.25)' },
          '100%': { boxShadow: '0 0 30px rgba(139,92,246,0.45), 0 0 60px rgba(139,92,246,0.15)' },
        },
      },
    },
  },
  plugins: [],
}
