"use client";

declare global {
  interface Window { fbq?: (...args: any[]) => void }
}

export function pixelEvent(event: string, params?: Record<string, any>, eventID?: string) {
  if (typeof window === "undefined" || !window.fbq) return;
  if (eventID) {
    window.fbq("track", event, params, { eventID });
  } else {
    window.fbq("track", event, params);
  }
}

export function viewContent(slug: string, name: string, price: number) {
  pixelEvent("ViewContent", { content_ids: [slug], content_name: name, content_type: "product", value: price, currency: "INR" });
}

export function addToCart(slug: string, name: string, price: number) {
  pixelEvent("AddToCart", { content_ids: [slug], content_name: name, content_type: "product", value: price, currency: "INR" });
}

export function initiateCheckout(slug: string, name: string, price: number) {
  pixelEvent("InitiateCheckout", { content_ids: [slug], content_name: name, content_type: "product", value: price, currency: "INR", num_items: 1 });
}

export function addPaymentInfo(slug: string, name: string, price: number) {
  pixelEvent("AddPaymentInfo", { content_ids: [slug], content_name: name, content_type: "product", value: price, currency: "INR" });
}

export function purchase(slug: string, name: string, price: number, orderId: string) {
  pixelEvent("Purchase", { content_ids: [slug], content_name: name, content_type: "product", value: price, currency: "INR", num_items: 1 }, orderId);
}
