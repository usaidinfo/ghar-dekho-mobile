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
        primary: '#3c8b27',
        secondary: '#000000',
        cars: '#106099',
        garage: '#EF4444',
        spareparts: '#FFA828',
        otherservice: '#79B3B9',
        'heading-default': '#1F2937',
        'subheading-default': '#6B7280',
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