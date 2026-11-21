/**
 * Feature switches that both server and browser code can read (NEXT_PUBLIC_* is baked in at build).
 * Mobile/WhatsApp sign-in and checkout: off for now — email only. Turn on later with
 * NEXT_PUBLIC_PHONE_LOGIN=1 (plus SMS_PROVIDER/SMS_API_KEY) and a rebuild.
 */
export const PHONE_LOGIN = process.env.NEXT_PUBLIC_PHONE_LOGIN === "1";
/** Words for the contact box, matching the switch above. */
export const CONTACT_LABEL = PHONE_LOGIN ? "Email or mobile number" : "Email address";
export const CONTACT_PLACEHOLDER = PHONE_LOGIN ? "you@example.com or 98765 43210" : "you@example.com";
export const CONTACT_ERROR = PHONE_LOGIN ? "Enter a valid email address or 10-digit mobile number." : "Enter a valid email address.";
