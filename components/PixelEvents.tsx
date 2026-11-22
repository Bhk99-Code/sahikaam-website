"use client";
import { useEffect } from "react";
import { viewContent, addToCart, initiateCheckout } from "@/lib/pixel";

export function PixelViewContent({ slug, name, price }: { slug: string; name: string; price: number }) {
  useEffect(() => { viewContent(slug, name, price); }, [slug, name, price]);
  return null;
}

export function PixelInitiateCheckout({ slug, name, price }: { slug: string; name: string; price: number }) {
  useEffect(() => { initiateCheckout(slug, name, price); }, [slug, name, price]);
  return null;
}

export function AddToCartLink({ slug, name, price, href, className, children }: {
  slug: string; name: string; price: number; href: string; className?: string; children: React.ReactNode;
}) {
  return (
    <a href={href} onClick={() => addToCart(slug, name, price)} className={className}>{children}</a>
  );
}
