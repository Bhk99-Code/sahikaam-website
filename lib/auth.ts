import "server-only";
import crypto from "crypto";
import { cookies, headers } from "next/headers";
import { all, one, run } from "./db";
import { sendMail } from "./mail";
import { sendSmsCode } from "./sms";
import { ADMIN_EMAILS, isEmailConfigured, isProduction, isSmsConfigured, phoneChannel } from "./env";
import { hashPassword, passwordProblem, verifyPasswordHash } from "./password";

export const SESSION_COOKIE = "sk_session";
const SESSION_DAYS = 60;
const CODE_MINUTES = 10;
const MAX_CODES_PER_HOUR = 5; // per email / phone
const MAX_SMS_PER_IP_HOUR = 10; // SMS costs money: also limit per network address
const MAX_ATTEMPTS = 5;

export type User = { id: string; email: string | null; phone: string | null };
/** Profile info (app/account — optional, filled whenever the buyer likes, never required at
 *  checkout). lib/admin.ts shows it to the owner. */
export type BuyerInfo = { name: string; whatsapp: string; address: string; city: string; photoUrl?: string };
/** How a person signs in: an email address or an Indian mobile number ("+91XXXXXXXXXX"). */
export type Identity = { kind: "email" | "phone"; value: string };
/** login = sign in / sign up. link = add or change the email/phone of the signed-in account. */
export type CodePurpose = "login" | "link";

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

/** Accepts 98765 43210, 098765..., +91 98765..., 9198765... → "+919876543210". Indian mobiles only. */
export function normalizePhone(raw: unknown) {
  let d = String(raw ?? "").replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? "+91" + d : null;
}

export function parseIdentity(body: { email?: unknown; phone?: unknown }): Identity | null {
  if (body.phone != null && body.phone !== "") {
    const phone = normalizePhone(body.phone);
    return phone ? { kind: "phone", value: phone } : null;
  }
  const email = normalizeEmail(body.email);
  return email ? { kind: "email", value: email } : null;
}

/** Guest checkout's single "email or WhatsApp number" box — "@" means email, anything else is tried as a phone. */
export function parseSingleBoxIdentity(raw: unknown): Identity | null {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  if (s.includes("@")) {
    const email = normalizeEmail(s);
    return email ? { kind: "email", value: email } : null;
  }
  const phone = normalizePhone(s);
  return phone ? { kind: "phone", value: phone } : null;
}

export const maskEmail = (e: string) => e.replace(/^(.{2}).*(@.*)$/, "$1•••$2");
export const maskPhone = (p: string) => p.replace(/^\+91(\d{2})\d{5}(\d{3})$/, "+91 $1•••••$2");
export const userLabel = (u: User) => u.email ?? (u.phone ? maskPhone(u.phone) : "Your account");

const codeKey = (id: Identity, purpose: CodePurpose, userId?: string) =>
  purpose === "link" ? `link:${userId}:${id.value}` : id.value;

function clientIp() {
  const h = headers();
  return (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "unknown").trim();
}

/** Counts a hit for key k; false when the hourly limit is already used up. */
async function allow(k: string, limit: number) {
  const row = await one<{ hits: number; window_start: number }>("SELECT hits, window_start FROM rate_limits WHERE k = ?", [k]);
  if (row && now() - Number(row.window_start) < 3600_000) {
    if (Number(row.hits) >= limit) return false;
    await run("UPDATE rate_limits SET hits = hits + 1 WHERE k = ?", [k]);
  } else {
    await run("DELETE FROM rate_limits WHERE k = ?", [k]);
    await run("INSERT INTO rate_limits (k, hits, window_start) VALUES (?, 1, ?)", [k, now()]);
  }
  return true;
}

export async function findUserBy(id: Identity) {
  return one<User>(`SELECT id, email, phone FROM users WHERE ${id.kind === "email" ? "email" : "phone"} = ?`, [id.value]);
}

/**
 * Guest checkout (lib/magicLink.ts): finds the account for this email/phone, or creates one —
 * same as a normal first-time OTP login, except no code was typed and no session starts here.
 * The buyer gets access via a magic link after payment instead.
 */
