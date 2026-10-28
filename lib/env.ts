export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "team@sahikaam.com";
export const SUPPORT_WHATSAPP = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "";

export const isRazorpayConfigured = Boolean(
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
);
export const isEmailConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
export const isProduction = process.env.NODE_ENV === "production";
/**
 * Mobile login codes: SMS_PROVIDER = "fast2sms", "msg91" (+ SMS_TEMPLATE_ID) or "whatsapp"
 * (WhatsApp Cloud API: SMS_API_KEY is the access token, plus WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_TEMPLATE,
 * an approved authentication template; WHATSAPP_TEMPLATE_LANG defaults to "en").
 */
export const isSmsConfigured = Boolean(
  process.env.SMS_API_KEY && (
    process.env.SMS_PROVIDER === "fast2sms" ||
    (process.env.SMS_PROVIDER === "msg91" && process.env.SMS_TEMPLATE_ID) ||
    (process.env.SMS_PROVIDER === "whatsapp" && process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_TEMPLATE))
);
/** How a mobile code reaches the buyer, for messages on screen. */
export const phoneChannel = process.env.SMS_PROVIDER === "whatsapp" ? "WhatsApp" : "SMS";
/** Emails allowed to open /admin (comma separated). Empty = admin page is off. */
export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
