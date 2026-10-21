import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, getUser, ownsProduct } from "@/lib/data";
import { BookCover } from "@/components/BookCover";
import { CheckoutClient } from "./CheckoutClient";
import { rupees, TYPE_LABEL } from "@/lib/format";
import { isRazorpayConfigured, isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();
  const user = await getUser();
  if (isSupabaseConfigured && !user) redirect(`/login?next=/checkout/${product.slug}`);
  if (user && (await ownsProduct(user.id, product.id))) redirect("/library");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 md:py-12">
      <h1 className="text-[26px] font-extrabold tracking-tight">Checkout</h1>
      <div className="mt-5 flex gap-4 rounded-card border border-line bg-white p-4">
        <BookCover product={product} size="sm" />
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-ink-5">{TYPE_LABEL[product.type]}</span>
          <span className="font-bold leading-snug">{product.title}</span>
          <span className="text-[15px] font-extrabold">{rupees(product.price)}</span>
        </div>
      </div>
      <CheckoutClient
        slug={product.slug}
        title={product.title}
        price={product.price}
        email={user?.email ?? ""}
        ready={isSupabaseConfigured && isRazorpayConfigured}
        keyId={process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? ""}
      />
    </div>
  );
}
