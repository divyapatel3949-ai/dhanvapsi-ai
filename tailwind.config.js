/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rzp: {
          dark: "#0B0F19",
          card: "#121827",
          cardHover: "#1A2234",
          border: "#1F293D",
          borderLight: "#2D3B55",
          blue: "#3071FF",
          blueHover: "#2557CC",
          gold: "#EAB308",
          emerald: "#10B981",
          rose: "#F43F5E",
          amber: "#F59E0B",
          textMuted: "#94A3B8"
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite',
        'scan': 'scanLine 3s infinite linear'
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 8px rgba(48, 113, 255, 0.4))' },
          '50%': { opacity: '0.7', filter: 'drop-shadow(0 0 2px rgba(48, 113, 255, 0.1))' }
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' }
        }
      }
    },
  },
  plugins: [],
}
