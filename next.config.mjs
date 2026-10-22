import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverComponentsExternalPackages: ["mysql2", "nodemailer"] },
  webpack: (config) => {
    // pdf.js optionally requires 'canvas' in Node; not needed in the browser
    config.resolve.alias.canvas = false;
    // "@/..." imports: set here too, so builds work even if tsconfig paths are not picked up
    config.resolve.alias["@"] = root;
    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};
export default nextConfig;
