import crypto from "crypto";
import { NextResponse } from "next/server";
import { getProduct, getUser, ownsProduct } from "@/lib/data";
import { priceWithCoupon } from "@/lib/pricing";
import { createRazorpayOrder } from "@/lib/razorpay";
import { one, run } from "@/lib/db";
import { grantProduct, sendAccessMessage } from "@/lib/grant";
import { isRazorpayConfigured } from "@/lib/env";
import { saveBuyerInfo, findOrCreateUser, parseSingleBoxIdentity } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const { slug, coupon, name, whatsapp, address, city, guestContact } = body;

  let user = await getUser();
  const isGuest = !user;
  if (!user) {
    // Guest checkout (not signed in): a single email-or-phone box, no name/address — see
    // app/checkout/[slug]/GuestCheckoutClient.tsx. The buyer gets a one-tap magic link after
    // payment (lib/grant.ts) instead of verifying a code up front.
    const identity = parseSingleBoxIdentity(guestContact);
    if (!identity) return NextResponse.json({ error: "Please enter a valid email or WhatsApp number." }, { status: 400 });
    user = await findOrCreateUser(identity);
  } else {
    // Signed-in checkout still collects name/WhatsApp/address/city for the owner's records.
    const trimmedName = String(name || "").trim();
    const trimmedWhatsapp = String(whatsapp || "").trim();
    const trimmedAddress = String(address || "").trim();
    const trimmedCity = String(city || "").trim();
    if (trimmedName.length < 2 || trimmedWhatsapp.replace(/\D/g, "").length < 10 || trimmedAddress.length < 3 || trimmedCity.length < 2) {
      return NextResponse.json({ error: "Please fill your name, WhatsApp number, address and city." }, { status: 400 });
    }
    await saveBuyerInfo(user.id, { name: trimmedName, whatsapp: trimmedWhatsapp, address: trimmedAddress, city: trimmedCity });
  }

  const product = await getProduct(String(slug || ""));
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  if (await ownsProduct(user.id, product.slug)) return NextResponse.json({ error: "This is already in your library" }, { status: 409 });

  const price = await priceWithCoupon(product, coupon);
  if (!price.ok) return NextResponse.json({ error: price.error }, { status: 400 });

  const now = Date.now();

  // Free product or 100% coupon: no payment needed
  if (price.amount === 0) {
    const id = crypto.randomUUID();
    await run("INSERT INTO orders (id, user_id, product_slug, amount, coupon_code, status, created_at, paid_at) VALUES (?, ?, ?, 0, ?, 'paid', ?, ?)",
      [id, user.id, product.slug, price.coupon, now, now]);
    await grantProduct(user.id, product.slug, id);
    // A guest never verified a code, so (like the paid path in lib/grant.ts) send the one-tap
    // link/code now — this is the only way they get in, since nothing is free enough to skip it.
    if (isGuest) sendAccessMessage(user.id).catch((e) => console.error("sendAccessMessage", e));
    return NextResponse.json({ free: true, guest: isGuest });
  }

  if (!isRazorpayConfigured) return NextResponse.json({ error: "Online payment will start soon. For now, please contact us on WhatsApp or email." }, { status: 503 });

  // Reuse a recent unpaid order for the same product and price instead of creating duplicates
  const recent = await one<{ razorpay_order_id: string }>(
    "SELECT razorpay_order_id FROM orders WHERE user_id = ? AND product_slug = ? AND amount = ? AND status = 'created' AND created_at > ? ORDER BY created_at DESC",
    [user.id, product.slug, price.amount, now - 15 * 60_000]);
  if (recent?.razorpay_order_id) return NextResponse.json({ orderId: recent.razorpay_order_id, amount: price.amount });

  const id = crypto.randomUUID();
  let rzpOrder;
  try {
    rzpOrder = await createRazorpayOrder(price.amount, id.slice(0, 36), { product: product.slug, user_id: user.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not connect to the payment gateway. Please try again in a moment." }, { status: 502 });
  }
  await run("INSERT INTO orders (id, user_id, product_slug, amount, coupon_code, razorpay_order_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'created', ?)",
    [id, user.id, product.slug, price.amount, price.coupon, rzpOrder.id, now]);
  return NextResponse.json({ orderId: rzpOrder.id, amount: price.amount });
}
