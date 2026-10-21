/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#FF8FA3',
          'pink-bright': '#FF6B8B',
          blush: '#FFF0F3',
          petal: '#FFB5C2',
          soft: '#FFF9FA',
          espresso: '#4A353B',
          muted: '#8C6E75',
          gold: '#E0A96D',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Lora', 'serif'],
        sans: ['Inter', 'Be Vietnam Pro', 'sans-serif'],
      },
      boxShadow: {
        'pink-glow': '0 8px 30px rgba(255, 143, 163, 0.22)',
        'pink-soft': '0 4px 20px rgba(255, 181, 194, 0.15)',
        'glass': '0 8px 32px 0 rgba(255, 143, 163, 0.1)',
      },
      borderRadius: {
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
