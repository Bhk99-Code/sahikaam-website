import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { activeSessionCount, getUser } from "@/lib/auth";
import { isProduction, isSmsConfigured } from "@/lib/env";
import { one } from "@/lib/db";
import { Icon } from "@/components/Icon";
import { ContactRow } from "./ContactRow";
import { ProfileForm } from "./ProfileForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Profile", robots: { index: false } };

export default async function AccountPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/account");
  const devices = await activeSessionCount(user.id);
  const phoneReady = isSmsConfigured || !isProduction;
  // Entirely optional — nothing here was ever required to buy a book (app/checkout/[slug]).
  const profile = await one<{ name: string | null; whatsapp: string | null; address: string | null; city: string | null; photo_url: string | null }>(
    "SELECT name, whatsapp, address, city, photo_url FROM users WHERE id = ?", [user.id]);

  return (
    <div className="container-x max-w-2xl py-10 md:py-14">
      <Link href="/library" className="inline-flex items-center gap-1 text-[14px] font-semibold text-fog hover:text-cream"><Icon name="back" size={18} /> My library</Link>
      <h1 className="mt-4 font-display text-[32px] font-extrabold tracking-tight text-cream">Profile</h1>
      <p className="mt-1 text-[15px] text-fog">Fill this in whenever you like — it&apos;s never needed to buy a book.</p>

      <section className="card mt-8 p-5">
        <ProfileForm
          name={profile?.name ?? ""}
          whatsapp={profile?.whatsapp ?? user.phone ?? ""}
          address={profile?.address ?? ""}
          city={profile?.city ?? ""}
          photoUrl={profile?.photo_url ?? ""}
        />
      </section>

      <h2 className="mt-8 font-display text-[20px] font-bold text-cream">Sign-in details</h2>
      <p className="mt-1 text-[14px] text-fog">Keep both a mobile number and an email here — if you lose one, you can still sign in with the other.</p>
      <section className="card mt-4 divide-y divide-ink/[0.07]">
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
