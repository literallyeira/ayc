import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Calm white / lavender palette
        ink: {
          DEFAULT: "#26233a", // deep, soft purple-ink for text
          soft: "#4a4660",
          muted: "#827e98",
          faint: "#aaa6bd",
        },
        paper: {
          DEFAULT: "#fbfaff", // app background, warm-cool white
          card: "#ffffff",
          sunk: "#f4f2fb", // sunken / track surfaces
        },
        lav: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#e1dbfb",
          300: "#cabffa",
          400: "#a594f4",
          500: "#8b78ec", // primary accent
          600: "#7763d8",
          700: "#6450b8",
        },
        sage: {
          100: "#e7f3ee",
          400: "#7cc3a3",
          500: "#56b08a", // completion / success
          600: "#3f9774",
        },
        blush: {
          100: "#fdeef2",
          400: "#f3a8bd",
          500: "#e87fa0",
        },
        line: "#ebe8f5",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(38,35,58,0.04), 0 8px 24px -12px rgba(98,80,184,0.18)",
        lift: "0 2px 4px rgba(38,35,58,0.05), 0 18px 40px -16px rgba(98,80,184,0.28)",
        ring: "0 0 0 4px rgba(139,120,236,0.14)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pop": {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "60%": { transform: "scale(1.08)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "draw": {
          "0%": { strokeDashoffset: "var(--circ)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
        "pop": "pop 0.35s cubic-bezier(0.22,1,0.36,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
