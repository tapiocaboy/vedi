/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // High-tech blue theme
        cyber: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#bcdcff',
          300: '#8ec7ff',
          400: '#59a6ff',
          500: '#3380ff',
          600: '#1d5bf5',
          700: '#1644e1',
          800: '#1837b6',
          900: '#1a338f',
          950: '#141f57',
        },
        neon: {
          50: '#edfcff',
          100: '#d6f7ff',
          200: '#b5f1ff',
          300: '#83e8ff',
          400: '#48d5ff',
          500: '#1eb8ff',
          600: '#0699ff',
          700: '#0080f4',
          800: '#0865c5',
          900: '#0d559a',
          950: '#0e345d',
        },
        slate: {
          850: '#1a2234',
          925: '#0d1424',
          950: '#080d15',
        },
        accent: {
          cyan: '#00f0ff',
          blue: '#3b82f6',
          purple: '#8b5cf6',
          pink: '#ec4899',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%233b82f6' stroke-opacity='0.08'%3E%3Cpath d='M0 0h60v60H0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'cyber-gradient': 'linear-gradient(135deg, #0d1424 0%, #1a2234 50%, #141f57 100%)',
        'glow-gradient': 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.1)',
        'neon-strong': '0 0 30px rgba(59, 130, 246, 0.4), 0 0 60px rgba(59, 130, 246, 0.2)',
        'glow': '0 4px 30px rgba(59, 130, 246, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(59, 130, 246, 0.5), 0 0 60px rgba(59, 130, 246, 0.2)' },
        },
      },
    },
  },
  plugins: [],
}
