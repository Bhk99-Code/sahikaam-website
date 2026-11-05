"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";

type Mode = "signin" | "signup" | "reset";

export function LoginForm({ next, initialMode, initialContact }: { next: string; initialMode: Mode; initialContact: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [identifier, setIdentifier] = useState(initialContact);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [channel, setChannel] = useState("SMS");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  const done = (admin = false) => { router.replace(next || (admin ? "/admin" : "/library")); router.refresh(); };
  const idBody = () => ({ identifier: identifier.trim() });

  async function post(url: string, body: object) {
    setBusy(true); setError("");
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    return { res, data };
  }

  function switchTo(m: Mode) { setMode(m); setError(""); setNote(""); setPassword(""); setCode(""); setCodeSent(false); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "reset" && !codeSent) return sendCode();
    const url = mode === "signin" ? "/api/auth/login" : mode === "signup" ? "/api/auth/register" : "/api/auth/reset";
    const body = mode === "reset" ? { ...idBody(), code: code.trim(), password } : { ...idBody(), password };
    const { res, data } = await post(url, body);
    if (!res.ok) return setError(data.error || "Something went wrong. Please try again.");
    done(Boolean(data.admin));
  }

  async function sendCode() {
    const v = identifier.trim();
    const body = v.includes("@") ? { email: v } : { phone: v };
    const { res, data } = await post("/api/auth/send-code", body);
    if (!res.ok) return setError(data.error || "We could not send the code. Please try again.");
    if (data.channel) setChannel(data.channel);
    setCode(data.devCode ?? ""); // local preview only
    setNote(v.includes("@") ? `Code sent to ${v}. Check your spam folder too.` : `Code sent on ${data.channel ?? channel}.`);
    setCodeSent(true);
  }

  const title = mode === "signin" ? "Sign in" : mode === "signup" ? "Create your account" : "Reset your password";
  const label = mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : codeSent ? "Set new password & sign in" : "Send code";

  return (
    <div className="mt-6">
      {mode !== "reset" && (
        <div role="tablist" className="mb-5 grid grid-cols-2 gap-1 rounded-full bg-ink/[0.06] p-1">
          {([["signin", "Sign in"], ["signup", "Create account"]] as const).map(([m, t]) => (
            <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => switchTo(m)}
              className={`flex h-11 items-center justify-center rounded-full text-[14px] font-bold ${mode === m ? "bg-saffron-500 text-white" : "text-fog hover:text-cream"}`}>{t}</button>
          ))}
        </div>
      )}
      {mode === "reset" && <h2 className="mb-4 font-display text-[20px] font-bold text-cream">{title}</h2>}
      <form onSubmit={submit}>
        <label htmlFor="lf-id" className="text-[14px] font-semibold text-cream">Email or mobile number</label>
        <div className="field mt-2 flex items-center gap-2 focus-within:border-saffron-500">
          <Icon name={identifier.includes("@") || !identifier ? "mail" : "phone"} size={18} className="text-fog" />
          <input id="lf-id" required autoComplete="username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} disabled={mode === "reset" && codeSent}
            placeholder="you@example.com or 98765 43210" className="min-w-0 flex-1 bg-transparent outline-none" />
        </div>

        {mode === "reset" && codeSent && (
          <>
            {note && <p className="mt-3 rounded-2xl bg-ink/[0.05] p-3 text-[14px] text-cream-2">{note}</p>}
            <label htmlFor="lf-code" className="mt-4 block text-[14px] font-semibold text-cream">6-digit code</label>
            <input id="lf-code" inputMode="numeric" autoComplete="one-time-code" required maxLength={6} value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className="field mt-2 tracking-[0.5em]" />
          </>
        )}

        {(mode !== "reset" || codeSent) && (
          <>
            <label htmlFor="lf-pw" className="mt-4 block text-[14px] font-semibold text-cream">{mode === "reset" ? "New password" : "Password"}</label>
            <div className="field mt-2 flex items-center gap-2 focus-within:border-saffron-500">
              <Icon name="lock" size={18} className="text-fog" />
              <input id="lf-pw" type={show ? "text" : "password"} required minLength={mode === "signin" ? 1 : 8} maxLength={128}
                autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signin" ? "Your password" : "At least 8 characters"} className="min-w-0 flex-1 bg-transparent outline-none" />
              <button type="button" onClick={() => setShow((s) => !s)} className="text-[13px] font-semibold text-fog hover:text-cream" aria-label={show ? "Hide password" : "Show password"}>{show ? "Hide" : "Show"}</button>
            </div>
          </>
        )}

        {error && <p role="alert" className="mt-3 text-[14px] text-rosy">{error}</p>}
        <button disabled={busy} className="btn-primary mt-5 h-[52px] w-full text-[16px] disabled:opacity-60">{busy ? "Please wait…" : label}</button>
      </form>

      <div className="mt-4 flex items-center justify-between text-[14px] font-semibold">
        {mode === "signin" && <button type="button" onClick={() => switchTo("reset")} className="text-saffron-400">Forgot password?</button>}
        {mode === "reset" && <button type="button" onClick={() => switchTo("signin")} className="flex items-center gap-1 text-fog hover:text-cream"><Icon name="back" size={16} /> Back to sign in</button>}
        {mode === "reset" && codeSent && <button type="button" disabled={busy} onClick={sendCode} className="text-saffron-400">Resend code</button>}
      </div>
    </div>
  );
}
