/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gt: {
          bg: '#0a0f0a',
          surface: '#111811',
          card: '#161e16',
          border: '#1e2e1e',
          green: '#4ade80',
          green2: '#22c55e',
          gold: '#d4a853',
          text: '#e8f5e8',
          muted: '#6b8c6b',
          danger: '#f87171',
          warning: '#fbbf24',
          info: '#60a5fa',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}