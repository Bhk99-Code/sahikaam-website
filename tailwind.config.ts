import type { Config } from "tailwindcss";

// SahiKaam design tokens (light "cream and saffron" theme).
// Token names are roles: night = surfaces (page, card, field), cream = primary text, fog = muted text, ink = hairlines/washes.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: { DEFAULT: "#FFF7EC", 2: "#FFFFFF", 3: "#FBF0E1", 4: "#F4E6D3", 5: "#EAD7BF" },
        cream: { DEFAULT: "#1C1424", 2: "#463B4D" },
        ink: "#1C1424",
        fog: { DEFAULT: "#6B5F70", 2: "#8C8191" },
        saffron: { 300: "#F08C3A", 400: "#D9480F", 500: "#E8590C", 600: "#D9480F", 700: "#B03A0A" },
        rosy: "#C2255C",
        mint: "#2B8A3E",
        sky: "#1C7ED6",
        sun: "#F59F00",
        grape: "#7048E8",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        display: ["'Bricolage Grotesque'", "'Plus Jakarta Sans'", "system-ui", "sans-serif"],
      },
      borderRadius: { card: "22px" },
      boxShadow: {
        glow: "0 14px 34px -12px rgba(232,89,12,0.55)",
        lift: "0 18px 40px -18px rgba(60,30,10,0.45)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(120deg, #E8590C 0%, #D6336C 60%, #AE3EC9 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
