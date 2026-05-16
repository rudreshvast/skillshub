/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Navbar & primary dark surfaces
        espresso: {
          950: '#1a1108',
          900: '#292524',
          800: '#3c2f2a',
          700: '#57453e',
        },
        // Sidebar & content surfaces
        parchment: {
          50: '#fffcf8',
          100: '#faf8f5',
          200: '#f5f0eb',
          300: '#ede4da',
          400: '#ddd3c6',
        },
        // Borders
        stone: {
          200: '#e5e0d8',
          300: '#d4cdc4',
          400: '#b8b0a6',
          500: '#a8a29e',
          600: '#78716c',
        },
        // Primary accent — Terracotta
        terra: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          400: '#fb923c',
          500: '#ea6a1e',
          600: '#c2682a',
          700: '#9a3412',
          800: '#7c2d12',
        },
        // Text
        ink: {
          900: '#1c1917',
          700: '#3d3530',
          500: '#57534e',
          400: '#78716c',
          300: '#a8a29e',
        },
        // Match scores & data highlights
        teal: {
          500: '#0d9488',
          600: '#0f766e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px', letterSpacing: '0.05em' }],
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['13px', { lineHeight: '20px' }],
        base: ['14px', { lineHeight: '22px' }],
        lg: ['16px', { lineHeight: '24px' }],
        xl: ['18px', { lineHeight: '28px' }],
        '2xl': ['22px', { lineHeight: '30px', letterSpacing: '-0.02em' }],
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(28,25,23,0.08)',
        soft: '0 2px 8px rgba(28,25,23,0.07)',
      },
    },
  },
  plugins: [],
};
