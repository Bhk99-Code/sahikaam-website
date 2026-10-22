import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, getUser, ownsProduct } from "@/lib/data";
import { Icon } from "@/components/Icon";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Course", robots: { index: false } };

/** Turns a normal YouTube / Vimeo link into an embeddable one. Other hosts (Bunny, etc.) are used as-is. */
function embedUrl(url: string) {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0&modestbranding=1`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return url;
}

export default async function LearnPage({ params, searchParams }: { params: { slug: string }; searchParams: { l?: string } }) {
  const product = await getProduct(params.slug);
  if (!product || product.type !== "course") notFound();
  const user = await getUser();
  if (!user) redirect(`/login?next=/learn/${product.slug}`);
  if (!(await ownsProduct(user.id, product.slug))) redirect(`/book/${product.slug}`);

  const lessons = product.lessons;
  const i = Math.min(Math.max(0, Number(searchParams.l ?? 0) || 0), Math.max(0, lessons.length - 1));
  const lesson = lessons[i];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-10">
      <Link href="/library?tab=courses" className="mb-4 inline-flex items-center gap-1 text-[14px] font-semibold text-ink-3"><Icon name="back" size={18} /> My Library</Link>
      <h1 className="text-[24px] font-extrabold tracking-tight md:text-[30px]">{product.title}</h1>
      {!lesson ? (
        <p className="mt-6 rounded-card border border-line bg-white p-6 text-ink-4">Lessons jald hi upload honge.</p>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div>
            <div className="aspect-video overflow-hidden rounded-card bg-black">
              <iframe src={embedUrl(lesson.video_url)} title={lesson.title} className="h-full w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
            </div>
            <h2 className="mt-4 text-[20px] font-bold">{i + 1}. {lesson.title}</h2>
            <div className="mt-4 flex gap-3">
              {i > 0 && <Link href={`?l=${i - 1}`} className="flex h-11 items-center rounded-full border border-line bg-white px-5 font-semibold">← Pichla</Link>}
              {i < lessons.length - 1 && <Link href={`?l=${i + 1}`} className="flex h-11 items-center rounded-full bg-ink px-5 font-bold text-white">Agla lesson →</Link>}
            </div>
          </div>
          <ol className="h-max overflow-hidden rounded-card border border-line bg-white">
            {lessons.map((l, n) => (
              <li key={n}>
                <Link href={`?l=${n}`} className={`flex items-center gap-3 border-b border-[#EFEFF2] p-4 ${n === i ? "bg-brand-50" : "hover:bg-mist"}`}>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold ${n === i ? "bg-brand-600 text-white" : "bg-mist text-ink-3"}`}>{n + 1}</span>
                  <span className="flex-1 text-[14px] font-semibold">{l.title}</span>
                  {l.minutes ? <span className="text-[12px] text-ink-5">{l.minutes} min</span> : null}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
