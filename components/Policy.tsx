export function Policy({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="container-x max-w-3xl py-10 md:py-14">
      <article className="card p-6 sm:p-10 [&_a]:text-saffron-400 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-[20px] [&_h2]:font-bold [&_li]:mt-1.5 [&_p]:mt-3 [&_p]:leading-relaxed [&_p]:text-cream-2 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-cream-2">
        <h1 className="font-display text-[32px] font-extrabold tracking-tight">{title}</h1>
        {children}
      </article>
    </div>
  );
}
