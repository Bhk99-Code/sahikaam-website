import { notFound, redirect } from "next/navigation";
import { maskEmail, maskPhone } from "@/lib/auth";
import type { Metadata } from "next";
import { findProduct, getUser, ownsProduct, getProgress, pickEdition } from "@/lib/data";
import { Reader } from "./Reader";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reader", robots: { index: false } };

export default async function ReadPage({ params, searchParams }: { params: { slug: string }; searchParams: { part?: string; lang?: string } }) {
  const product = findProduct(params.slug);
  if (!product) notFound();
  const user = await getUser();
  if (!user) redirect(`/login?next=/read/${product.slug}`);
  if (!(await ownsProduct(user.id, product.slug))) redirect(`/book/${product.slug}`);

  const edition = pickEdition(product, searchParams.lang);
  if (!edition) redirect("/library");
  const progress = await getProgress(user.id, product.slug);
  const masked = user.email ? maskEmail(user.email) : user.phone ? maskPhone(user.phone) : "SahiKaam reader";
  const watermark = `Licensed to ${masked} · ${user.id.slice(0, 8)}`;
  const languages = product.editions.filter((e) => !e.coming_soon).map((e) => ({ lang: e.lang, label: e.label }));
  const parts = (edition.parts ?? []).map((p) => p.title);
  const part = Math.min(Math.max(0, Number(searchParams.part ?? 0) || 0), Math.max(0, parts.length - 1));
  // progress is saved per book for single-file books; chapter books start each chapter at page 1
  return (
    <Reader key={`${edition.lang}-${part}`} slug={product.slug} title={product.title} lang={edition.lang} languages={languages}
      parts={parts} part={part} startPage={parts.length ? 1 : Math.max(1, progress || 1)} watermark={watermark} />
  );
}
