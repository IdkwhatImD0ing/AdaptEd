import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "var(--bg)",
          surface: "var(--surface)",
          elevated: "var(--elevated)",
          border: "var(--border)",
          rule: "var(--rule)",
        },
        paper: {
          DEFAULT: "var(--text)",
          muted: "var(--text-muted)",
          subtle: "var(--text-subtle)",
        },
        violet: {
          core: "var(--primary)",
          soft: "var(--primary-soft)",
          deep: "var(--primary-deep)",
          glow: "var(--primary-glow)",
        },
        cream: "var(--accent)",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightish: "-0.02em",
        tighter: "-0.04em",
        widish: "0.04em",
        widest: "0.22em",
      },
      animation: {
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.215, 0.61, 0.355, 1) infinite",
        sheen: "sheen 6s linear infinite",
        "fade-in": "fade-in 600ms ease-out forwards",
        "slow-spin": "slow-spin 30s linear infinite",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.6)", opacity: "0.7" },
          "80%, 100%": { transform: "scale(2.2)", opacity: "0" },
        },
        sheen: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slow-spin": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
