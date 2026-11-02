import Link from "next/link";

/** SahiKaam mark: a black tile with a white "S" whose top stroke ends in an orange upward arrow (growth). */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <rect x="0.5" y="0.5" width="39" height="39" rx="10.5" fill="#15171C" stroke="rgba(255,255,255,0.22)" />
      <path d="M26 13.5H17.5a5.25 5.25 0 0 0 0 10.5h5a5.25 5.25 0 0 1 0 10.5H12.5" fill="none" stroke="#FFFFFF" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24.5 8.5l6 5-6 5" fill="none" stroke="#FF5A24" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="SahiKaam home">
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[21px] font-extrabold text-cream sm:text-[23px]">Sahi<span className="text-[#FF4F1F]">Kaam</span></span>
        <span className="mt-1 hidden text-[9.5px] font-semibold uppercase tracking-[0.24em] text-fog sm:block">Business ebooks</span>
      </span>
    </Link>
  );
}
