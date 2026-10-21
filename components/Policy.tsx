export function Policy({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 md:py-12">
      <article className="rounded-[24px] border border-line bg-white p-6 sm:p-10 [&_h2]:mt-8 [&_h2]:text-[18px] [&_h2]:font-bold [&_li]:mt-1.5 [&_p]:mt-3 [&_p]:leading-relaxed [&_p]:text-ink-2 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-ink-2">
        <h1 className="text-[28px] font-extrabold tracking-tight">{title}</h1>
        {children}
      </article>
    </div>
  );
}
