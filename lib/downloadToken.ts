import "server-only";
import crypto from "crypto";
import { isProduction } from "./env";

function secret() {
  const s = process.env.APP_SECRET;
  if (s && s.length >= 32) return s;
  if (isProduction) throw new Error("APP_SECRET (32+ characters) is required in production");
  return "local-preview-secret-not-for-production-use";
}

/**
 * Proof that someone just paid for this order. A download product is handed over right after payment —
 * even to a buyer who never signed in — through /api/download/<orderId>?t=<this token>. The token only
 * works for a PAID order, and only for the files of that order's product.
 */
export const downloadToken = (orderId: string) => crypto.createHmac("sha256", secret()).update("download:" + orderId).digest("hex").slice(0, 40);

export function validDownloadToken(orderId: string, token: string) {
  const a = Buffer.from(downloadToken(orderId));
  const b = Buffer.from(String(token || ""));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
