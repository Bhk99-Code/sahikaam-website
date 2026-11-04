"use client";
import { useEffect, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { rupees } from "@/lib/format";

declare global {
  interface Window { Razorpay?: any }
}

type Props = { slug: string; title: string; price: number; ready: boolean; keyId: string; whatsapp: string; offerCode: string };

/**
 * Buy-now checkout for someone not signed in: one box (email or WhatsApp number), straight to
 * payment — no code to verify first. A one-tap sign-in link follows by email/WhatsApp once the
 * payment is confirmed (lib/grant.ts), so the buyer only has to come back and tap it once.
 */
export function GuestCheckoutClient({ slug, title, price, ready, keyId, whatsapp, offerCode }: Props) {
  const router = useRouter();
  const [contact, setContact] = useState("");
  const [code, setCode] = useState(offerCode);
  const [applied, setApplied] = useState<{ code: string; discount: number; amount: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const amount = applied ? applied.amount : price;
  const contactLooksValid = contact.includes("@") ? /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(contact.trim()) : contact.replace(/\D/g, "").length >= 10;

  async function applyCoupon(c = code) {
    setCouponMsg("");
    if (!c.trim()) return;
    const res = await fetch("/api/checkout/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, coupon: c }) });
    const data = await res.json();
    if (!res.ok) { setApplied(null); setCouponMsg(data.error || "This coupon could not be applied"); return; }
    setApplied({ code: data.coupon, discount: data.discount, amount: data.amount });
    setCouponMsg(`Coupon applied — you save ${rupees(data.discount)}`);
  }

  useEffect(() => {
    if (offerCode && price > 0) applyCoupon(offerCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function pay() {
    if (!contactLooksValid) { setError("Please enter a valid email or WhatsApp number."); return; }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, coupon: applied?.code ?? null, guestContact: contact.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start the payment. Please try again.");
      if (data.free) { router.replace(`/checkout/${slug}/thanks?contact=${encodeURIComponent(contact.trim())}`); return; }
      if (!window.Razorpay) throw new Error("The payment window did not load. Please refresh the page.");

      const rzp = new window.Razorpay({
        key: keyId,
        order_id: data.orderId,
        amount: data.amount * 100,
        currency: "INR",
        name: "SahiKaam",
        description: title,
        prefill: contact.includes("@") ? { email: contact.trim() } : { contact: contact.trim() },
        theme: { color: "#FF6A00" },
        handler: async (resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const v = await fetch("/api/checkout/verify-guest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(resp) });
          setBusy(false);
          if (v.ok) setError("");
          router.replace(`/checkout/${slug}/thanks?contact=${encodeURIComponent(contact.trim())}`);
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      rzp.on("payment.failed", (r: any) => { setError(r?.error?.description || "The payment failed. Please try again."); setBusy(false); });
      rzp.open();
    } catch (e: any) {
      setError(e.message);
      setBusy(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <div className="card mt-4 p-4">
        <label htmlFor="guest-contact" className="flex items-center gap-2 text-[14px] font-semibold text-cream"><Icon name="user" size={18} /> Email or WhatsApp number</label>
        <input id="guest-contact" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="you@example.com or 98765 43210"
          className="field mt-3 h-12 w-full" />
        <p className="mt-2 text-[12px] text-fog">We&apos;ll send your library access link here right after payment.</p>
      </div>

      {price > 0 && (
        <div className="card mt-4 p-4">
          <label htmlFor="coupon" className="flex items-center gap-2 text-[14px] font-semibold text-cream"><Icon name="tag" size={18} /> Have a coupon?</label>
          <div className="mt-3 flex gap-2">
            <input id="coupon" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Enter code"
              className="field h-12 min-w-0 flex-1 uppercase" />
            <button type="button" onClick={() => applyCoupon()} className="btn-ghost h-12">Apply</button>
          </div>
          {couponMsg && <p className={`mt-2 text-[14px] ${applied ? "text-mint" : "text-rosy"}`}>{couponMsg}</p>}
        </div>
      )}

      <div className="card mt-4 space-y-2 p-5 text-[15px] text-cream-2">
        <Row label="Price" value={rupees(price)} />
        {applied && <Row label={`Coupon (${applied.code})`} value={`− ${rupees(applied.discount)}`} green />}
        <div className="border-t border-ink/10 pt-3"><Row label="Total" value={amount === 0 ? "₹0" : rupees(amount)} bold /></div>
      </div>

      {error && <p role="alert" className="mt-4 rounded-2xl bg-rosy/10 p-4 text-[14px] text-rosy">{error}</p>}
      {!ready && (
        <p className="mt-4 rounded-2xl bg-saffron-500/10 p-4 text-[14px] text-saffron-300">
          Online payment is starting soon. To buy now, message us{whatsapp ? <> on <a className="font-bold underline" href={`https://wa.me/${whatsapp}`}>WhatsApp</a></> : null}.
        </p>
      )}

      <button onClick={pay} disabled={busy || (!ready && amount > 0)}
        className="btn-primary mt-5 h-14 w-full text-[17px] shadow-glow disabled:opacity-50">
        <Icon name="lock" size={20} strokeWidth={2} />
        {busy ? "Processing…" : amount === 0 ? "Get it free" : `Pay ${rupees(amount)}`}
      </button>
      <p className="mt-3 text-center text-[13px] text-fog">UPI, cards, net banking, wallets · secured by Razorpay</p>
    </>
  );
}

function Row({ label, value, bold, green }: { label: string; value: string; bold?: boolean; green?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-[19px] font-extrabold text-cream" : ""} ${green ? "text-mint" : ""}`}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}
