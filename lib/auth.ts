import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";
import { one, run } from "./db";
import { sendMail } from "./mail";
import { isEmailConfigured, isProduction } from "./env";

export const SESSION_COOKIE = "sk_session";
const SESSION_DAYS = 60;
const CODE_MINUTES = 10;
const MAX_CODES_PER_HOUR = 5;
const MAX_ATTEMPTS = 5;

export type User = { id: string; email: string };

function secret() {
  const s = process.env.APP_SECRET;
  if (s && s.length >= 32) return s;
  if (isProduction) throw new Error("APP_SECRET (32+ characters) is required in production");
  return "local-preview-secret-not-for-production-use";
}

const hash = (v: string) => crypto.createHmac("sha256", secret()).update(v).digest("hex");
const now = () => Date.now();

export function normalizeEmail(raw: unknown) {
  const email = String(raw ?? "").trim().toLowerCase();
  return /^[^\s@]{1,64}@[^\s@]{1,180}\.[a-z]{2,}$/.test(email) ? email : null;
}

/** Creates a 6-digit login code and emails it. In local preview it returns the code instead. */
export async function sendLoginCode(email: string): Promise<{ ok: true; devCode?: string } | { ok: false; error: string }> {
  const existing = await one<{ sent_count: number; window_start: number }>(
    "SELECT sent_count, window_start FROM login_codes WHERE email = ?", [email]);
  const inWindow = existing && now() - Number(existing.window_start) < 3600_000;
  if (inWindow && Number(existing.sent_count) >= MAX_CODES_PER_HOUR) {
    return { ok: false, error: "Bahut zyada code maange gaye. 1 ghante baad try karein." };
  }

  const code = String(crypto.randomInt(100000, 1000000));
  const sentCount = inWindow ? Number(existing.sent_count) + 1 : 1;
  const windowStart = inWindow ? Number(existing.window_start) : now();
  await run("DELETE FROM login_codes WHERE email = ?", [email]);
  await run(
    "INSERT INTO login_codes (email, code_hash, expires_at, attempts, sent_count, window_start) VALUES (?, ?, ?, 0, ?, ?)",
    [email, hash(email + ":" + code), now() + CODE_MINUTES * 60_000, sentCount, windowStart]);

  if (!isEmailConfigured) {
    if (isProduction) return { ok: false, error: "Login email abhi set nahi hai. Thodi der baad try karein." };
    console.log(`[local preview] login code for ${email}: ${code}`);
    return { ok: true, devCode: code };
  }
  try {
    await sendMail(
      email,
      `SahiKaam login code: ${code}`,
      `<div style="font-family:sans-serif;font-size:16px"><h2>SahiKaam login code</h2><p>Aapka code hai: <b style="font-size:24px;letter-spacing:4px">${code}</b></p><p>Ye code ${CODE_MINUTES} minute tak chalega. Agar aapne login nahi kiya, to is email ko ignore karein.</p></div>`,
      `SahiKaam login code: ${code}\nYe code ${CODE_MINUTES} minute tak chalega.`);
  } catch (e) {
    console.error("sendLoginCode", e);
    return { ok: false, error: "Email nahi ja paya. Thodi der baad try karein." };
  }
  return { ok: true };
}

/** Checks the code; on success creates the user (if new) and a session cookie. */
export async function verifyLoginCode(email: string, code: string): Promise<boolean> {
  const row = await one<{ code_hash: string; expires_at: number; attempts: number }>(
    "SELECT code_hash, expires_at, attempts FROM login_codes WHERE email = ?", [email]);
  if (!row || Number(row.expires_at) < now() || Number(row.attempts) >= MAX_ATTEMPTS) return false;

  const a = Buffer.from(hash(email + ":" + code));
  const b = Buffer.from(String(row.code_hash));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    await run("UPDATE login_codes SET attempts = attempts + 1 WHERE email = ?", [email]);
    return false;
  }
  await run("DELETE FROM login_codes WHERE email = ?", [email]);

  let user = await one<User>("SELECT id, email FROM users WHERE email = ?", [email]);
  if (!user) {
    user = { id: crypto.randomUUID(), email };
    await run("INSERT INTO users (id, email, created_at) VALUES (?, ?, ?)", [user.id, email, now()]);
  }

  const token = crypto.randomBytes(32).toString("base64url");
  const expires = now() + SESSION_DAYS * 86400_000;
  await run("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)", [hash(token), user.id, expires]);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true, secure: isProduction, sameSite: "lax", path: "/", expires: new Date(expires),
  });
  return true;
}

export async function getUser(): Promise<User | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return one<User>(
    "SELECT u.id, u.email FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?",
    [hash(token), now()]);
}

export async function signOut() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) await run("DELETE FROM sessions WHERE token_hash = ?", [hash(token)]);
  cookies().delete(SESSION_COOKIE);
}
