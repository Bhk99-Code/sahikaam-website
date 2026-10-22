export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "team@sahikaam.com";
export const SUPPORT_WHATSAPP = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "";

export const isRazorpayConfigured = Boolean(
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
);
export const isEmailConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
export const isProduction = process.env.NODE_ENV === "production";
