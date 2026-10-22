import type { Config } from "tailwindcss";

// SahiKaam design tokens ("emerald and mango" theme).
// Token names are roles: night = surfaces (page, card, field), cream = primary text, fog = muted text, ink = hairlines/washes.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: { DEFAULT: "#06140F", 2: "#0D2219", 3: "#132C21", 4: "#1A382A", 5: "#244634" },
        cream: { DEFAULT: "#F3F5EE", 2: "#CAD6CE" },
        ink: "#F3F5EE",
        fog: { DEFAULT: "#98AFA4", 2: "#6F877C" },
        saffron: { 300: "#FFD58A", 400: "#FFC24F", 500: "#FFB02E", 600: "#F29A12", 700: "#D9830A" },
        rosy: "#FF6B4A",
        mint: "#3DDC97",
        sky: "#4FB3FF",
        sun: "#FFD43B",
        grape: "#C08BFF",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        display: ["'Bricolage Grotesque'", "'Plus Jakarta Sans'", "system-ui", "sans-serif"],
      },
      borderRadius: { card: "22px" },
      boxShadow: {
        glow: "0 14px 40px -12px rgba(255,176,46,0.55)",
        lift: "0 18px 40px -18px rgba(0,0,0,0.75)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(120deg, #FFB02E 0%, #FFD27A 45%, #3DDC97 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
