/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tier: {
          goated: '#ff8989',
          good: '#f6c087',
          mid: '#e3cc7c',
          bad: '#cfce72',
          remove: '#95b767',
        }
      },
      fontFamily: {
        impact: ['Impact', '"Arial Black"', '"Montserrat"', 'sans-serif'],
        mac: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"SF Pro Display"', '"Inter"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
