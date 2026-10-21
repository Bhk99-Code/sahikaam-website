import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50: "#FFF4EC", 100: "#FFE4D2", 200: "#FBD5BA", 500: "#EA580C", 600: "#C2410C", 700: "#9A3412" },
        ink: { DEFAULT: "#17171A", 2: "#2A2B30", 3: "#4A4B52", 4: "#55565C", 5: "#6B6C72" },
        line: "#E6E7EB",
        mist: "#F4F5F7",
      },
      fontFamily: { sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"], serif: ["'DM Serif Display'", "Georgia", "serif"] },
      borderRadius: { card: "20px" },
      boxShadow: { card: "0 6px 20px rgba(23,23,26,0.05)", float: "0 8px 28px rgba(23,23,26,0.12)" },
    },
  },
  plugins: [],
};
export default config;