export async function findOrCreateUser(id: Identity): Promise<User> {
  const existing = await findUserBy(id);
  if (existing) return existing;
  const user: User = { id: crypto.randomUUID(), email: id.kind === "email" ? id.value : null, phone: id.kind === "phone" ? id.value : null };
  await run("INSERT INTO users (id, email, phone, created_at) VALUES (?, ?, ?, ?)", [user.id, user.email, user.phone, now()]);
  return user;
}

type SendResult = { ok: true; devCode?: string } | { ok: false; error: string; status?: number };

/** Creates a 6-digit code and sends it by email or SMS. In local preview it returns the code instead. */
export async function sendCode(id: Identity, purpose: CodePurpose = "login", userId?: string): Promise<SendResult> {
  if (purpose === "link") {
    const owner = await findUserBy(id);
    if (owner && owner.id !== userId) {
      return { ok: false, status: 409, error: id.kind === "phone"
        ? "This number is already linked to another SahiKaam account. Sign in with it, or contact Help."
        : "This email is already linked to another SahiKaam account. Sign in with it, or contact Help." };
    }
  }
  const key = codeKey(id, purpose, userId);
  const existing = await one<{ sent_count: number; window_start: number }>(
    "SELECT sent_count, window_start FROM login_codes WHERE email = ?", [key]);
  const inWindow = existing && now() - Number(existing.window_start) < 3600_000;
  if (inWindow && Number(existing.sent_count) >= MAX_CODES_PER_HOUR) {
    return { ok: false, status: 429, error: "Too many codes requested. Please try again in an hour." };
  }
  const devMode = !isProduction && (id.kind === "email" ? !isEmailConfigured : !isSmsConfigured);
  if (id.kind === "phone" && !isSmsConfigured && !devMode) {
    return { ok: false, status: 503, error: "Mobile sign-in is not available right now. Please use your email." };
  }
  if (id.kind === "email" && !isEmailConfigured && !devMode) {
    return { ok: false, status: 503, error: "Email sign-in is not available right now. Please try again soon." };
  }
  if (id.kind === "phone" && !devMode && !(await allow(`sms-ip:${clientIp()}`, MAX_SMS_PER_IP_HOUR))) {
    return { ok: false, status: 429, error: "Too many codes requested. Please try again in an hour." };
  }

  const code = String(crypto.randomInt(100000, 1000000));
  const sentCount = inWindow ? Number(existing.sent_count) + 1 : 1;
  const windowStart = inWindow ? Number(existing.window_start) : now();
  await run("DELETE FROM login_codes WHERE email = ?", [key]);
  await run(
    "INSERT INTO login_codes (email, code_hash, expires_at, attempts, sent_count, window_start) VALUES (?, ?, ?, 0, ?, ?)",
    [key, hash(key + ":" + code), now() + CODE_MINUTES * 60_000, sentCount, windowStart]);

  if (devMode) {
    console.log(`[local preview] ${purpose} code for ${id.value}: ${code}`);
    return { ok: true, devCode: code };
  }
  try {
    if (id.kind === "phone") await sendSmsCode(id.value, code);
    else await sendMail(
      id.value,
      `SahiKaam code: ${code}`,
      `<div style="font-family:sans-serif;font-size:16px"><h2>Your SahiKaam code</h2><p><b style="font-size:24px;letter-spacing:4px">${code}</b></p><p>This code works for ${CODE_MINUTES} minutes. If you did not ask for it, ignore this email.</p></div>`,
      `Your SahiKaam code: ${code}\nThis code works for ${CODE_MINUTES} minutes.`);
  } catch (e) {
    console.error("sendCode", id.kind, e);
    return { ok: false, status: 502, error: id.kind === "phone" ? `${phoneChannel} message could not be sent. Please try again or use your email.` : "Email could not be sent. Please try again soon." };
  }
  return { ok: true };
}

/** Checks (and uses up) a code. */
export async function checkCode(id: Identity, code: string, purpose: CodePurpose = "login", userId?: string): Promise<boolean> {
  const key = codeKey(id, purpose, userId);
  const row = await one<{ code_hash: string; expires_at: number; attempts: number }>(
    "SELECT code_hash, expires_at, attempts FROM login_codes WHERE email = ?", [key]);
  if (!row || Number(row.expires_at) < now() || Number(row.attempts) >= MAX_ATTEMPTS) return false;
  const a = Buffer.from(hash(key + ":" + code));
  const b = Buffer.from(String(row.code_hash));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    await run("UPDATE login_codes SET attempts = attempts + 1 WHERE email = ?", [key]);
    return false;
  }
  await run("DELETE FROM login_codes WHERE email = ?", [key]);
  return true;
}

