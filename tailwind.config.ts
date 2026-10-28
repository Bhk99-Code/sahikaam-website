import type { Config } from "tailwindcss";

// SahiKaam design tokens ("navy, ivory and gold" theme). Values are CSS variables in app/globals.css,
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
        sans: ["'Noto Sans Devanagari'", "Arial", "sans-serif"],
        display: ["'Noto Serif Devanagari'", "Georgia", "serif"],
      },
      borderRadius: { card: "22px" },
      boxShadow: {
        glow: "0 14px 40px -12px rgba(20,35,56,0.45)",
        lift: "0 18px 40px -18px rgba(20,35,56,0.45)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(120deg, #142338 0%, #223A58 100%)",
        "gold-gradient": "var(--gold-gradient)",
      },
    },
  },
  plugins: [],
};
export default config;
