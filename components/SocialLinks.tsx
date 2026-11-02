import { BUSINESS } from "@/lib/business";
import { SUPPORT_WHATSAPP } from "@/lib/env";

const WA_TEXT = encodeURIComponent("Hello SahiKaam, I'd like to know more about your business ebooks.");

export const whatsappUrl = SUPPORT_WHATSAPP ? `https://wa.me/${SUPPORT_WHATSAPP}?text=${WA_TEXT}` : "";

export function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3a.5.5 0 0 0 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3z" />
    </svg>
  );
}

function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** WhatsApp and Instagram buttons (footer, contact page). */
export function SocialLinks() {
  return (
    <div className="flex flex-wrap gap-2">
      {whatsappUrl && (
        <a href={whatsappUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-[14px] font-semibold text-cream hover:border-saffron-400">
          <WhatsAppIcon size={18} /> WhatsApp
        </a>
      )}
      <a href={BUSINESS.instagram} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-[14px] font-semibold text-cream hover:border-saffron-400">
        <InstagramIcon size={18} /> @sahikaam.official
      </a>
    </div>
  );
}

/** Floating WhatsApp chat button, bottom-right on every page (above the phone bottom bar). */
export function WhatsAppFloat() {
  if (!whatsappUrl) return null;
  return (
    <a href={whatsappUrl} target="_blank" rel="noopener" aria-label="Chat with SahiKaam on WhatsApp"
      className="fixed bottom-28 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lift transition hover:scale-105 md:bottom-6 md:right-6">
      <WhatsAppIcon size={28} />
    </a>
  );
}
