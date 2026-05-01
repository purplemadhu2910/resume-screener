/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "sans-serif"] },
      animation: { "spin-slow": "spin 2s linear infinite" },
    },
  },
  plugins: [],
}

