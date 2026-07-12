/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dae7ff',
          200: '#bad3ff',
          300: '#8bb5ff',
          400: '#568cff',
          500: '#2f66ff',
          600: '#1a48f5',
          700: '#1638d6',
          800: '#1830a8',
          900: '#1a2f83',
        },
      },
      boxShadow: {
        soft: '0 4px 20px -6px rgba(20, 30, 60, 0.08)',
        card: '0 1px 3px rgba(20,30,60,0.04), 0 6px 20px -8px rgba(20,30,60,0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
