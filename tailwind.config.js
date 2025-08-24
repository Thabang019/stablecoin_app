/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Your custom CSS variables as Tailwind colors
        accent: 'var(--accent-color)',
        'bg-custom': 'var(--bg-color)',
        'glass-bg': 'var(--glass-bg)',
        
        // Dashboard colors - ensuring all shades are available
        teal: {
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
        },
        gray: {
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        green: {
          400: '#4ade80',
        },
        red: {
          400: '#f87171',
        },
        yellow: {
          400: '#facc15',
        },
        cyan: {
          400: '#22d3ee',
        },
        blue: {
          500: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      backgroundImage: {
        'text-gradient': 'var(--text-gradient)',
      },
      backdropBlur: {
        'glass': '10px',
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      letterSpacing: {
        'widest-plus': '0.25em',
      },
      spacing: {
        '18': '4.5rem',
      }
    },
  },
  plugins: [],
}