/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#28521F",
          dark: "#1D3C17",
          light: "#EAF3E7",
        },
        orange: {
          DEFAULT: "#F7934C",
          dark: "#E7772D",
        },
        background: "#F7F8F6",
        card: "#FFFFFF",
        success: "#2E7D32",
        warning: "#F59E0B",
        danger: "#DC2626",
        info: "#2563EB",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-noto)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "10px",
        lg: "12px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 16, 0.04), 0 1px 3px rgba(16, 24, 16, 0.06)",
      },
    },
  },
  plugins: [],
};
