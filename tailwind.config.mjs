/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        court:    '#C9A84C',
        hardwood: '#8B5E3C',
        nba: {
          blue:   '#1D428A',
          red:    '#C8102E',
          gold:   '#FFB81C',
          silver: '#BEC0C2',
        },
        surface: {
          DEFAULT: '#0F1623',
          2:       '#161E2E',
          3:       '#1E2A3D',
          4:       '#263348',
        },
        east: '#1D428A',
        west: '#C8102E',
      },
      fontFamily: {
        oswald: ['Oswald', 'Impact', 'Arial Black', 'sans-serif'],
        bebas:  ['"Bebas Neue"', 'Impact', 'sans-serif'],
        body:   ['"Roboto Condensed"', 'Arial Narrow', 'sans-serif'],
        mono:   ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 2.5s ease-in-out infinite',
        'spin-slow':  'spin 1s linear infinite',
        'fade-up':    'fadeUp 0.5s ease both',
        'scale-in':   'scaleIn 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'shimmer':    'shimmer 3s linear infinite',
        'slide-in':   'slideIn 0.3s ease both',
        'fade-in':    'fadeIn 0.4s ease both',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
