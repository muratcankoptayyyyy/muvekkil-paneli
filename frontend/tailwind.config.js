/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        brand: {
          50: '#f2f9f9',
          100: '#e0f2f2',
          200: '#c1e6e6',
          300: '#96d3d3',
          400: '#65b8b9',
          500: '#459c9d',
          600: '#548c8d', // Main color used in app
          700: '#457c7d', // Darker shade used in gradient
          800: '#3d6566',
          900: '#335253',
        },
      },
    },
  },
  plugins: [],
}
