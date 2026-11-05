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

export type AdminStats = {
  users: number; newUsers7d: number; paidOrders: number; revenue: number; revenue30d: number; paidOrders30d: number;
  top: { product_slug: string; n: number; s: number }[];
};

/** Numbers for the admin Overview page. */
export async function getStats(): Promise<AdminStats> {
  const day = 86400_000;
  const n = async (sql: string, args: unknown[] = []) => Number((await one<{ n: number }>(sql, args))?.n ?? 0);
  const paid = await one<{ c: number; s: number }>("SELECT COUNT(*) AS c, COALESCE(SUM(amount), 0) AS s FROM orders WHERE status = 'paid'");
  const paid30 = await one<{ c: number; s: number }>("SELECT COUNT(*) AS c, COALESCE(SUM(amount), 0) AS s FROM orders WHERE status = 'paid' AND paid_at > ?", [Date.now() - 30 * day]);
  const top = await all<{ product_slug: string; n: number; s: number }>(
    "SELECT product_slug, COUNT(*) AS n, COALESCE(SUM(amount), 0) AS s FROM orders WHERE status = 'paid' GROUP BY product_slug ORDER BY s DESC LIMIT 5");
  return {
    users: await n("SELECT COUNT(*) AS n FROM users"),
    newUsers7d: await n("SELECT COUNT(*) AS n FROM users WHERE created_at > ?", [Date.now() - 7 * day]),
    paidOrders: Number(paid?.c ?? 0), revenue: Number(paid?.s ?? 0),
    paidOrders30d: Number(paid30?.c ?? 0), revenue30d: Number(paid30?.s ?? 0),
    top: top.map((t) => ({ product_slug: t.product_slug, n: Number(t.n), s: Number(t.s) })),
  };
}

export type AdminOrder = {
  id: string; user_id: string; product_slug: string; amount: number; coupon_code: string | null; status: string;
  razorpay_order_id: string | null; razorpay_payment_id: string | null; created_at: number; paid_at: number | null;
  notes: string | null; email: string | null; phone: string | null; name: string | null;
};
export type OrderFilter = { status?: string; q?: string; from?: string; to?: string; product?: string };

const ORDER_COLS = `o.id, o.user_id, o.product_slug, o.amount, o.coupon_code, o.status, o.razorpay_order_id, o.razorpay_payment_id,
  o.created_at, o.paid_at, o.notes, u.email, u.phone, u.name`;

function orderWhere(f: OrderFilter) {
  const w: string[] = []; const a: unknown[] = [];
  if (f.status === "paid" || f.status === "created") { w.push("o.status = ?"); a.push(f.status); }
  if (f.product) { w.push("o.product_slug = ?"); a.push(f.product); }
  const q = (f.q ?? "").trim();
  if (q) {
    const like = `%${q}%`;
    w.push("(u.email LIKE ? OR u.phone LIKE ? OR u.name LIKE ? OR o.id LIKE ? OR o.razorpay_payment_id LIKE ? OR o.razorpay_order_id LIKE ? OR o.coupon_code LIKE ?)");
    a.push(like, like, like, like, like, like, like);
  }
  const t = (d?: string, end = false) => (d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(`${d}T${end ? "23:59:59.999" : "00:00:00"}+05:30`).getTime() : null);
  const from = t(f.from), to = t(f.to, true);
  if (from) { w.push("o.created_at >= ?"); a.push(from); }
  if (to) { w.push("o.created_at <= ?"); a.push(to); }
  return { where: w.length ? "WHERE " + w.join(" AND ") : "", args: a };
}

/** Orders newest first, with optional status / search / date range / product filters. */
export async function listOrders(f: OrderFilter | string = {}, limit = 200): Promise<AdminOrder[]> {
  const filter = typeof f === "string" ? { status: f } : f;
  const { where, args } = orderWhere(filter);
  return all<AdminOrder>(
    `SELECT ${ORDER_COLS} FROM orders o JOIN users u ON u.id = o.user_id ${where} ORDER BY o.created_at DESC LIMIT ?`, [...args, limit]
  ) as unknown as Promise<AdminOrder[]>;
}

/** Counts for the status tabs plus the total paid revenue of the current search. */
export async function orderTotals(f: OrderFilter) {
  const { where, args } = orderWhere({ ...f, status: undefined });
  const rows = await all<{ status: string; n: number; s: number }>(
    `SELECT o.status, COUNT(*) AS n, COALESCE(SUM(o.amount), 0) AS s FROM orders o JOIN users u ON u.id = o.user_id ${where} GROUP BY o.status`, args);
  const by = (st: string) => rows.find((r) => r.status === st);
  return { all: rows.reduce((n, r) => n + Number(r.n), 0), paid: Number(by("paid")?.n ?? 0), created: Number(by("created")?.n ?? 0), revenue: Number(by("paid")?.s ?? 0) };
}

export async function getOrder(id: string) {
  const o = await one<AdminOrder>(`SELECT ${ORDER_COLS} FROM orders o JOIN users u ON u.id = o.user_id WHERE o.id = ?`, [id]);
  if (!o) return null;
  const access = await one<{ created_at: number; expires_at: number | null }>("SELECT created_at, expires_at FROM purchases WHERE user_id = ? AND product_slug = ?", [o.user_id, o.product_slug]);
  return { order: o, access };
}

export async function saveOrderNote(id: string, note: string): Promise<Result> {
  await run("UPDATE orders SET notes = ? WHERE id = ?", [note.trim().slice(0, 2000) || null, id]);
  return { ok: true, msg: "Note saved." };
}

const csv = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
/** CSV of the orders matching a filter (opens in Excel/Sheets). */
export async function ordersCsv(f: OrderFilter): Promise<string> {
  const rows = await listOrders(f, 5000);
  const head = ["Date", "Order ID", "Status", "Book", "Amount", "Coupon", "Name", "Email", "Phone", "Payment ID", "Note"];
  const iso = (t: number | null) => (t ? new Date(Number(t)).toISOString() : "");
  return [head.map(csv).join(","), ...rows.map((o) => [iso(o.paid_at ?? o.created_at), o.id, o.status, o.product_slug, o.amount, o.coupon_code, o.name, o.email, o.phone, o.razorpay_payment_id, o.notes].map(csv).join(","))].join("\n");
}
