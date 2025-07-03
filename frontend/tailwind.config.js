// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Le decimos que escanee todos los archivos relevantes en la carpeta src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}