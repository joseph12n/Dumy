/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        candy: {
          pink: "#e040a0",
          "pink-light": "#f080c0",
          "pink-pale": "#ffd6ee",
          purple: "#7c52aa",
          "purple-light": "#c8a8e8",
          "purple-pale": "#eedcff",
          blue: "#0096cc",
          "blue-light": "#80d0f0",
          "blue-pale": "#c8eaff",
          bg: "#fef7ff",
          surface: "#f8eef8",
          "surface-high": "#f2e8f2",
          text: "#2e1a28",
          "text-secondary": "#604868",
          outline: "#907898",
          "outline-light": "#dcc8e0",
          error: "#e53e3e",
          "error-bg": "#ffe8e8",
          white: "#ffffff",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "DM_Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        candy: "16px",
        pill: "9999px",
      },
    },
  },
  plugins: [],
};
