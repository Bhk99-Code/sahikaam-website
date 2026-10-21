import { NextResponse } from "next/server";
import { getProduct, getUser, ownsProduct } from "@/lib/data";
import { priceWithCoupon } from "@/lib/pricing";
import { createRazorpayOrder } from "@/lib/razorpay";
import { supabaseAdmin } from "@/lib/supabase-server";
import { grantProduct } from "@/lib/grant";
import { isRazorpayConfigured, isSupabaseConfigured } from "@/lib/env";

export async function POST(req: Request) {
  if (!isSupabaseConfigured || !isRazorpayConfigured) return NextResponse.json({ error: "Payments abhi set nahi hain" }, { status: 503 });

  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Pehle login karein" }, { status: 401 });

  const { slug, coupon } = await req.json().catch(() => ({}));
  const product = await getProduct(String(slug || ""));
  if (!product) return NextResponse.json({ error: "Product nahi mila" }, { status: 404 });
  if (await ownsProduct(user.id, product.id)) return NextResponse.json({ error: "Ye aapki Library mein pehle se hai" }, { status: 409 });

  const price = await priceWithCoupon(product, coupon);
  if (!price.ok) return NextResponse.json({ error: price.error }, { status: 400 });

  const admin = supabaseAdmin();

  // Free product or 100% coupon: no payment needed
  if (price.amount === 0) {
    const { data: order, error } = await admin.from("orders").insert({
      user_id: user.id, product_id: product.id, amount: 0, coupon_code: price.coupon,
      status: "paid", paid_at: new Date().toISOString(),
    }).select("id").single();
    if (error) return NextResponse.json({ error: "Order save nahi hua" }, { status: 500 });
    if (price.coupon) await admin.rpc("increment_coupon", { p_code: price.coupon });
    await grantProduct(user.id, product.id, order.id);
    return NextResponse.json({ free: true });
  }

  const receipt = `sk_${Date.now()}`;
  let rzpOrder;
  try {
    rzpOrder = await createRazorpayOrder(price.amount, receipt, { product: product.slug, user_id: user.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Payment gateway se connect nahi ho paya. Thodi der baad try karein." }, { status: 502 });
  }

  const { error } = await admin.from("orders").insert({
    user_id: user.id, product_id: product.id, amount: price.amount,
    coupon_code: price.coupon, razorpay_order_id: rzpOrder.id, status: "created",
  });
  if (error) return NextResponse.json({ error: "Order save nahi hua" }, { status: 500 });

  return NextResponse.json({ orderId: rzpOrder.id, amount: price.amount });
}
