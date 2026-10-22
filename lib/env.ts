export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "team@sahikaam.com";
export const SUPPORT_WHATSAPP = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "";

export const isRazorpayConfigured = Boolean(
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
);
export const isEmailConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
export const isProduction = process.env.NODE_ENV === "production";
/** SMS for mobile login: SMS_PROVIDER = "fast2sms" or "msg91", SMS_API_KEY, and for msg91 also SMS_TEMPLATE_ID. */
export const isSmsConfigured = Boolean(
  process.env.SMS_API_KEY && (process.env.SMS_PROVIDER === "fast2sms" || (process.env.SMS_PROVIDER === "msg91" && process.env.SMS_TEMPLATE_ID))
);
/** Emails allowed to open /admin (comma separated). Empty = admin page is off. */
export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
