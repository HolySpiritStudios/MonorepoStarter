import type { Config } from 'tailwindcss';
// @ts-ignore
import * as defaultTheme from 'tailwindcss/defaultTheme';

export default {
  darkMode: ['class'],
  content: ['index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['InterVariable', 'Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        blue: {
          DEFAULT: '#5BA8D7',
          light: '#6BB8E7',
          dark: '#4B98C7',
        },
        cyan: {
          DEFAULT: '#4DD4D4',
          light: '#5DE4E4',
          dark: '#3DC4C4',
        },
        lime: {
          DEFAULT: '#D4FF3C',
          light: '#E4FF5C',
          dark: '#C4EF2C',
        },
        cream: {
          DEFAULT: '#FFF9E8',
          light: '#FFFEF8',
          dark: '#FFF4D8',
        },
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          DEFAULT: '#f97316',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
