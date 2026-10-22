import type { Config } from "tailwindcss";

// SahiKaam design tokens: dark "night" surfaces, warm cream text, saffron brand with bright category accents.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: { DEFAULT: "#0B0A10", 2: "#13121A", 3: "#1B1924", 4: "#262333", 5: "#34304A" },
        cream: { DEFAULT: "#F7F2EA", 2: "#D9D3CA" },
        fog: { DEFAULT: "#A6A2B4", 2: "#7D7990" },
        saffron: { 300: "#FFC285", 400: "#FFA048", 500: "#FF7A1A", 600: "#EE6200", 700: "#C24E00" },
        rosy: "#FF4F7B",
        mint: "#18C7A6",
        sky: "#3D9BFF",
        sun: "#FFC233",
        grape: "#A970FF",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        display: ["'Bricolage Grotesque'", "'Plus Jakarta Sans'", "system-ui", "sans-serif"],
      },
      borderRadius: { card: "22px" },
      boxShadow: {
        glow: "0 20px 60px -15px rgba(255,122,26,0.45)",
        lift: "0 18px 40px -18px rgba(0,0,0,0.8)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(120deg, #FF7A1A 0%, #FF4F7B 55%, #A970FF 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
