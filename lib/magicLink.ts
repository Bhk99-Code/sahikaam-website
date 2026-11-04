import "server-only";
import crypto from "crypto";
import { one, run } from "./db";
import { isProduction } from "./env";

/**
 * One-tap sign-in link sent after a guest checkout pays (lib/grant.ts): the buyer never typed a
 * code, so there is nothing to verify at payment time — this lets them open their library with a
 * single click afterward instead. 7 days, single use.
 *
 * Cookies can only be set from a Route Handler or Server Action, not a plain page render, so this
 * module only does the database work — app/magic/[token]/route.ts (a Route Handler) sets the
 * session cookie on its redirect response using the token this returns.
 */
const LINK_DAYS = 7;

function secret() {
  const s = process.env.APP_SECRET;
  if (s && s.length >= 32) return s;
  if (isProduction) throw new Error("APP_SECRET (32+ characters) is required in production");
  return "local-preview-secret-not-for-production-use";
}
const hash = (v: string) => crypto.createHmac("sha256", secret()).update(v).digest("hex");

export async function createMagicLink(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("base64url");
  await run("INSERT INTO magic_links (token_hash, user_id, expires_at) VALUES (?, ?, ?)",
    [hash(token), userId, Date.now() + LINK_DAYS * 86400_000]);
  return token;
}

/** Verifies and uses up a magic-link token, then creates a normal session row. Returns the raw
 *  session token + its expiry for the caller to set as the sk_session cookie, or null if the
 *  magic-link token is invalid/expired/already used. */
export async function consumeMagicLink(token: string): Promise<{ sessionToken: string; expires: Date } | null> {
  const row = await one<{ user_id: string; expires_at: number; used_at: number | null }>(
    "SELECT user_id, expires_at, used_at FROM magic_links WHERE token_hash = ?", [hash(token)]);
  if (!row || row.used_at != null || Number(row.expires_at) < Date.now()) return null;
  await run("UPDATE magic_links SET used_at = ? WHERE token_hash = ?", [Date.now(), hash(token)]);

  const sessionToken = crypto.randomBytes(32).toString("base64url");
  const expires = Date.now() + 60 * 86400_000; // same 60-day session length as lib/auth.ts
  await run("INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
    [hash(sessionToken), row.user_id, expires, Date.now()]);
  return { sessionToken, expires: new Date(expires) };
}
