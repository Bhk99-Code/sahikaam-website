import Link from "next/link";
export function Logo() {
  return (
    <Link href="/" className="text-[22px] font-extrabold tracking-tight text-ink" aria-label="SahiKaam home">
      <span className="text-brand-500">Sahi</span>Kaam
    </Link>
  );
}
