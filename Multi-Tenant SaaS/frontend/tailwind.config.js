/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          900: '#101725',
          800: '#1d2638',
          700: '#2a3550',
          600: '#3a4869',
          500: '#546387',
          400: '#7a8bb2',
          300: '#a7b3cf',
        },
        ocean: {
          600: '#0a7b83',
          500: '#0fa3b1',
          400: '#53c1c6',
          300: '#9bd9dc',
          200: '#d2f0f1',
        },
        glow: {
          500: '#f7c548',
          400: '#ffd166',
          300: '#ffe29a',
        },
      },
      boxShadow: {
        card: '0 18px 60px -40px rgba(16, 23, 37, 0.8)',
        insetGlow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.08)',
      },
      backgroundImage: {
        radial: 'radial-gradient(circle at top, rgba(83, 193, 198, 0.35), transparent 55%)',
      },
    },
  },
  plugins: [],
}
