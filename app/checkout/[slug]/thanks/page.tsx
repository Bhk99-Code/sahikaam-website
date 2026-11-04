import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { phoneChannel } from "@/lib/env";

export const metadata: Metadata = { title: "Payment received", robots: { index: false } };

/** Lands here right after a guest checkout pays — no session yet, so /library would just bounce
 *  them to /login. lib/grant.ts has already sent the access link/code in the background. */
export default function ThanksPage({ searchParams }: { searchParams: { contact?: string } }) {
  const contact = searchParams.contact || "";
  const isEmail = contact.includes("@");

  return (
    <div className="container-x max-w-md py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mint/10">
        <Icon name="check" size={28} className="text-mint" />
      </div>
      <h1 className="mt-5 font-display text-[28px] font-extrabold text-cream">Payment received 🎉</h1>
      {isEmail ? (
        <p className="mt-3 text-fog">We&apos;ve emailed a one-tap link to <b className="text-cream">{contact}</b> — open it to go straight to your library, no password needed.</p>
      ) : (
        <p className="mt-3 text-fog">We&apos;ve sent a 6-digit sign-in code to <b className="text-cream">{contact}</b> via {phoneChannel}. Enter it on the sign-in page to open your library.</p>
      )}
      {!isEmail && (
        <Link href="/login" className="btn-primary mt-6 inline-flex h-12 px-6">Enter code</Link>
      )}
      <p className="mt-6 text-[13px] text-fog">Didn&apos;t get it? Check spam, or <Link href="/help#recover" className="font-semibold text-saffron-400">contact Help</Link>.</p>
    </div>
  );
}
