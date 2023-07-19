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
        primary: 'var(--link-color)',
        'primary-active': 'var(--drop-down-menu-bg)',
        white: 'var(--button-text-hover)',
        'txt-primary': 'var(--text)',
        'txt-secondary': 'var(--text-muted)',
        modal: 'var(--modal-bg-color)',
      },
    },
  },
  plugins: [],
};
