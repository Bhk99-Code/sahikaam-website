import type { Config } from "tailwindcss";

// SahiKaam design tokens ("royal navy and gold" theme).
// Token names are roles: night = surfaces (page, card, field), cream = primary text, fog = muted text, ink = hairlines/washes.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: { DEFAULT: "#0A1230", 2: "#111B40", 3: "#17234F", 4: "#1F2D60", 5: "#2A3A75" },
        cream: { DEFAULT: "#F5F1E6", 2: "#CBD1E4" },
        ink: "#F5F1E6",
        fog: { DEFAULT: "#9AA4C7", 2: "#7480A8" },
        saffron: { 300: "#FFE29A", 400: "#FFCB5C", 500: "#F5B83D", 600: "#E0A21F", 700: "#C98B12" },
        rosy: "#FF6B57",
        mint: "#2EC4B6",
        sky: "#5AA9FF",
        sun: "#F5B83D",
        grape: "#B197FC",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        display: ["'Bricolage Grotesque'", "'Plus Jakarta Sans'", "system-ui", "sans-serif"],
      },
      borderRadius: { card: "22px" },
      boxShadow: {
        glow: "0 14px 40px -12px rgba(245,184,61,0.55)",
        lift: "0 18px 40px -18px rgba(0,0,0,0.75)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(120deg, #F5B83D 0%, #FFD98A 45%, #2EC4B6 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
