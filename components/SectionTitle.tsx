import Link from "next/link";
export function SectionTitle({ eyebrow, title, href, linkText = "View all" }: { eyebrow?: string; title: React.ReactNode; href?: string; linkText?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="font-display text-[26px] font-extrabold leading-tight tracking-tight text-cream md:text-[34px]">{title}</h2>
      </div>
      {href && <Link href={href} className="shrink-0 text-[14px] font-bold text-saffron-400 hover:text-saffron-300">{linkText} →</Link>}
    </div>
  );
}