type AuthResult = { ok: true } | { ok: false; error: string; status?: number };
const MAX_LOGINS_PER_HOUR = 10; // per email / phone
const MAX_LOGINS_PER_IP_HOUR = 40;

const hasPasswordRow = (userId: string) =>
  one<{ password_hash: string | null }>("SELECT password_hash FROM users WHERE id = ?", [userId]).then((r) => Boolean(r?.password_hash));
export const userHasPassword = hasPasswordRow;

/** Sign in with email-or-mobile + password. */
export async function loginWithPassword(id: Identity, password: string): Promise<AuthResult> {
  if (!(await allow(`pw:${id.value}`, MAX_LOGINS_PER_HOUR)) || !(await allow(`pw-ip:${clientIp()}`, MAX_LOGINS_PER_IP_HOUR))) {
    return { ok: false, status: 429, error: "Too many attempts. Please try again in an hour, or use Forgot password." };
  }
  const user = await findUserBy(id);
  const row = user ? await one<{ password_hash: string | null; active: number | null }>("SELECT password_hash, active FROM users WHERE id = ?", [user.id]) : null;
  const good = verifyPasswordHash(password, row?.password_hash ?? null);
  if (user && row && !row.password_hash) {
    return { ok: false, status: 400, error: "No password is set on this account yet (for example, you bought as a guest). Tap Forgot password to create one." };
  }
  if (!user || !good || (row && row.active === 0)) return { ok: false, status: 400, error: "Wrong email/mobile or password." };
  await startSession(user.id);
  return { ok: true };
}

/** Create an account with a password and sign in. Claiming an existing account needs the reset flow (code proof). */
export async function registerWithPassword(id: Identity, password: string): Promise<AuthResult> {
  const problem = passwordProblem(password);
  if (problem) return { ok: false, status: 400, error: problem };
  if (!(await allow(`reg-ip:${clientIp()}`, MAX_LOGINS_PER_IP_HOUR))) return { ok: false, status: 429, error: "Too many attempts. Please try again later." };
  if (id.kind === "email" && ADMIN_EMAILS.includes(id.value)) {
    return { ok: false, status: 403, error: "This email can only be set up with Forgot password (we send a code to prove it is yours)." };
  }
  const existing = await findUserBy(id);
  if (existing) {
    return { ok: false, status: 409, error: (await hasPasswordRow(existing.id))
      ? "An account with this already exists. Please sign in."
      : "An account with this already exists (for example from a guest purchase). Tap Forgot password to set a password and get in." };
  }
  const user: User = { id: crypto.randomUUID(), email: id.kind === "email" ? id.value : null, phone: id.kind === "phone" ? id.value : null };
  await run("INSERT INTO users (id, email, phone, created_at, password_hash) VALUES (?, ?, ?, ?, ?)", [user.id, user.email, user.phone, now(), hashPassword(password)]);
  await startSession(user.id);
  return { ok: true };
}

/** Forgot password: the emailed/SMS code proves the owner, then sets a new password, ends all other sessions and signs in. */
export async function resetPasswordWithCode(id: Identity, code: string, password: string): Promise<AuthResult> {
  const problem = passwordProblem(password);
  if (problem) return { ok: false, status: 400, error: problem };
  const user = await findUserBy(id);
  if (!user) return { ok: false, status: 404, error: "No account found. Please create an account instead." };
  if (!(await checkCode(id, code))) return { ok: false, status: 400, error: "That code is wrong or has expired." };
  await run("UPDATE users SET password_hash = ? WHERE id = ?", [hashPassword(password), user.id]);
  await run("DELETE FROM sessions WHERE user_id = ?", [user.id]);
  await startSession(user.id);
  return { ok: true };
}

