import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, getUser, ownsProduct, bundleCovers } from "@/lib/data";
import { BookCover } from "@/components/BookCover";
import { Icon } from "@/components/Icon";
import { CheckoutClient } from "./CheckoutClient";
import { accessLabel, rupees, TYPE_LABEL } from "@/lib/format";
import { isRazorpayConfigured, SUPPORT_WHATSAPP } from "@/lib/env";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();
  const user = await getUser();
  if (!user) redirect(`/login?next=/checkout/${product.slug}`);
  if (await ownsProduct(user.id, product.slug)) redirect("/library");

  return (
    <div className="container-x max-w-2xl py-8 md:py-14">
      <Link href={`/book/${product.slug}`} className="inline-flex items-center gap-1 text-[14px] font-semibold text-fog hover:text-cream">
        <Icon name="back" size={18} /> Back
      </Link>
      <h1 className="mt-4 font-display text-[32px] font-extrabold tracking-tight text-cream">Checkout</h1>
      <div className="card mt-6 flex items-center gap-4 p-4">
        <BookCover product={product} size="sm" covers={product.type === "bundle" ? bundleCovers(product) : []} />
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: product.accent }}>{TYPE_LABEL[product.type]}</span>
          <span className="font-bold leading-snug text-cream">{product.title}</span>
          <span className="text-[13px] text-fog">Hindi + English · {accessLabel(product.access_days)}</span>
        </div>
        <span className="font-display text-[20px] font-extrabold text-cream">{rupees(product.price)}</span>
      </div>
      <CheckoutClient
        slug={product.slug}
        title={product.title}
        price={product.price}
        email={user.email}
        ready={isRazorpayConfigured}
        keyId={process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? ""}
        whatsapp={SUPPORT_WHATSAPP}
      />
    </div>
  );
}
