"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";

type Props = { name: string; whatsapp: string; address: string; city: string; photoUrl: string };

/** The buyer's own Profile — all optional, saved whenever they like, never required to buy anything. */
export function ProfileForm({ name: savedName, whatsapp: savedWhatsapp, address: savedAddress, city: savedCity, photoUrl: savedPhotoUrl }: Props) {
  const router = useRouter();
  const [name, setName] = useState(savedName);
  const [whatsapp, setWhatsapp] = useState(savedWhatsapp);
  const [address, setAddress] = useState(savedAddress);
  const [city, setCity] = useState(savedCity);
  const [photoUrl, setPhotoUrl] = useState(savedPhotoUrl);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function save() {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/account/profile", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, whatsapp, address, city, photoUrl }),
    });
    setBusy(false);
    if (res.ok) { setMsg("Saved."); router.refresh(); } else setMsg("Could not save — please try again.");
  }

  return (
    <div className="flex items-start gap-5">
      <div className="shrink-0">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt="" className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-night-3 text-cream-2"><Icon name="user" size={32} /></div>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        <input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="Photo URL (paste a link to your photo)" className="field h-11 w-full text-[14px]" />
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
