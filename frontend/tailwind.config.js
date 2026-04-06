

//made by sid 

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif']
      },
      colors: {
        surface: {
          950: '#080c10',
          900: '#0d1117',
          800: '#161b22',
          700: '#1c2230',
          600: '#232b3a',
          500: '#2d3748',
        },
        accent: {
          cyan: '#00d4ff',
          green: '#39d353',
          amber: '#f0a500',
          red: '#ff4757',
          blue: '#4a9eff',
          purple: '#9b59b6',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(8px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      }
    }
  },
  plugins: []
}
