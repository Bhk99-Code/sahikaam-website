import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
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
          // HTTPS only for 1 year (no includeSubDomains: other subdomains run on separate hosting)
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://api.razorpay.com\" \"https://checkout.razorpay.com\")" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          // Scripts are not restricted here (Next.js + Razorpay need them); this blocks framing, plugins and foreign form posts
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'; form-action 'self' https://api.razorpay.com https://checkout.razorpay.com; upgrade-insecure-requests" },
        ],
      },
    ];
  },
};
export default nextConfig;
