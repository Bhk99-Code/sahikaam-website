"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";

type Props = { name: string; whatsapp: string; address: string; city: string; photoUrl: string };

/** The buyer's own Profile — all optional, saved whenever they like, never required to buy anything. */
export function ProfileForm({ name: savedName, whatsapp: savedWhatsapp, address: savedAddress, city: savedCity, photoUrl: savedPhotoUrl }: Props) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(savedName);
  const [whatsapp, setWhatsapp] = useState(savedWhatsapp);
  const [address, setAddress] = useState(savedAddress);
  const [city, setCity] = useState(savedCity);
  const [photoUrl, setPhotoUrl] = useState(savedPhotoUrl);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [photoErr, setPhotoErr] = useState("");

  async function pickPhoto(file: File) {
    setPhotoErr("");
    const preview = URL.createObjectURL(file);
    setPhotoUrl(preview);
    setPhotoBusy(true);
    const form = new FormData();
    form.append("photo", file);
    const res = await fetch("/api/account/photo", { method: "POST", body: form });
    setPhotoBusy(false);
    URL.revokeObjectURL(preview);
    if (res.ok) {
      const data = await res.json();
      setPhotoUrl(data.url);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setPhotoErr(data.error || "Could not upload — please try again.");
      setPhotoUrl(savedPhotoUrl);
    }
  }

  async function removePhoto() {
    setPhotoBusy(true);
    const res = await fetch("/api/account/photo", { method: "DELETE" });
    setPhotoBusy(false);
    if (res.ok) { setPhotoUrl(""); router.refresh(); }
  }

  async function save() {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/account/profile", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, whatsapp, address, city }),
    });
    setBusy(false);
    if (res.ok) { setMsg("Saved."); router.refresh(); } else setMsg("Could not save — please try again.");
  }

  return (
    <div className="flex items-start gap-5">
      <div className="shrink-0">
        <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) pickPhoto(f); e.target.value = ""; }} />
        <button type="button" onClick={() => fileInput.current?.click()} disabled={photoBusy}
          className="group relative block h-20 w-20 overflow-hidden rounded-full ring-1 ring-ink/[0.08] disabled:opacity-70" aria-label="Change photo">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-night-3 text-cream-2"><Icon name="user" size={32} /></div>
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
            {photoBusy ? <span className="text-[11px] font-semibold text-white">…</span> : <Icon name="camera" size={20} className="text-white" />}
          </span>
        </button>
        {photoUrl && !photoBusy && (
          <button type="button" onClick={removePhoto} className="mt-1.5 block w-full text-center text-[11px] font-medium text-fog hover:text-cream">Remove</button>
        )}
        {photoErr && <p className="mt-1 max-w-[88px] text-[11px] text-red-400">{photoErr}</p>}
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="field h-11 w-full" />
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="WhatsApp number" inputMode="tel" className="field h-11 w-full" />
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" className="field h-11 w-full" />
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="field h-11 w-full" />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={save} disabled={busy} className="btn-primary h-11 px-6 text-[14px] disabled:opacity-60">{busy ? "Saving…" : "Save profile"}</button>
          {msg && <span className="text-[13px] text-fog">{msg}</span>}
        </div>
      </div>
    </div>
  );
}
