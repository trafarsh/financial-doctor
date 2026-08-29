/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./services/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FCD535",
          active: "#F0B90B",
          disabled: "#3A3A1F",
          foreground: "#181A20",
        },
        canvas: {
          dark: "#0B0E11",
          light: "#FFFFFF",
        },
        surface: {
          card: "#1E2329",
          elevated: "#2B3139",
          soft: "#FAFAFA",
          strong: "#F5F5F5",
        },
        trading: {
          up: "#0ECB81",
          down: "#F6465D",
        },
        ink: "#181A20",
        body: "#EAECEF",
        muted: {
          DEFAULT: "#707A8A",
          strong: "#929AA5",
          dark: "#1E2329",
        },
        hairline: {
          dark: "#2B3139",
          light: "#EAECEF",
        },
        accent: {
          turquoise: "#2DBDB6",
          blue: "#3B82F6",
          amber: "#F59E0B",
        },
        border: "#2B3139",
        background: "#0B0E11",
        foreground: "#EAECEF",
      },
      borderRadius: {
        lg: "8px",
        md: "6px",
        sm: "4px",
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulseGlow 4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
