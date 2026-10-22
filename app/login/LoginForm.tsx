"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/send-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim() }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error || "Code nahi bhej paye. Dobara try karein.");
    if (data.devCode) setCode(data.devCode); // local preview only (no email set up)
    setStep("code");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/verify-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim(), code: code.trim() }) });
    setBusy(false);
    if (!res.ok) return setError("Code galat hai ya expire ho gaya. Dobara try karein.");
    router.replace(next);
    router.refresh();
  }

  const input = "mt-2 h-[52px] w-full rounded-[14px] border border-line bg-white px-4 text-[16px] outline-none focus:border-brand-500";
  const btn = "mt-5 flex h-[52px] w-full items-center justify-center rounded-[14px] bg-ink text-[16px] font-bold text-white hover:bg-black disabled:opacity-60";

  return step === "email" ? (
    <form onSubmit={sendCode} className="mt-6">
      <label htmlFor="email" className="text-[14px] font-semibold">Email address</label>
      <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="aap@example.com" className={input} />
      {error && <p role="alert" className="mt-3 text-[14px] text-red-700">{error}</p>}
      <button disabled={busy} className={btn}>{busy ? "Bhej rahe hain…" : "Code Bhejein"}</button>
    </form>
  ) : (
    <form onSubmit={verify} className="mt-6">
      <p className="rounded-2xl bg-mist p-3 text-[14px] text-ink-3">Code bheja gaya: <b>{email}</b> (spam folder bhi dekhein)</p>
      <label htmlFor="code" className="mt-4 block text-[14px] font-semibold">6-digit code</label>
      <input id="code" inputMode="numeric" autoComplete="one-time-code" required maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        className={`${input} tracking-[0.5em]`} />
      {error && <p role="alert" className="mt-3 text-[14px] text-red-700">{error}</p>}
      <button disabled={busy} className={btn}>{busy ? "Check ho raha hai…" : "Login Karein"}</button>
      <button type="button" onClick={() => { setStep("email"); setCode(""); }} className="mt-3 w-full text-[14px] font-semibold text-brand-600">Email badlein</button>
    </form>
  );
}
