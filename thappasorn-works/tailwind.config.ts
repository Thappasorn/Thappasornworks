import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0A0A0A",
        surface: "#1A1A1A",
        accent: "#FF6B00",
        "accent-soft": "#FF8A33",
        ink: "#F5F5F5",
        muted: "#9A9AA2",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 14px 44px -10px rgba(255,107,0,.55)",
        "glow-soft": "0 8px 26px -10px rgba(255,107,0,.4)",
      },
      transitionTimingFunction: { apple: "cubic-bezier(.22,1,.36,1)" },
    },
  },
  plugins: [],
} satisfies Config;
