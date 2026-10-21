import { isSupabaseConfigured } from "@/lib/env";
import { NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { markPaidAndGrant } from "@/lib/grant";
import { getUser } from "@/lib/data";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: Request) {
  if (!isSupabaseConfigured) return NextResponse.json({ error: "not configured" }, { status: 503 });
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "login required" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const orderId = String(body.razorpay_order_id || "");
  const paymentId = String(body.razorpay_payment_id || "");
  const signature = String(body.razorpay_signature || "");
  if (!orderId || !paymentId || !signature) return NextResponse.json({ error: "missing fields" }, { status: 400 });

  if (!verifyPaymentSignature(orderId, paymentId, signature)) {
    await supabaseAdmin().from("orders").update({ status: "failed" }).eq("razorpay_order_id", orderId).eq("status", "created");
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  // make sure this order belongs to the signed-in user
  const { data: order } = await supabaseAdmin().from("orders").select("user_id").eq("razorpay_order_id", orderId).maybeSingle();
  if (!order || order.user_id !== user.id) return NextResponse.json({ error: "order mismatch" }, { status: 403 });

  const r = await markPaidAndGrant(orderId, paymentId);
  return r.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: r.reason }, { status: 404 });
}
