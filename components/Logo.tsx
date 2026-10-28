import Link from "next/link";

/** SahiKaam mark: a gold tile with a navy "S" whose top stroke ends in an upward arrow (growth). */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <linearGradient id="sk-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E3CFA3" />
          <stop offset="1" stopColor="#B8945A" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#sk-gold)" />
      <path d="M26 13.5H17.5a5.25 5.25 0 0 0 0 10.5h5a5.25 5.25 0 0 1 0 10.5H12.5" fill="none" stroke="#142338" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24.5 8.5l6 5-6 5" fill="none" stroke="#142338" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="SahiKaam home">
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[20px] font-extrabold tracking-tight text-cream sm:text-[22px]">Sahi<span className="text-saffron-400">Kaam</span></span>
        <span className="mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.22em] text-fog sm:block">Sahi kaam · sahi kamai</span>
      </span>
    </Link>
  );
}
