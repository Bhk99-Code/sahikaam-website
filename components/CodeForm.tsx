"use client";
import { useState } from "react";
import { Icon } from "./Icon";

type Kind = "phone" | "email";

/**
 * Two-step "send code → enter code" form for an email or Indian mobile number.
 * Used for sign-in (/api/auth/*) and for adding a contact to the account (/api/account/*).
 */
export function CodeForm({ kind, sendUrl, verifyUrl, submitLabel, onDone, initial = "" }: {
  kind: Kind; sendUrl: string; verifyUrl: string; submitLabel: string; onDone: () => void; initial?: string;
}) {
  const [value, setValue] = useState(initial);
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"value" | "code">("value");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const payload = () => (kind === "phone" ? { phone: value.trim() } : { email: value.trim() });

  const [channel, setChannel] = useState("SMS");
  async function post(url: string, body: object) {
    setBusy(true);
    setError("");
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    return { res, data };
  }

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    const { res, data } = await post(sendUrl, payload());
    if (!res.ok) return setError(data.error || "We could not send the code. Please try again.");
    setCode(data.devCode ?? ""); // local preview only
    if (data.channel) setChannel(data.channel);
    setStep("code");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    const { res, data } = await post(verifyUrl, { ...payload(), code: code.trim() });
    if (!res.ok) return setError(data.error || "That code is wrong or has expired. Please try again.");
    onDone();
  }

  const btn = "btn-primary mt-5 h-[52px] w-full text-[16px] disabled:opacity-60";
  const shown = kind === "phone" ? `+91 ${value.replace(/\D/g, "").slice(-10)}` : value;

  if (step === "value") return (
    <form onSubmit={send}>
      <label htmlFor={`f-${kind}`} className="text-[14px] font-semibold text-cream">{kind === "phone" ? "Mobile number" : "Email address"}</label>
      {kind === "phone" ? (
        <div className="field mt-2 flex items-center gap-2 focus-within:border-saffron-500">
          <span className="font-semibold text-cream-2">+91</span>
          <input id={`f-${kind}`} type="tel" inputMode="numeric" required autoComplete="tel-national" maxLength={14} value={value}
            onChange={(e) => setValue(e.target.value.replace(/[^\d ]/g, ""))} placeholder="98765 43210" className="min-w-0 flex-1 bg-transparent outline-none" />
        </div>
      ) : (
        <input id={`f-${kind}`} type="email" required autoComplete="email" value={value} onChange={(e) => setValue(e.target.value)} placeholder="you@example.com" className="field mt-2" />
      )}
      {error && <p role="alert" className="mt-3 text-[14px] text-rosy">{error}</p>}
      <button disabled={busy} className={btn}>{busy ? "Sending…" : "Send code"}</button>
    </form>
  );

  return (
    <form onSubmit={verify}>
      <p className="rounded-2xl bg-ink/[0.05] p-3 text-[14px] text-cream-2">
        Code sent to <b className="text-cream">{shown}</b>{kind === "phone" ? ` on ${channel}.` : ". Check your spam folder too."}
      </p>
      <label htmlFor={`c-${kind}`} className="mt-4 block text-[14px] font-semibold text-cream">6-digit code</label>
      <input id={`c-${kind}`} inputMode="numeric" autoComplete="one-time-code" required maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        className="field mt-2 tracking-[0.5em]" />
      {error && <p role="alert" className="mt-3 text-[14px] text-rosy">{error}</p>}
      <button disabled={busy} className={btn}>{busy ? "Checking…" : submitLabel}</button>
      <div className="mt-3 flex justify-between text-[14px] font-semibold">
        <button type="button" onClick={() => { setStep("value"); setCode(""); setError(""); }} className="flex items-center gap-1 text-fog hover:text-cream"><Icon name="back" size={16} /> Change</button>
        <button type="button" disabled={busy} onClick={() => send()} className="text-saffron-400">Resend code</button>
      </div>
    </form>
  );
}
