import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { findProduct, getUser, ownsProduct, getProgress } from "@/lib/data";
import { Reader } from "./Reader";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reader", robots: { index: false } };

export default async function ReadPage({ params, searchParams }: { params: { slug: string }; searchParams: { part?: string } }) {
  const product = findProduct(params.slug);
  if (!product) notFound();
  const user = await getUser();
  if (!user) redirect(`/login?next=/read/${product.slug}`);
  if (!(await ownsProduct(user.id, product.slug))) redirect(`/book/${product.slug}`);

  const progress = await getProgress(user.id, product.slug);
  const email = user.email ?? "";
  const masked = email.replace(/^(.{2}).*(@.*)$/, "$1•••$2");
  const watermark = `Licensed to ${masked} · ${user.id.slice(0, 8)}`;

  const parts = product.parts.map((p) => p.title);
  const part = Math.min(Math.max(0, Number(searchParams.part ?? 0) || 0), Math.max(0, parts.length - 1));
  // progress is saved per book; for chapter books we start each chapter at page 1
  return <Reader key={part} slug={product.slug} title={product.title} parts={parts} part={part}
    startPage={parts.length ? 1 : Math.max(1, progress || 1)} watermark={watermark} />;
}
