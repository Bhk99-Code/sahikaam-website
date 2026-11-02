import Link from "next/link";
export function SectionTitle({ eyebrow, title, href, linkText = "View all" }: { eyebrow?: string; title: React.ReactNode; href?: string; linkText?: string }) {
  return (
    <div className="mb-7 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-2.5 flex items-center gap-2"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-[2px] bg-[#FF4F1F]" />{eyebrow}</p>}
        <h2 className="font-display text-[28px] font-extrabold leading-[1.08] text-cream md:text-[38px]">{title}</h2>
      </div>
      {href && <Link href={href} className="btn-ghost h-10 shrink-0 px-4 text-[13px]">{linkText} <span aria-hidden="true">→</span></Link>}
    </div>
  );
}
