/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: '#3AC4BE',
          'teal-dark': '#2ba9a3',
          'teal-light': '#e0f7f6',
          gold: '#FFC200',
          'gold-dark': '#D79617',
        },
      },
    },
  },
  plugins: [],
};
