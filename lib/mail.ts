import "server-only";
import nodemailer from "nodemailer";
import { isEmailConfigured } from "./env";

/** Sends mail through the Hostinger mailbox (smtp.hostinger.com). */
export async function sendMail(to: string, subject: string, html: string, text: string) {
  if (!isEmailConfigured) throw new Error("SMTP not configured");
  const port = Number(process.env.SMTP_PORT || 465);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transport.sendMail({
    from: process.env.EMAIL_FROM || `SahiKaam <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    text,
  });
}
