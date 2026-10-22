"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CodeForm } from "@/components/CodeForm";
import { Icon } from "@/components/Icon";

export function LoginForm({ next, phoneReady }: { next: string; phoneReady: boolean }) {
  const router = useRouter();
  const [kind, setKind] = useState<"phone" | "email">(phoneReady ? "phone" : "email");
  const done = () => { router.replace(next); router.refresh(); };

  return (
    <div className="mt-6">
      {phoneReady && (
        <div role="tablist" className="mb-5 grid grid-cols-2 gap-1 rounded-full bg-ink/[0.06] p-1">
          {(["phone", "email"] as const).map((k) => (
            <button key={k} role="tab" aria-selected={kind === k} onClick={() => setKind(k)}
              className={`flex h-11 items-center justify-center gap-2 rounded-full text-[14px] font-bold ${kind === k ? "bg-saffron-500 text-white" : "text-fog hover:text-cream"}`}>
              <Icon name={k === "phone" ? "phone" : "mail"} size={17} strokeWidth={2} /> {k === "phone" ? "Mobile" : "Email"}
            </button>
          ))}
        </div>
      )}
      <CodeForm key={kind} kind={kind} sendUrl="/api/auth/send-code" verifyUrl="/api/auth/verify-code" submitLabel="Sign in" onDone={done} />
      <p className="mt-6 text-center text-[13px] text-fog">
        Can&apos;t get into your account? <Link href="/help#recover" className="font-semibold text-saffron-400">Recover it</Link>
      </p>
    </div>
  );
}
