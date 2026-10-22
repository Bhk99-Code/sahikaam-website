"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CodeForm } from "@/components/CodeForm";
import { Icon } from "@/components/Icon";

/** One sign-in method on the account page (email or mobile), with add / change via a code. */
export function ContactRow({ kind, value, canChange = true }: { kind: "email" | "phone"; value: string | null; canChange?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const label = kind === "phone" ? "Mobile number" : "Email";
  const shown = kind === "phone" && value ? value.replace(/^\+91(\d{5})(\d{5})$/, "+91 $1 $2") : value;

  return (
    <div className="p-5">
      <div className="flex items-center gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-saffron-500/15 text-saffron-400"><Icon name={kind === "phone" ? "phone" : "mail"} size={20} strokeWidth={2} /></span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-fog">{label}</p>
          <p className={`truncate text-[16px] font-bold ${value ? "text-cream" : "text-fog-2"}`}>{shown ?? "Not added"}</p>
        </div>
        {value && <span className="hidden items-center gap-1 text-[12px] font-bold text-mint sm:flex"><Icon name="check" size={14} strokeWidth={3} /> Verified</span>}
        {canChange && !open && (
          <button onClick={() => { setOpen(true); setSaved(false); }} className={`${value ? "btn-ghost" : "btn-primary"} h-10 shrink-0 px-4 text-[14px]`}>{value ? "Change" : "Add"}</button>
        )}
      </div>
      {saved && <p role="status" className="mt-3 text-[14px] font-semibold text-mint">Saved. You can now sign in with it.</p>}
      {open && (
        <div className="mt-5 rounded-2xl border border-ink/10 p-4">
          <CodeForm kind={kind} sendUrl="/api/account/send-code" verifyUrl="/api/account/verify-code" submitLabel={`Verify and save`}
            onDone={() => { setOpen(false); setSaved(true); router.refresh(); }} />
          <button onClick={() => setOpen(false)} className="mt-3 w-full text-[14px] font-semibold text-fog hover:text-cream">Cancel</button>
        </div>
      )}
    </div>
  );
}
