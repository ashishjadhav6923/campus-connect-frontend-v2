/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        fadeOut: {
          '0%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { opacity: '0' },
        }
      },
      animation: {
        'fade-out': 'fadeOut 4s ease-in-out forwards',
      }
    },
  },
  plugins: [],
}