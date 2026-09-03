/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dv: {
          bg: "#0c0a1d",
          sidebar: "#110e27",
          card: "#151231",
          cardHover: "#1c1940",
          border: "#252249",
          borderLight: "#342f66",
          violet: "#8b5cf6",
          violetHover: "#7c3aed",
          violetMuted: "#6d28d9",
          amber: "#f59e0b",
          cyan: "#22d3ee",
          lime: "#84cc16",
          rose: "#fb7185",
          textMuted: "#9ca3af",
          textDim: "#6b7280"
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' }
        }
      }
    },
  },
  plugins: [],
}
