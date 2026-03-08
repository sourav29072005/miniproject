/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0b4db7",      // Blue
        primaryDark: "#0b2a90",
        secondary: "#0F172A",    // Dark slate
        accent: "#F59E0B",       // Amber
        success: "#16A34A",
        danger: "#DC2626",
        muted: "#64748B",
        background: "#F8FAFC",
        header: "#0b4db7"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        xl2: "1rem",
      },
      boxShadow: {
        card: "0 4px 14px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
}