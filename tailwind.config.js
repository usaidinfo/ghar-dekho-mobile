/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontSize: {
        'heading-1': ['24px', { lineHeight: '32px', fontWeight: '900'}],
        'heading-2': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'heading-3': ['16px', { lineHeight: '24px', fontWeight: '600' }],
        'heading-4': ['14px', { lineHeight: '20px', fontWeight: '600' }],
        'heading-5': ['12px', { lineHeight: '18px', fontWeight: '600' }],
        'subheading': ['12px', { lineHeight: '18px', fontWeight: '600' }],
      },
      colors: {
        primary: '#122A47',
        /** Darker navy — headings, gradient start (pairs with `primary`) */
        'primary-deep': '#00152e',
        secondary: '#D1A14E',
        tertiary: '#D1A14E',
        neutral: '#777779',
        surface: '#faf9fc',
        dark: '#1b1c1e',
        'surface-input': '#e3e2e5',
        'surface-input-alt': '#e9e7ea',
        'surface-low': '#f5f3f6',
        'surface-panel': '#efedf0',
        /** Muted body on surface */
        'variant-fg': '#44474d',
        /** Gold wash / bento accents (Stitch reference) */
        'gold-container': '#fec972',
        'accent-soft': '#ffdeac',
        'primary-soft': '#b1c8ec',
        'on-primary': '#ffffff',
        error: '#ba1a1a',
        outline: '#c4c6ce',
        /** Property detail / Stitch brand accents (teal + gold) */
        'brand-teal': '#008080',
        'brand-gold': '#C5A059',
        'surface-page': '#F8F9FA',
        'surface-card': '#FFFFFF',
        'surface-muted': '#F1F3F5',
        'slate-muted': '#4A5568',
        'outline-light': '#E2E8F0',
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        }
      }
    },
  },
  plugins: [],
}