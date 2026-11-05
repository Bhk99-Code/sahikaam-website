"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg("");
    const res = await fetch("/api/account/password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, current: hasPassword ? current : undefined }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    setOk(res.ok);
    setMsg(res.ok ? "Password saved." : data.error || "Could not save — please try again.");
    if (res.ok) { setCurrent(""); setPassword(""); router.refresh(); }
  }

  return (
    <form onSubmit={save} className="mt-4 grid gap-3 sm:grid-cols-2">
      {hasPassword && <input type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Current password" className="field h-11 w-full" />}
      <input type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password (8+ characters)" className="field h-11 w-full" />
      <div className="flex items-center gap-3 sm:col-span-2">
        <button disabled={busy} className="btn-primary h-11 px-6 text-[14px] disabled:opacity-60">{busy ? "Saving…" : hasPassword ? "Change password" : "Set password"}</button>
        {msg && <span role="status" className={`text-[13px] ${ok ? "text-mint" : "text-rosy"}`}>{msg}</span>}
      </div>
    </form>
  );
}
