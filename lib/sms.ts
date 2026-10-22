import "server-only";
import { isSmsConfigured } from "./env";

/**
 * Sends a login code by SMS to an Indian number ("+91XXXXXXXXXX").
 * fast2sms: OTP route (no DLT template needed). msg91: OTP API with a DLT-approved template.
 */
export async function sendSmsCode(phone: string, code: string) {
  if (!isSmsConfigured) throw new Error("SMS not configured");
  const key = process.env.SMS_API_KEY!;
  const ten = phone.replace(/^\+91/, "");
  if (process.env.SMS_PROVIDER === "fast2sms") {
    const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: { authorization: key, "Content-Type": "application/json" },
      body: JSON.stringify({ route: "otp", variables_values: code, numbers: ten }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.return !== true) throw new Error(`fast2sms: ${res.status} ${JSON.stringify(data).slice(0, 200)}`);
    return;
  }
  const url = new URL("https://control.msg91.com/api/v5/otp");
  url.searchParams.set("template_id", process.env.SMS_TEMPLATE_ID!);
  url.searchParams.set("mobile", "91" + ten);
  url.searchParams.set("otp", code);
  const res = await fetch(url, { method: "POST", headers: { authkey: key, "Content-Type": "application/json" } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.type !== "success") throw new Error(`msg91: ${res.status} ${JSON.stringify(data).slice(0, 200)}`);
}
