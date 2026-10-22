import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { activeSessionCount, getUser } from "@/lib/auth";
import { isProduction, isSmsConfigured } from "@/lib/env";
import { Icon } from "@/components/Icon";
import { ContactRow } from "./ContactRow";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Account", robots: { index: false } };

export default async function AccountPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/account");
  const devices = await activeSessionCount(user.id);
  const phoneReady = isSmsConfigured || !isProduction;

  return (
    <div className="container-x max-w-2xl py-10 md:py-14">
      <Link href="/library" className="inline-flex items-center gap-1 text-[14px] font-semibold text-fog hover:text-cream"><Icon name="back" size={18} /> My library</Link>
      <h1 className="mt-4 font-display text-[32px] font-extrabold tracking-tight text-cream">Account</h1>
      <p className="mt-1 text-[15px] text-fog">Keep both a mobile number and an email here — if you lose one, you can still sign in with the other.</p>

      <section className="card mt-8 divide-y divide-ink/[0.07]">
        <ContactRow kind="email" value={user.email} />
        {(phoneReady || user.phone) && <ContactRow kind="phone" value={user.phone} canChange={phoneReady} />}
      </section>

      <section className="card mt-6 p-5">
        <h2 className="font-display text-[20px] font-bold text-cream">Security</h2>
        <p className="mt-1 text-[14px] text-fog">Signed in on {devices} {devices === 1 ? "device" : "devices"}. Lost a phone, or used a shared computer? Sign out everywhere.</p>
        <form action="/api/account/signout-all" method="post" className="mt-4">
          <button className="btn-ghost h-11 px-5 text-[14px]"><Icon name="logout" size={17} /> Sign out of all devices</button>
        </form>
      </section>

      <p className="mt-6 text-center text-[13px] text-fog">
        Lost access to both your email and number? <Link href="/help#recover" className="font-semibold text-saffron-400">See account recovery</Link>
      </p>
    </div>
  );
}
