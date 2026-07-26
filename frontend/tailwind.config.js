/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: '#0F172A',
          foreground: '#F8FAFC',
        },
        accent: {
          DEFAULT: '#0EA5E9',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
        },
        card: {
          DEFAULT: 'rgba(255, 255, 255, 0.85)',
          dark: 'rgba(15, 23, 42, 0.85)',
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],

}
