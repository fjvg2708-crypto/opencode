/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dg: {
          black: '#0A0A0A',
          dark: '#111111',
          gray: '#1A1A1A',
          'gray-2': '#222222',
          'gray-3': '#2A2A2A',
          'gray-4': '#333333',
          'gray-5': '#404040',
          'gray-light': '#6B6B6B',
          yellow: '#F5C518',
          'yellow-dark': '#C9A000',
          'yellow-light': '#FFD700',
          blue: '#1E6FBA',
          'blue-light': '#2D8DD9',
          'blue-dark': '#0F4A82',
          white: '#F5F5F5',
          'white-off': '#E8E8E8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-dg': 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, #0F4A82 100%)',
        'gradient-yellow': 'linear-gradient(135deg, #F5C518 0%, #C9A000 100%)',
      },
    },
  },
  plugins: [],
}
