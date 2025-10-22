/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
    extend: {
      // Neutral placeholder tokens — replace with brand tokens if available.
      colors: {
        brand: {
          DEFAULT: '#374151' // neutral placeholder — replace with your brand color when available
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp')
  ]
};
