"use client";
import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { rupees } from "@/lib/format";

declare global {
  interface Window { Razorpay?: any }
}

type Props = { slug: string; title: string; price: number; email: string; ready: boolean; keyId: string; whatsapp: string };

export function CheckoutClient({ slug, title, price, email, ready, keyId, whatsapp }: Props) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<{ code: string; discount: number; amount: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const amount = applied ? applied.amount : price;

  async function applyCoupon() {
    setCouponMsg("");
    if (!code.trim()) return;
    const res = await fetch("/api/checkout/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, coupon: code }) });
    const data = await res.json();
    if (!res.ok) { setApplied(null); setCouponMsg(data.error || "This coupon could not be applied"); return; }
    setApplied({ code: data.coupon, discount: data.discount, amount: data.amount });
    setCouponMsg(`Coupon applied — you save ${rupees(data.discount)}`);
  }

  async function pay() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, coupon: applied?.code ?? null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start the payment. Please try again.");
      if (data.free) { router.replace(`/library?new=${slug}`); router.refresh(); return; }
      if (!window.Razorpay) throw new Error("The payment window did not load. Please refresh the page.");

      const rzp = new window.Razorpay({
        key: keyId,
        order_id: data.orderId,
        amount: data.amount * 100,
        currency: "INR",
        name: "SahiKaam",
        description: title,
        prefill: { email },
        theme: { color: "#FF7A1A" },
        handler: async (resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const v = await fetch("/api/checkout/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(resp) });
          if (v.ok) { router.replace(`/library?new=${slug}`); router.refresh(); }
          else setError("We received your payment but could not confirm it yet. Don't worry — the book will appear in your library within a few minutes. If not, contact Help.");
          setBusy(false);
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

      {price > 0 && (
        <div className="card mt-4 p-4">
          <label htmlFor="coupon" className="flex items-center gap-2 text-[14px] font-semibold text-cream"><Icon name="tag" size={18} /> Have a coupon?</label>
          <div className="mt-3 flex gap-2">
            <input id="coupon" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Enter code"
              className="field h-12 min-w-0 flex-1 uppercase" />
            <button type="button" onClick={applyCoupon} className="btn-ghost h-12">Apply</button>
          </div>
          {couponMsg && <p className={`mt-2 text-[14px] ${applied ? "text-mint" : "text-rosy"}`}>{couponMsg}</p>}
        </div>
      )}

      <div className="card mt-4 space-y-2 p-5 text-[15px] text-cream-2">
        <Row label="Price" value={rupees(price)} />
        {applied && <Row label={`Coupon (${applied.code})`} value={`− ${rupees(applied.discount)}`} green />}
        <div className="border-t border-white/10 pt-3"><Row label="Total" value={amount === 0 ? "₹0" : rupees(amount)} bold /></div>
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
      <p className="mt-3 text-center text-[13px] text-fog">Paying as {email} · UPI, cards, net banking, wallets · secured by Razorpay</p>
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
