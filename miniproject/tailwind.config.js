/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    screens: {
      'xs': '400px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: "#0b4db7",      // Blue
        primaryDark: "#0b2a90",
        primaryLight: "#3d6db8",
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
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 4px 14px rgba(0,0,0,0.08)",
        elevated: "0 10px 30px rgba(0,0,0,0.1)",
        hover: "0 20px 40px rgba(11, 77, 183, 0.15)",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #0b4db7 0%, #0b2a90 100%)",
        "gradient-light": "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        "gradient-overlay": "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-in",
        "slide-up": "slideUp 0.6s ease-out",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "parallax": "parallax 1s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(30px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        parallax: {
          "0%": { transform: "translateY(10px)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      transitionDuration: {
        "350": "350ms",
        "400": "400ms",
        "500": "500ms",
      },
    },
  },
  plugins: [],
}