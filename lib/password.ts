import "server-only";
import crypto from "crypto";

export const MIN_PASSWORD = 8;
export const MAX_PASSWORD = 128;

/** "scrypt$<salt>$<hash>" (base64) — built-in Node crypto, no extra dependency. */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  return `scrypt$${salt.toString("base64")}$${crypto.scryptSync(password, salt, 64).toString("base64")}`;
}

export function verifyPasswordHash(password: string, stored: string | null): boolean {
  const [scheme, saltB64, hashB64] = (stored ?? "").split("$");
  // No stored hash: still burn the same time, so "no such account" and "wrong password" feel alike.
  const salt = Buffer.from(scheme === "scrypt" ? saltB64 : "AAAAAAAAAAAAAAAAAAAAAA==", "base64");
  const expected = Buffer.from(scheme === "scrypt" ? hashB64 : "", "base64");
  const actual = crypto.scryptSync(password, salt, 64);
  return scheme === "scrypt" && expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

export function passwordProblem(password: unknown): string | null {
  const p = String(password ?? "");
  if (p.length < MIN_PASSWORD) return `Password must be at least ${MIN_PASSWORD} characters.`;
  if (p.length > MAX_PASSWORD) return "Password is too long.";
  return null;
}
