/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        mint: { DEFAULT: '#00CBA5', light: '#EEFFFC', line: '#B8ECE0' },
        lime: '#D7F3B7',
        ink: { DEFAULT: '#1A1A1A', sub: '#6A6A6A', mute: '#A4A4A4' },
        line: '#EAEAEA',
        fill: '#F7F7F7',
      },
      fontFamily: {
        sans: ['YuhanKimberlyPureunsoop', '-apple-system', 'system-ui', 'sans-serif'],
        },
    },
  },
  plugins: [],
}