/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        robinhoodGreen: '#00C805',
        darkGrey: '#1E2124',
      }
    },
  },
  plugins: [],
}