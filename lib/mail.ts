import "server-only";
import nodemailer from "nodemailer";
import { isEmailConfigured } from "./env";

/**
 * Sends mail via Resend's HTTPS API when RESEND_API_KEY is set (preferred — Hostinger's shared
 * hosting blocks outbound SMTP relay from its own Node.js apps back to its own mail servers, so
 * SMTP_HOST/SMTP_USER/SMTP_PASS reliably fails with "535 authentication failed" even with correct
 * credentials). Falls back to direct SMTP (smtp.hostinger.com) when no Resend key is configured.
 */
export async function sendMail(to: string, subject: string, html: string, text: string) {
  if (!isEmailConfigured) throw new Error("Email not configured");

  if (process.env.RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || `SahiKaam <${process.env.SMTP_USER || "team@sahikaam.com"}>`,
        to, subject, html, text,
      }),
    });
    if (!res.ok) throw new Error(`Resend: ${res.status} ${(await res.text()).slice(0, 200)}`);
    return;
  }

  const port = Number(process.env.SMTP_PORT || 465);
  const user = (process.env.SMTP_USER || "").trim();
  const pass = process.env.SMTP_PASS || "";
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    authMethod: "PLAIN",
    auth: { user, pass },
    tls: { servername: "smtp.hostinger.com", minVersion: "TLSv1.2" },
    family: 4,
  } as nodemailer.TransportOptions);
  await transport.sendMail({
    from: process.env.EMAIL_FROM || `SahiKaam <${user}>`,
    to,
    subject,
    html,
    text,
  });
}
