import type { Config } from "tailwindcss";

// SahiKaam design tokens ("orange, black and white" theme).
// Token names are roles: night = surfaces (page, card, field), cream = primary text, fog = muted text, ink = hairlines/washes.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: { DEFAULT: "#0A0A0A", 2: "#141414", 3: "#1C1C1C", 4: "#262626", 5: "#333333" },
        cream: { DEFAULT: "#FFFFFF", 2: "#D4D4D4" },
        ink: "#FFFFFF",
        fog: { DEFAULT: "#A3A3A3", 2: "#737373" },
        saffron: { 300: "#FFB27A", 400: "#FF8A3D", 500: "#FF6A00", 600: "#E65F00", 700: "#C24F00" },
        rosy: "#FF6A00",
        mint: "#FF8A3D",
        sky: "#FFA866",
        sun: "#FFFFFF",
        grape: "#FFC59A",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        display: ["'Bricolage Grotesque'", "'Plus Jakarta Sans'", "system-ui", "sans-serif"],
      },
      borderRadius: { card: "22px" },
      boxShadow: {
        glow: "0 14px 40px -12px rgba(255,106,0,0.6)",
        lift: "0 18px 40px -18px rgba(0,0,0,0.75)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(120deg, #FF6A00 0%, #FF8A3D 55%, #FFB27A 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
