import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { phoneChannel } from "@/lib/env";
import { one } from "@/lib/db";
import { findProduct } from "@/lib/data";
import { validDownloadToken } from "@/lib/downloadToken";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Payment received", robots: { index: false } };

/** Lands here right after a checkout pays. For a download product (e.g. the wallpaper) the file is offered
 *  at once — no sign-in needed — using the order id + token the payment step handed over. */
export default async function ThanksPage({ params, searchParams }: { params: { slug: string }; searchParams: { contact?: string; o?: string; t?: string } }) {
  const contact = searchParams.contact || "";
  const isEmail = contact.includes("@");
  const product = findProduct(params.slug);

  let files: { title: string; href: string }[] = [];
  const order = searchParams.o && searchParams.t && validDownloadToken(searchParams.o, searchParams.t)
    ? await one<{ product_slug: string; status: string }>("SELECT product_slug, status FROM orders WHERE id = ?", [searchParams.o]) : null;
  if (product?.type === "download" && order?.status === "paid" && order.product_slug === product.slug) {
    files = product.bonus.map((b, i) => ({ title: b.title, href: `/api/download/${searchParams.o}?t=${searchParams.t}&i=${i}` }));
  }

  if (files.length) {
    return (
      <div className="container-x max-w-md py-14 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mint/10"><Icon name="check" size={28} className="text-mint" /></div>
        <h1 className="mt-5 font-display text-[28px] font-extrabold text-cream">Payment received 🎉</h1>
        <p className="mt-2 text-fog">Your {product?.title ?? "file"} is ready. Tap to download:</p>
        <div className="mt-6 flex flex-col gap-3">
          {files.map((f) => (
            <a key={f.href} href={f.href} download className="btn-primary h-14 w-full text-[16px]"><Icon name="download" size={20} strokeWidth={2.2} /> Download {files.length > 1 ? f.title : "now"}</a>
          ))}
        </div>
        <p className="mt-5 text-[13px] text-fog">Keep this page open until the download finishes.{contact && <> We&apos;ve also sent the link to <b className="text-cream-2">{contact}</b> — use it to download again anytime.</>}</p>
        <p className="mt-6 text-[13px] text-fog">Didn&apos;t start? Tap the button again, or <Link href="/help#recover" className="font-semibold text-saffron-400">contact Help</Link>.</p>
      </div>
    );
  }

  return (
    <div className="container-x max-w-md py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mint/10">
        <Icon name="check" size={28} className="text-mint" />
      </div>
      <h1 className="mt-5 font-display text-[28px] font-extrabold text-cream">Payment received 🎉</h1>
      {isEmail ? (
        <p className="mt-3 text-fog">We&apos;ve emailed a one-tap link to <b className="text-cream">{contact}</b> — open it to go straight to your library, then set a password for next time.</p>
      ) : (
        <p className="mt-3 text-fog">We&apos;ve sent a 6-digit code to <b className="text-cream">{contact}</b> via {phoneChannel}. Enter it on the next screen and choose a password to open your library.</p>
      )}
      {!isEmail && (
        <Link href={`/login?mode=reset&contact=${encodeURIComponent(contact)}`} className="btn-primary mt-6 inline-flex h-12 px-6">Enter code &amp; set password</Link>
      )}
      <p className="mt-6 text-[13px] text-fog">Didn&apos;t get it? Check spam, or <Link href="/help#recover" className="font-semibold text-saffron-400">contact Help</Link>.</p>
    </div>
  );
}
