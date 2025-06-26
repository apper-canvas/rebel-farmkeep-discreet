/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2D5016',
        secondary: '#7CB342',
        accent: '#FF6F00',
        surface: {
          50: '#FAFAF8',
          100: '#F5F5DC',
          200: '#F0F0E5',
          300: '#EAEADD',
          400: '#E0E0D0',
          500: '#D5D5C3',
          600: '#C5C5B0',
          700: '#B0B098',
          800: '#999980',
          900: '#808060'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        heading: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui']
      }
    },
  },
  plugins: [],
}