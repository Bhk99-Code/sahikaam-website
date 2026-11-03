import "server-only";
import { all, one, run } from "./db";
import { getUser, normalizeEmail, normalizePhone, type User } from "./auth";
import { ADMIN_EMAILS } from "./env";

/** The signed-in owner, or null. Admin = a signed-in user whose email is in ADMIN_EMAILS. */
export async function getAdmin() {
  const user = await getUser();
  return user?.email && ADMIN_EMAILS.includes(user.email) ? user : null;
}

export type AdminUser = User & {
  created_at: number;
  name: string | null; whatsapp: string | null; address: string | null; city: string | null; active: number | null;
  purchases: { product_slug: string; expires_at: number | null; created_at: number }[];
  orders: { id: string; product_slug: string; amount: number; status: string; razorpay_payment_id: string | null; created_at: number }[];
};

export type UserSummary = {
  id: string; email: string | null; phone: string | null; name: string | null; whatsapp: string | null;
  created_at: number; active: number | null; total_paid: number; last_paid_at: number | null;
};

/** Every buyer, newest first, with how much they've paid in total and when they last paid —
 *  the super-admin "all users" overview (app/admin/page.tsx shows this when there's no search). */
export async function listAllUsers(limit = 200): Promise<UserSummary[]> {
  return all<UserSummary>(
    `SELECT u.id, u.email, u.phone, u.name, u.whatsapp, u.created_at, u.active,
       COALESCE(SUM(CASE WHEN o.status = 'paid' THEN o.amount ELSE 0 END), 0) AS total_paid,
       MAX(CASE WHEN o.status = 'paid' THEN o.paid_at ELSE NULL END) AS last_paid_at
     FROM users u LEFT JOIN orders o ON o.user_id = u.id
     GROUP BY u.id, u.email, u.phone, u.name, u.whatsapp, u.created_at, u.active
     ORDER BY u.created_at DESC LIMIT ?`,
    [limit]
  ) as unknown as Promise<UserSummary[]>;
}

/** Switches a buyer's account active/inactive. An inactive account's sessions are also ended, so
 *  it can't keep using an already-open tab — a fresh sign-in is blocked by getUser()'s own check. */
export async function setActive(userId: string, active: boolean): Promise<Result> {
  const u = await one<User>("SELECT id FROM users WHERE id = ?", [userId]);
  if (!u) return { ok: false, msg: "Account not found" };
  await run("UPDATE users SET active = ? WHERE id = ?", [active ? 1 : 0, userId]);
  if (!active) await run("DELETE FROM sessions WHERE user_id = ?", [userId]);
  return { ok: true, msg: active ? "Account activated" : "Account deactivated and signed out everywhere" };
}

/** Finds accounts by email (or part of it), mobile number, order id or Razorpay payment/order id. */
export async function searchUsers(q: string): Promise<AdminUser[]> {
  q = q.trim();
  if (!q) return [];
  const ids = new Set<string>();
  const phone = normalizePhone(q);
  if (phone) (await all("SELECT id FROM users WHERE phone = ?", [phone])).forEach((r) => ids.add(r.id));
  (await all("SELECT id FROM users WHERE email LIKE ? LIMIT 20", [`%${q.toLowerCase()}%`])).forEach((r) => ids.add(r.id));
  (await all("SELECT user_id FROM orders WHERE id = ? OR razorpay_payment_id = ? OR razorpay_order_id = ? LIMIT 20", [q, q, q])).forEach((r) => ids.add(r.user_id));
  const out: AdminUser[] = [];
  for (const id of Array.from(ids).slice(0, 20)) {
    const u = await one<User & { created_at: number; name: string | null; whatsapp: string | null; address: string | null; city: string | null; active: number | null }>(
      "SELECT id, email, phone, created_at, name, whatsapp, address, city, active FROM users WHERE id = ?", [id]);
    if (!u) continue;
    out.push({
      ...u,
      purchases: await all("SELECT product_slug, expires_at, created_at FROM purchases WHERE user_id = ? ORDER BY created_at DESC", [id]) as any,
      orders: await all("SELECT id, product_slug, amount, status, razorpay_payment_id, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 30", [id]) as any,
    });
  }
  return out;
}

type Result = { ok: true; msg: string } | { ok: false; msg: string };

/** Sets (or clears, when value is empty) the email or phone of an account. */
export async function setContact(userId: string, kind: "email" | "phone", raw: string): Promise<Result> {
  const value = raw.trim() === "" ? null : kind === "email" ? normalizeEmail(raw) : normalizePhone(raw);
  if (raw.trim() !== "" && !value) return { ok: false, msg: `Not a valid ${kind}` };
  const u = await one<User>("SELECT id, email, phone FROM users WHERE id = ?", [userId]);
  if (!u) return { ok: false, msg: "Account not found" };
  if (!value && !(kind === "email" ? u.phone : u.email)) return { ok: false, msg: "An account needs at least an email or a phone" };
  if (value) {
    const other = await one<{ id: string }>(`SELECT id FROM users WHERE ${kind} = ? AND id <> ?`, [value, userId]);
    if (other) return { ok: false, msg: `That ${kind} belongs to another account — use "Move purchases" instead` };
  }
  await run(`UPDATE users SET ${kind} = ? WHERE id = ?`, [value, userId]);
  await run("DELETE FROM sessions WHERE user_id = ?", [userId]); // old devices must sign in again
  return { ok: true, msg: `${kind === "email" ? "Email" : "Phone"} updated; all devices signed out` };
}

/** Moves every purchase and order from one account to another (for a buyer who made a second account). */
export async function movePurchases(fromId: string, toRaw: string): Promise<Result> {
  const phone = normalizePhone(toRaw);
  const email = normalizeEmail(toRaw);
  const to = phone ? await one<User>("SELECT id, email, phone FROM users WHERE phone = ?", [phone])
    : email ? await one<User>("SELECT id, email, phone FROM users WHERE email = ?", [email]) : null;
  if (!to) return { ok: false, msg: "Target account not found — the buyer must sign in once with that email/phone first" };
  if (to.id === fromId) return { ok: false, msg: "Same account" };
  if (!(await one("SELECT id FROM users WHERE id = ?", [fromId]))) return { ok: false, msg: "Account not found" };
  const rows = await all("SELECT product_slug, order_id, progress, created_at, expires_at FROM purchases WHERE user_id = ?", [fromId]);
  for (const r of rows) {
    const have = await one<{ expires_at: number | null }>("SELECT expires_at FROM purchases WHERE user_id = ? AND product_slug = ?", [to.id, r.product_slug]);
    if (!have) {
      await run("UPDATE purchases SET user_id = ? WHERE user_id = ? AND product_slug = ?", [to.id, fromId, r.product_slug]);
    } else {
      // keep the better access: lifetime beats a date, a later date beats an earlier one
      const best = have.expires_at == null || r.expires_at == null ? null : Math.max(Number(have.expires_at), Number(r.expires_at));
      await run("UPDATE purchases SET expires_at = ? WHERE user_id = ? AND product_slug = ?", [best, to.id, r.product_slug]);
      await run("DELETE FROM purchases WHERE user_id = ? AND product_slug = ?", [fromId, r.product_slug]);
    }
  }
  await run("UPDATE orders SET user_id = ? WHERE user_id = ?", [to.id, fromId]);
  return { ok: true, msg: `Moved ${rows.length} purchase(s) to ${to.email ?? to.phone}` };
}

export async function signOutUser(userId: string): Promise<Result> {
  const r = await run("DELETE FROM sessions WHERE user_id = ?", [userId]);
  return { ok: true, msg: `Signed out ${r.changes} device(s)` };
}
