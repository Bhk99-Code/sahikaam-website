"use client";
import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { rupees } from "@/lib/format";

declare global {
  interface Window { Razorpay?: any }
}

type Props = { slug: string; title: string; price: number; email: string; ready: boolean; keyId: string };

export function CheckoutClient({ slug, title, price, email, ready, keyId }: Props) {
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
    if (!res.ok) { setApplied(null); setCouponMsg(data.error || "Coupon nahi laga"); return; }
    setApplied({ code: data.coupon, discount: data.discount, amount: data.amount });
    setCouponMsg(`Coupon laga! ${rupees(data.discount)} bache`);
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
      if (!res.ok) throw new Error(data.error || "Order nahi ban paya");
      if (data.free) { router.replace(`/library?new=${slug}`); router.refresh(); return; }
      if (!window.Razorpay) throw new Error("Payment window load nahi hui. Page refresh karein.");

      const rzp = new window.Razorpay({
        key: keyId,
        order_id: data.orderId,
        amount: data.amount * 100,
        currency: "INR",
        name: "SahiKaam",
        description: title,
        prefill: { email },
        theme: { color: "#EA580C" },
        handler: async (resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const v = await fetch("/api/checkout/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(resp) });
          if (v.ok) { router.replace(`/library?new=${slug}`); router.refresh(); }
          else setError("Payment mila par confirm nahi ho paya. Ghabraiye mat — 2-3 minute mein book Library mein aa jayegi, ya Help se contact karein.");
          setBusy(false);
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      rzp.on("payment.failed", (r: any) => { setError(r?.error?.description || "Payment fail ho gaya. Dobara try karein."); setBusy(false); });
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
        <div className="mt-4 rounded-card border border-line bg-white p-4">
          <label htmlFor="coupon" className="flex items-center gap-2 text-[14px] font-semibold"><Icon name="tag" size={18} /> Coupon code</label>
          <div className="mt-2 flex gap-2">
            <input id="coupon" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="LAUNCH20"
              className="h-12 min-w-0 flex-1 rounded-[12px] border border-line px-4 uppercase outline-none focus:border-brand-500" />
            <button type="button" onClick={applyCoupon} disabled={!ready} className="h-12 rounded-[12px] border border-ink px-5 font-bold disabled:opacity-50">Apply</button>
          </div>
          {couponMsg && <p className={`mt-2 text-[14px] ${applied ? "text-green-700" : "text-red-700"}`}>{couponMsg}</p>}
        </div>
      )}

      <div className="mt-4 space-y-2 rounded-card border border-line bg-white p-4 text-[15px]">
        <Row label="Price" value={rupees(price)} />
        {applied && <Row label={`Coupon (${applied.code})`} value={`− ${rupees(applied.discount)}`} green />}
        <div className="border-t border-line pt-2"><Row label="Total" value={amount === 0 ? "₹0" : rupees(amount)} bold /></div>
      </div>

      {error && <p role="alert" className="mt-4 rounded-2xl bg-red-50 p-4 text-[14px] text-red-800">{error}</p>}
      {!ready && <p className="mt-4 rounded-2xl bg-brand-50 p-4 text-[14px] text-brand-700">Preview mode: payment tab chalega jab Supabase + Razorpay keys set ho jayengi.</p>}

      <button onClick={pay} disabled={busy || !ready}
        className="mt-5 flex h-[56px] w-full items-center justify-center gap-2 rounded-full bg-brand-600 text-[17px] font-bold text-white hover:bg-brand-700 disabled:opacity-60">
        <Icon name="lock" size={20} strokeWidth={2} />
        {busy ? "Processing…" : amount === 0 ? "Free mein Paayein" : `Pay ${rupees(amount)}`}
      </button>
      <p className="mt-3 text-center text-[13px] text-ink-5">UPI · Cards · Net banking · Wallets — secured by Razorpay</p>
    </>
  );
}

function Row({ label, value, bold, green }: { label: string; value: string; bold?: boolean; green?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-[18px] font-extrabold" : ""} ${green ? "text-green-700" : ""}`}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}
