import fs from "fs";
import path from "path";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "team@sahikaam.com";
export const SUPPORT_WHATSAPP = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "";

export const isRazorpayConfigured = Boolean(
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
);
/** Email: RESEND_API_KEY (preferred — Hostinger's own shared-hosting IPs block outbound SMTP
 *  relay to their own mail servers, so direct SMTP from this app is unreliable) or the
 *  SMTP_HOST/SMTP_USER/SMTP_PASS trio as a fallback. */
export const isEmailConfigured = Boolean(
  process.env.RESEND_API_KEY || (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
);
export const isProduction = process.env.NODE_ENV === "production";
/** Emails allowed to open /admin: the ADMIN_EMAILS env var (comma separated) plus content/admins.json. Empty = admin is off. */
function adminsFromFile(): string[] {
  try {
    const list = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content", "admins.json"), "utf8")).emails;
    return Array.isArray(list) ? list.map((x) => String(x).trim().toLowerCase()).filter(Boolean) : [];
  } catch { return []; }
}
export const ADMIN_EMAILS = [...new Set([
  ...(process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
  ...adminsFromFile(),
])];
