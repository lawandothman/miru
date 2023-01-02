/* eslint-disable @typescript-eslint/no-var-requires */

const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        ...defaultTheme.keyframes,
        'slide-up-fade': {
          '0%': { opacity: 0, transform: 'translateY(2px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'slide-right-fade': {
          '0%': { opacity: 0, transform: 'translateX(-2px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        'slide-down-fade': {
          '0%': { opacity: 0, transform: 'translateY(-2px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'slide-left-fade': {
          '0%': { opacity: 0, transform: 'translateX(2px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
      },
      animation: {
        ...defaultTheme.animation,
        'slide-up-fade': 'slide-up-fade 0.1s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-right-fade':
          'slide-right-fade 0.1s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down-fade': 'slide-down-fade 0.1s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-left-fade': 'slide-left-fade 0.1s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('tailwindcss-radix')(),
  ],
}
