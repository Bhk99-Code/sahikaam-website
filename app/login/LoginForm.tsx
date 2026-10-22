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
    if (!res.ok) return setError(data.error || "We could not send the code. Please try again.");
    if (data.devCode) setCode(data.devCode); // local preview only (no email set up)
    setStep("code");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/verify-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim(), code: code.trim() }) });
    setBusy(false);
    if (!res.ok) return setError("That code is wrong or has expired. Please try again.");
    router.replace(next);
    router.refresh();
  }

  const input = "field mt-2";
  const btn = "btn-primary mt-5 h-[52px] w-full text-[16px] disabled:opacity-60";

  return step === "email" ? (
    <form onSubmit={sendCode} className="mt-6">
      <label htmlFor="email" className="text-[14px] font-semibold text-cream">Email address</label>
      <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={input} />
      {error && <p role="alert" className="mt-3 text-[14px] text-rosy">{error}</p>}
      <button disabled={busy} className={btn}>{busy ? "Sending…" : "Send code"}</button>
    </form>
  ) : (
    <form onSubmit={verify} className="mt-6">
      <p className="rounded-2xl bg-white/[0.05] p-3 text-[14px] text-cream-2">Code sent to <b className="text-cream">{email}</b>. Check your spam folder too.</p>
      <label htmlFor="code" className="mt-4 block text-[14px] font-semibold text-cream">6-digit code</label>
      <input id="code" inputMode="numeric" autoComplete="one-time-code" required maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        className={`${input} tracking-[0.5em]`} />
      {error && <p role="alert" className="mt-3 text-[14px] text-rosy">{error}</p>}
      <button disabled={busy} className={btn}>{busy ? "Checking…" : "Sign in"}</button>
      <button type="button" onClick={() => { setStep("email"); setCode(""); }} className="mt-3 w-full text-[14px] font-semibold text-saffron-400">Use a different email</button>
    </form>
  );
}
