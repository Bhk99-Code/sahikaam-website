import Link from "next/link";
export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="SahiKaam home">
      <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-brand-gradient font-display text-[18px] font-extrabold text-night">S</span>
      <span className="font-display text-[19px] font-extrabold tracking-tight text-cream sm:text-[21px]">Sahi<span className="text-saffron-500">Kaam</span></span>
    </Link>
  );
}
