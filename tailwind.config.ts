import type { Config } from "tailwindcss";

// SahiKaam design tokens ("studio" theme: off-white, near-black, orange). Values are CSS variables in app/globals.css,
// so a dark navy band (.on-navy) can flip them without new class names.
// Token names are roles: night = surfaces (page, card, field), cream = primary text, fog = muted text, ink = hairlines/washes.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: { DEFAULT: "rgb(var(--night) / <alpha-value>)", 2: "rgb(var(--night-2) / <alpha-value>)", 3: "rgb(var(--night-3) / <alpha-value>)", 4: "rgb(var(--night-4) / <alpha-value>)", 5: "rgb(var(--night-5) / <alpha-value>)" },
        cream: { DEFAULT: "rgb(var(--cream) / <alpha-value>)", 2: "rgb(var(--cream-2) / <alpha-value>)" },
        ink: "rgb(var(--ink) / <alpha-value>)",
        fog: { DEFAULT: "rgb(var(--fog) / <alpha-value>)", 2: "rgb(var(--fog-2) / <alpha-value>)" },
        saffron: { 300: "rgb(var(--s300) / <alpha-value>)", 400: "rgb(var(--s400) / <alpha-value>)", 500: "rgb(var(--s500) / <alpha-value>)", 600: "rgb(var(--s600) / <alpha-value>)", 700: "rgb(var(--s700) / <alpha-value>)" },
        rosy: "rgb(var(--rosy) / <alpha-value>)",
        mint: "rgb(var(--mint) / <alpha-value>)",
        sky: "rgb(var(--sky) / <alpha-value>)",
        sun: "rgb(var(--sun) / <alpha-value>)",
        grape: "rgb(var(--grape) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Arial", "sans-serif"],
        display: ["'Inter Tight'", "Inter", "system-ui", "sans-serif"],
        serif: ["'Instrument Serif'", "Georgia", "serif"],
      },
      borderRadius: { card: "24px" },
      boxShadow: {
        glow: "0 14px 40px -12px rgba(255,79,31,0.45)",
        lift: "0 22px 44px -20px rgba(15,15,17,0.28), 0 0 0 1px rgba(15,15,17,0.05)",
        card: "0 1px 0 rgba(255,255,255,0.9) inset, 0 12px 28px -16px rgba(15,15,17,0.16), 0 0 0 1px rgba(15,15,17,0.05)",
        pill: "0 10px 22px -10px rgba(15,15,17,0.55), 0 1px 0 rgba(255,255,255,0.18) inset",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(120deg, #15171C 0%, #2A2D36 100%)",
        "gold-gradient": "var(--gold-gradient)",
      },
    },
  },
  plugins: [],
};
export default config;
