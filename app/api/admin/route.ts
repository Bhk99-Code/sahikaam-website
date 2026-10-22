import { NextResponse } from "next/server";
import { getAdmin, movePurchases, setContact, signOutUser } from "@/lib/admin";

/** Owner-only account recovery actions (form posts from /admin). */
export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "not allowed" }, { status: 404 });
  const f = await req.formData();
  const action = String(f.get("action") ?? "");
  const userId = String(f.get("user_id") ?? "");
  const value = String(f.get("value") ?? "");
  const r = action === "email" || action === "phone" ? await setContact(userId, action, value)
    : action === "move" ? await movePurchases(userId, value)
    : action === "signout" ? await signOutUser(userId)
    : { ok: false, msg: "Unknown action" };
  console.log(`[admin] ${admin.email} ${action} ${userId} ${value} → ${r.msg}`);
  const back = new URL("/admin", req.url);
  back.searchParams.set("q", String(f.get("q") ?? ""));
  back.searchParams.set(r.ok ? "ok" : "err", r.msg);
  return NextResponse.redirect(back, 303);
}
