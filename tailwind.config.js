/** @type {import('tailwindcss').Config} */
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#1E293B',
        secondary: '#C8A45D',
        navy: '#1E293B',
        gold: '#C8A45D',
        cream: '#FAF7F2',
        'navy-light': '#2D3B4F',
        'gold-dark': '#B08D45',
        'gold-light': '#D4B76A',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        playfair: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'inner-sm': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}