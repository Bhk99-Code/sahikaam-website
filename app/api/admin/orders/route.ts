import { NextResponse } from "next/server";
import { getAdmin, getOrder, saveOrderNote } from "@/lib/admin";
import { sendAccessMessage } from "@/lib/grant";

/** Owner-only order actions (form posts from /admin/orders/[id]). */
export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "not allowed" }, { status: 404 });
  const f = await req.formData();
  const id = String(f.get("id") ?? "");
  const action = String(f.get("action") ?? "");
  const found = await getOrder(id);
  let key: "ok" | "err" = "ok";
  let msg = "";
  if (!found) { key = "err"; msg = "Order not found."; }
  else if (action === "note") msg = (await saveOrderNote(id, String(f.get("note") ?? ""))).msg;
  else if (action === "resend" && found.order.status === "paid") {
    try { await sendAccessMessage(found.order.user_id); msg = "Access link sent to the buyer."; }
    catch (e) { key = "err"; msg = "Could not send — check email settings."; console.error("resend access", e); }
  } else { key = "err"; msg = "Unknown action."; }
  console.log(`[admin] ${admin.email} order ${action} ${id} → ${msg}`);
  return new NextResponse(null, { status: 303, headers: { Location: `/admin/orders/${encodeURIComponent(id)}?${key}=${encodeURIComponent(msg)}` } });
}
