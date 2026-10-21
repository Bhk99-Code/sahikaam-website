import Link from "next/link";
export function SectionTitle({ children, href, linkText = "View All" }: { children: React.ReactNode; href?: string; linkText?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-[13px] font-bold uppercase tracking-[0.18em] text-ink-3">{children}</h2>
      {href && <Link href={href} className="text-[15px] font-semibold text-brand-600 hover:text-brand-700">{linkText}</Link>}
    </div>
  );
}
