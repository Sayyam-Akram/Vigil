/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "var(--bg-primary)",
          surface: "var(--bg-surface)",
          elevated: "var(--bg-elevated)",
        },
        border: {
          DEFAULT: "var(--border)",
          active: "var(--border-active)",
        },
        brand: {
          green: "var(--green)",
          "green-dim": "var(--green-dim)",
          red: "var(--red)",
          "red-dim": "var(--red-dim)",
          orange: "var(--orange)",
          "orange-dim": "var(--orange-dim)",
          yellow: "var(--yellow)",
          "yellow-dim": "var(--yellow-dim)",
          blue: "var(--blue)",
        },
        text: {
          primary: "var(--white-primary)",
          secondary: "var(--white-secondary)",
          tertiary: "var(--white-tertiary)",
          muted: "var(--white-muted)",
        }
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
        serif: ["'Instrument Serif'", "serif"],
      },
      animation: {
        'radar-sweep': 'radar-sweep 4s linear infinite',
        'pulse-fast': 'pulse-fast 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'marquee': 'marquee 30s linear infinite',
        'pipeline-flow': 'pipeline-flow 3s linear infinite',
      },
      keyframes: {
        'radar-sweep': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse-fast': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '.3', transform: 'scale(0.92)' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'pipeline-flow': {
          '0%': { strokeDashoffset: '24' },
          '100%': { strokeDashoffset: '0' },
        }
      }
    },
  },
  plugins: [],
}
