/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        'plex-primary': {
          DEFAULT: '#e5a00d',
          50: 'rgba(229, 160, 13, 0.1)',
          100: 'rgba(229, 160, 13, 0.2)',
          200: 'rgba(229, 160, 13, 0.3)',
          300: 'rgba(229, 160, 13, 0.4)',
          400: 'rgba(229, 160, 13, 0.5)',
          500: 'rgba(229, 160, 13, 0.6)',
          600: 'rgba(229, 160, 13, 0.7)',
          700: 'rgba(229, 160, 13, 0.8)',
          800: 'rgba(229, 160, 13, 0.9)',
          900: '#e5a00d',
        },
      },
      boxShadow: {
        glass:
          '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glass-hover':
          '0 12px 40px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        plex: '0 4px 12px rgba(229, 160, 13, 0.3)',
        'plex-hover': '0 6px 16px rgba(229, 160, 13, 0.4)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-in': 'slideIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
