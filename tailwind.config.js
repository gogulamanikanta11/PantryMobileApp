/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#1e293b', // Custom slate shades for modern blending
          950: '#020617',
        }
      },
      boxShadow: {
        'glow': '0 0 15px rgba(16, 185, 129, 0.4)',
        'cyan-glow': '0 0 15px rgba(6, 182, 212, 0.4)',
      }
    },
  },
  plugins: [],
}