/** Profile page: set or change the password of the signed-in account (current password needed once one exists). */
export async function changePassword(userId: string, newPassword: string, currentPassword?: string): Promise<AuthResult> {
  const problem = passwordProblem(newPassword);
  if (problem) return { ok: false, status: 400, error: problem };
  const row = await one<{ password_hash: string | null }>("SELECT password_hash FROM users WHERE id = ?", [userId]);
  if (row?.password_hash && !verifyPasswordHash(String(currentPassword ?? ""), row.password_hash)) {
    return { ok: false, status: 400, error: "Current password is wrong." };
  }
  await run("UPDATE users SET password_hash = ? WHERE id = ?", [hashPassword(newPassword), userId]);
  return { ok: true };
}

/** Adds or changes the email/phone of a signed-in account after the code sent to it is confirmed. */
export async function linkIdentity(user: User, id: Identity, code: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await checkCode(id, code, "link", user.id))) return { ok: false, error: "That code is wrong or has expired." };
  const owner = await findUserBy(id);
  if (owner && owner.id !== user.id) return { ok: false, error: "This is already linked to another account. Contact Help." };
  const old = id.kind === "email" ? user.email : user.phone;
  await run(`UPDATE users SET ${id.kind === "email" ? "email" : "phone"} = ? WHERE id = ?`, [id.value, user.id]);
  // Tell the old email address, so a stolen session cannot quietly take over the account.
  if (id.kind === "email" && old && old !== id.value && isEmailConfigured) {
    sendMail(old, "Your SahiKaam email was changed",
      `<p>The email on your SahiKaam account was changed to <b>${maskEmail(id.value)}</b>. If this was not you, reply to this email right away.</p>`,
      `The email on your SahiKaam account was changed to ${maskEmail(id.value)}. If this was not you, reply to this email right away.`).catch(() => {});
  }
  return { ok: true };
}

const MAX_SESSIONS = 3; // a shared account stops working after a few devices

/** Keeps only the newest MAX_SESSIONS sign-ins of a user — older devices are signed out. */
export async function pruneSessions(userId: string) {
  await run(
    `DELETE FROM sessions WHERE user_id = ? AND token_hash NOT IN (
       SELECT token_hash FROM (SELECT token_hash FROM sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ${MAX_SESSIONS}) AS keep)`,
    [userId, userId]);
}

async function startSession(userId: string) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expires = now() + SESSION_DAYS * 86400_000;
  await run("INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)", [hash(token), userId, expires, now()]);
  await pruneSessions(userId);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true, secure: isProduction, sameSite: "lax", path: "/", expires: new Date(expires),
  });
}

export async function getUser(): Promise<User | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  // active <> 0 (not strictly "= 1") so rows from before the "active" column existed, which have
  // no value yet on some drivers, are still treated as active — only an explicit deactivate counts.
  return one<User>(
    "SELECT u.id, u.email, u.phone FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ? AND (u.active IS NULL OR u.active <> 0)",
    [hash(token), now()]);
}

/** Saves the buyer's own Profile page edits (name/WhatsApp/address/city/photo). Empty strings
 *  clear a field; photoUrl is left untouched when omitted entirely (vs. explicitly cleared). */
export async function saveBuyerInfo(userId: string, info: BuyerInfo) {
  if (info.photoUrl !== undefined) {
    await run("UPDATE users SET name = ?, whatsapp = ?, address = ?, city = ?, photo_url = ? WHERE id = ?",
      [info.name || null, info.whatsapp || null, info.address || null, info.city || null, info.photoUrl || null, userId]);
  } else {
    await run("UPDATE users SET name = ?, whatsapp = ?, address = ?, city = ? WHERE id = ?",
      [info.name || null, info.whatsapp || null, info.address || null, info.city || null, userId]);
  }
}

/** Points photo_url at the file app/api/account/photo/route.ts just wrote (or clears it on remove). */
export async function savePhotoUrl(userId: string, url: string | null) {
  await run("UPDATE users SET photo_url = ? WHERE id = ?", [url, userId]);
}

export async function activeSessionCount(userId: string) {
  return (await all("SELECT token_hash FROM sessions WHERE user_id = ? AND expires_at > ?", [userId, now()])).length;
}

export async function signOut() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) await run("DELETE FROM sessions WHERE token_hash = ?", [hash(token)]);
  cookies().delete(SESSION_COOKIE);
}

/** Ends every session of this user (all phones and computers), including this one. */
export async function signOutEverywhere(userId: string) {
  await run("DELETE FROM sessions WHERE user_id = ?", [userId]);
  cookies().delete(SESSION_COOKIE);
}
