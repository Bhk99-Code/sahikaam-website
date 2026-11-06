"use client";
import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Pair = { title: string; text: string };
type Lang = "hi" | "en";
export type EditorProduct = {
  slug: string; type: string; title: string; subtitle: string; description: string; category: string; badge: string; level: string;
  price: string; mrp: string; sortOrder: string; published: boolean;
  highlights: Pair[]; inside: Pair[]; learn: string[]; chapters: string[];
  cover: string; gallery: string[];
  editions: Record<Lang, { pages: string; soon: boolean; file: string; parts: boolean }>;
  bonus: { title: string; text: string; file: string }[];
  bundleItems: string[]; includeAll: boolean; accessDays: string; noCoupon: boolean;
};
export type BookOption = { slug: string; title: string; price: number; category: string; cover: string };
type Img = { url: string; file?: File };
type Bonus = { title: string; text: string; file: string; upload?: File };

const lbl = "block text-[13px] font-semibold text-cream";
const hint = "mt-1 text-[12px] text-fog";
const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

/** Sends a file in 2 MB pieces (so proxy size/time limits and slow connections can't break big PDFs); returns the upload id. */
async function uploadInChunks(file: File, onProgress: (done: number) => void): Promise<string> {
  const id = crypto.randomUUID();
  const CHUNK = 2 * 1024 * 1024;
  let offset = 0;
  let fails = 0;
  while (offset < file.size) {
    const end = Math.min(offset + CHUNK, file.size);
    try {
      const res = await fetch(`/api/admin/upload?id=${id}&offset=${offset}&total=${file.size}`, { method: "POST", headers: { "Content-Type": "application/octet-stream" }, body: file.slice(offset, end) });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409 && typeof data.received === "number") { offset = data.received; continue; } // resume from what the server has
      if (!res.ok || !data.ok) throw new Error(data.error || `server answered ${res.status}`);
      offset = end;
      fails = 0;
      onProgress(offset / file.size);
    } catch (e) {
      if (++fails > 4) throw new Error(`Upload stopped (${e instanceof Error ? e.message : "network error"}). Check your connection and press Save again.`);
      await new Promise((r) => setTimeout(r, 800 * fails));
    }
  }
  return id;
}

function Card({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <h2 className="font-display text-[18px] font-bold text-cream">{title}</h2>
      {sub && <p className="mt-0.5 text-[13px] text-fog">{sub}</p>}
      <div className="mt-4 grid gap-3">{children}</div>
    </section>
  );
}

function TextList({ items, onChange, placeholder, add }: { items: string[]; onChange: (v: string[]) => void; placeholder: string; add: string }) {
  return (
    <div className="grid gap-2">
      {items.map((t, i) => (
        <div key={i} className="flex gap-2">
          <input value={t} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} placeholder={placeholder} className="field h-11 min-w-0 flex-1" />
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Remove" className="btn-ghost h-11 w-11 shrink-0 px-0">✕</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ""])} className="btn-ghost h-10 justify-self-start px-4 text-[13px]">+ {add}</button>
    </div>
  );
}

function PairList({ items, onChange, a, b, add }: { items: Pair[]; onChange: (v: Pair[]) => void; a: string; b: string; add: string }) {
  const set = (i: number, k: keyof Pair, v: string) => onChange(items.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  return (
    <div className="grid gap-2">
      {items.map((p, i) => (
        <div key={i} className="grid gap-2 rounded-2xl bg-ink/[0.04] p-2.5 sm:grid-cols-[1fr_2fr_auto]">
          <input value={p.title} onChange={(e) => set(i, "title", e.target.value)} placeholder={a} className="field h-11" />
          <input value={p.text} onChange={(e) => set(i, "text", e.target.value)} placeholder={b} className="field h-11" />
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Remove" className="btn-ghost h-11 w-11 px-0">✕</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, { title: "", text: "" }])} className="btn-ghost h-10 justify-self-start px-4 text-[13px]">+ {add}</button>
    </div>
  );
}

/** One page for adding and editing a product: left = what the page shows, right = status, organisation and live preview. */
export function ProductEditor({ initial, categories, books = [] }: { initial: EditorProduct; categories: { key: string; label: string }[]; books?: BookOption[] }) {
  const router = useRouter();
  const isNew = !initial.slug;
  const download = initial.type === "download";
  const bundle = initial.type === "bundle";
  const [f, setF] = useState(initial);
  const set = <K extends keyof EditorProduct>(k: K, v: EditorProduct[K]) => setF((s) => ({ ...s, [k]: v }));
  const [cover, setCover] = useState<Img | null>(initial.cover ? { url: initial.cover } : null);
  const [gallery, setGallery] = useState<Img[]>(initial.gallery.map((url) => ({ url })));
  const [pdf, setPdf] = useState<Record<Lang, File | null>>({ hi: null, en: null });
  const [bonus, setBonus] = useState<Bonus[]>(initial.bonus);
  const [pick, setPick] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  const price = Number(f.price), mrp = Number(f.mrp);
  const off = mrp > price && price >= 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const slugPreview = useMemo(() => initial.slug || f.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60), [initial.slug, f.title]);
  const chosen = new Set(f.bundleItems);
  const shown = books.filter((b) => (!catFilter || b.category === catFilter) && (!pick.trim() || b.title.toLowerCase().includes(pick.trim().toLowerCase())));
  const itemsTotal = (f.includeAll ? books : books.filter((b) => chosen.has(b.slug))).reduce((n, b) => n + b.price, 0);
  const itemCount = f.includeAll ? books.length : f.bundleItems.filter((s) => books.some((b) => b.slug === s)).length;
  const toggleItem = (slug: string) => set("bundleItems", chosen.has(slug) ? f.bundleItems.filter((x) => x !== slug) : [...f.bundleItems, slug]);
  const filesReady = (["hi", "en"] as Lang[]).some((l) => pdf[l] || f.editions[l].file || f.editions[l].parts);

  const move = (i: number, d: number) => setGallery((g) => { const n = [...g]; const j = i + d; if (j < 0 || j >= n.length) return g; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const toImg = (files: FileList | null) => Array.from(files ?? []).map((file) => ({ url: URL.createObjectURL(file), file }));
  const setEdition = (l: Lang, patch: Partial<EditorProduct["editions"][Lang]>) => set("editions", { ...f.editions, [l]: { ...f.editions[l], ...patch } });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!f.title.trim()) return setMsg({ ok: false, text: "Title is required." });
    if (f.price === "" || !(price >= 0)) return setMsg({ ok: false, text: "Enter the price (0 for free)." });
    if (!bundle && !download && !f.category) return setMsg({ ok: false, text: "Pick a category." });
    if (bundle && !f.includeAll && !f.bundleItems.length) return setMsg({ ok: false, text: "Choose at least one book, or tick “every book”." });
    const fd = new FormData();
    let gi = 0, bi = 0;
    const uploadIds: Partial<Record<Lang, string>> = {};
    setBusy(true);
    try {
      for (const l of ["hi", "en"] as Lang[]) {
        const file = pdf[l];
        if (!file) continue;
        const name = l === "hi" ? "Hindi" : "English";
        setProgress(`Uploading ${name} PDF… 0%`);
        uploadIds[l] = await uploadInChunks(file, (x) => setProgress(`Uploading ${name} PDF… ${Math.round(x * 100)}%`));
      }
    } catch (err) {
      setBusy(false); setProgress("");
      return setMsg({ ok: false, text: err instanceof Error ? err.message : "Upload failed. Please try again." });
    }
    const bonusIds: Record<number, string> = {};
    try {
      for (let i = 0; i < bonus.length; i++) {
        const file = bonus[i].upload;
        if (!file) continue;
        setProgress(`Uploading ${file.name}… 0%`);
        bonusIds[i] = await uploadInChunks(file, (x) => setProgress(`Uploading ${file.name}… ${Math.round(x * 100)}%`));
      }
    } catch (err) {
      setBusy(false); setProgress("");
      return setMsg({ ok: false, text: err instanceof Error ? err.message : "Upload failed. Please try again." });
    }
    setProgress("Saving…");
    const payload = {
      slug: initial.slug, type: initial.type, noCoupon: f.noCoupon, bundleItems: f.bundleItems, includeAll: f.includeAll, accessDays: f.accessDays, title: f.title, subtitle: f.subtitle, description: f.description, category: f.category, badge: f.badge, level: f.level,
      price: f.price, mrp: f.mrp, sortOrder: f.sortOrder, published: f.published,
      highlights: f.highlights, inside: f.inside, learn: f.learn, chapters: f.chapters,
      gallery: gallery.map((g) => { if (g.file) { fd.append(`gallery_${gi}`, g.file); return { kind: "new", i: gi++ }; } return { kind: "url", url: g.url }; }),
      editions: { hi: { pages: f.editions.hi.pages, soon: f.editions.hi.soon, uploadId: uploadIds.hi }, en: { pages: f.editions.en.pages, soon: f.editions.en.soon, uploadId: uploadIds.en } },
      bonus: bonus.map((b, idx) => { if (b.upload) { return { kind: "staged", uploadId: bonusIds[idx], name: b.upload.name, title: b.title, text: b.text }; } return { kind: "keep", file: b.file, title: b.title, text: b.text }; }),
    };
    fd.append("payload", JSON.stringify(payload));
    if (cover?.file) fd.append("cover", cover.file);
    const res = await fetch("/api/admin/books/save", { method: "POST", body: fd }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setBusy(false); setProgress("");
    if (!res || !data?.ok) return setMsg({ ok: false, text: data?.error || (res ? `Could not save (server answered ${res.status}). Please try again.` : "Could not reach the server. Check your connection and try again.") });
    if (isNew) return router.replace(`/admin/books/${data.slug}?saved=1`);
    setMsg({ ok: true, text: data.message });
    setPdf({ hi: null, en: null });
    router.refresh();
  }

  const pdfCard = (l: Lang) => {
    const ed = f.editions[l];
    const status = ed.parts ? "Chapter-wise files" : pdf[l] ? "New file selected" : ed.file ? "File uploaded" : ed.soon ? "Coming soon" : "Not added";
    return (
      <div className="grid gap-2 rounded-2xl bg-ink/[0.04] p-3 sm:grid-cols-3">
        <p className="font-bold text-cream sm:col-span-3">{l === "hi" ? "Hindi" : "English"} <span className={`ml-2 rounded-full px-2 py-0.5 text-[11px] font-semibold ${ed.file || pdf[l] || ed.parts ? "bg-mint/10 text-mint" : "bg-ink/[0.07] text-fog"}`}>{status}</span></p>
        <label className={lbl}>Pages<input type="number" min="1" value={ed.pages} onChange={(e) => setEdition(l, { pages: e.target.value })} className="field mt-1 h-11 w-full" /></label>
        <label className={`${lbl} sm:col-span-2`}>{ed.file ? "Replace PDF" : "Upload PDF"}
          <input type="file" accept="application/pdf" onChange={(e) => setPdf((s) => ({ ...s, [l]: e.target.files?.[0] ?? null }))} className="field mt-1 block w-full py-2" />
          {(pdf[l]?.name || ed.file) && <span className={hint}>{pdf[l]?.name ?? ed.file}</span>}
          {ed.parts && <span className={hint}>This language is stored as chapter files. Uploading a PDF here replaces them with one PDF.</span>}
        </label>
        <label className="flex items-center gap-2 text-[13px] text-cream sm:col-span-3"><input type="checkbox" checked={ed.soon} onChange={(e) => setEdition(l, { soon: e.target.checked })} /> Show as “coming soon” (no PDF yet)</label>
      </div>
    );
  };

  return (
    <form onSubmit={save} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid content-start gap-5">
        <Card title="Product information">
          <label className={lbl}>Title *<input value={f.title} onChange={(e) => set("title", e.target.value)} className="field mt-1 h-11 w-full" placeholder={bundle ? "e.g. Factory Starter Pack" : "e.g. 50 Most Profitable Manufacturing Businesses"} /></label>
          <label className={lbl}>Subtitle<input value={f.subtitle} onChange={(e) => set("subtitle", e.target.value)} className="field mt-1 h-11 w-full" placeholder="One line under the title" /></label>
          <label className={lbl}>Description<textarea rows={6} value={f.description} onChange={(e) => set("description", e.target.value)} className="field mt-1 w-full py-3" placeholder={bundle ? "Shown under “About this bundle”" : "Shown under “About this ebook”"} /></label>
          <p className="text-[12px] text-fog">Page address: <b className="text-cream-2">sahikaam.com/{download ? "wallpaper" : "book"}/{slugPreview || "…"}</b>{isNew && " (made from the title, can’t be changed later)"}</p>
        </Card>

        <Card title="Media" sub="The cover shows in lists. Gallery images show on the book page — the first one is the main picture.">
          <div className="flex flex-wrap items-center gap-4">
            {cover ? <img src={cover.url} alt="" className="h-32 w-24 rounded-lg object-cover ring-1 ring-ink/10" /> : <div className="flex h-32 w-24 items-center justify-center rounded-lg bg-ink/[0.05] text-[12px] text-fog">No cover</div>}
            <label className={lbl}>{cover ? "Change cover" : "Upload cover"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const x = toImg(e.target.files)[0]; if (x) setCover(x); }} className="field mt-1 block py-2" /><span className={hint}>JPG, PNG or WEBP, up to 5MB</span></label>
          </div>
          <div>
            <p className={lbl}>Gallery ({gallery.length})</p>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {gallery.map((g, i) => (
                <div key={g.url} className="rounded-xl bg-ink/[0.04] p-2 text-[12px]">
                  <img src={g.url} alt="" className="h-28 w-full rounded-lg object-contain" />
                  <p className="mt-1 font-semibold text-cream-2">{i === 0 ? "Main image" : `Image ${i + 1}`}</p>
                  <div className="mt-1 flex gap-1">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="btn-ghost h-8 flex-1 px-0 text-[12px] disabled:opacity-40" aria-label="Move earlier">←</button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === gallery.length - 1} className="btn-ghost h-8 flex-1 px-0 text-[12px] disabled:opacity-40" aria-label="Move later">→</button>
                    <button type="button" onClick={() => setGallery((x) => x.filter((_, j) => j !== i))} className="btn-ghost h-8 flex-1 px-0 text-[12px] text-rosy" aria-label="Remove">✕</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => galleryInput.current?.click()} className="flex h-full min-h-[8rem] items-center justify-center rounded-xl border-2 border-dashed border-ink/15 text-[13px] font-semibold text-fog hover:text-cream">+ Add images</button>
            </div>
            <input ref={galleryInput} type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const imgs = toImg(e.target.files); setGallery((g) => [...g, ...imgs]); e.target.value = ""; }} />
          </div>
        </Card>

        <Card title="Pricing">
          {download && (
            <label className="flex items-start gap-2 rounded-2xl bg-ink/[0.04] p-3 text-[14px] text-cream"><input type="checkbox" className="mt-1" checked={f.noCoupon} onChange={(e) => set("noCoupon", e.target.checked)} />
              <span><b>No coupons on this item</b><span className="block text-[12px] text-fog">The price stays fixed — the site-wide offer code is ignored and the coupon box is hidden at checkout.</span></span></label>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={lbl}>Price ₹ *<input type="number" min="0" value={f.price} onChange={(e) => set("price", e.target.value)} className="field mt-1 h-11 w-full" placeholder="What the customer pays" /></label>
            <label className={lbl}>MRP ₹ (struck-through)<input type="number" min="0" value={f.mrp} onChange={(e) => set("mrp", e.target.value)} className="field mt-1 h-11 w-full" placeholder="Optional" /></label>
          </div>
          {off > 0 && <p className="text-[13px] font-semibold text-mint">Customers see {off}% off ({inr(price)} instead of {inr(mrp)}).</p>}
        </Card>

        {bundle && (
          <Card title="Books in this bundle" sub="Buyers get every book here the moment they pay. Books you add later reach people who already bought it.">
            <label className="flex items-start gap-2 rounded-2xl bg-ink/[0.04] p-3 text-[14px] text-cream">
              <input type="checkbox" className="mt-1" checked={f.includeAll} onChange={(e) => set("includeAll", e.target.checked)} />
              <span><b>Every book on the website</b> — including books added in future (like All Access)<span className="block text-[12px] text-fog">{books.length} books right now. You don&apos;t need to pick them one by one.</span></span>
            </label>
            {!f.includeAll && (
              <>
                <div className="flex flex-wrap gap-2">
                  <input value={pick} onChange={(e) => setPick(e.target.value)} placeholder="Search books" className="field h-10 min-w-0 flex-1" />
                  <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="field h-10">
                    <option value="">All categories</option>{categories.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                  <button type="button" className="btn-ghost h-10 px-3 text-[13px]" onClick={() => set("bundleItems", [...new Set([...f.bundleItems, ...shown.map((b) => b.slug)])])}>Select shown</button>
                  <button type="button" className="btn-ghost h-10 px-3 text-[13px]" onClick={() => set("bundleItems", [])}>Clear</button>
                </div>
                <div className="max-h-80 overflow-auto rounded-2xl bg-ink/[0.04] p-1">
                  {shown.map((b) => (
                    <label key={b.slug} className="flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-[14px] hover:bg-ink/[0.05]">
                      <input type="checkbox" checked={chosen.has(b.slug)} onChange={() => toggleItem(b.slug)} />
                      {b.cover ? <img src={b.cover} alt="" className="h-10 w-7 rounded object-cover" /> : <span className="h-10 w-7 rounded bg-ink/[0.08]" />}
                      <span className="min-w-0 flex-1 truncate text-cream">{b.title}</span><span className="shrink-0 text-fog">{inr(b.price)}</span>
                    </label>
                  ))}
                  {shown.length === 0 && <p className="p-3 text-[13px] text-fog">No books match.</p>}
                </div>
              </>
            )}
            <div className="rounded-2xl bg-mint/10 p-3 text-[14px] text-cream">
              <b>{itemCount} books</b> · bought separately they cost <b>{inr(itemsTotal)}</b>
              {price > 0 && itemsTotal > price && <> · your price saves buyers <b>{Math.round(((itemsTotal - price) / itemsTotal) * 100)}%</b></>}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px]">
                <span className="text-fog">Set price from total:</span>
                {[10, 20, 30, 40, 50].map((d) => (
                  <button key={d} type="button" disabled={!itemsTotal} onClick={() => set("price", String(Math.round(itemsTotal * (1 - d / 100))))} className="btn-ghost h-8 px-3 text-[12px] disabled:opacity-40">{d}% off</button>
                ))}
              </div>
              <p className="mt-1 text-[12px] text-fog">Leave MRP empty to show the total of the books as the struck-through price.</p>
            </div>
            <label className={lbl}>How long buyers keep access
              <select value={["", "365", "183"].includes(f.accessDays) ? f.accessDays : "custom"} onChange={(e) => set("accessDays", e.target.value === "custom" ? "30" : e.target.value)} className="field mt-1 h-11 w-full">
                <option value="">Lifetime</option><option value="365">1 year</option><option value="183">6 months</option><option value="custom">Custom number of days…</option>
              </select>
              {!["", "365", "183"].includes(f.accessDays) && <input type="number" min="1" value={f.accessDays} onChange={(e) => set("accessDays", e.target.value)} className="field mt-2 h-11 w-full" placeholder="Days" />}
            </label>
          </Card>
        )}

        <Card title="Highlights" sub="Big numbers at the top of the page, e.g. “50 · Business ideas”.">
          <PairList items={f.highlights} onChange={(v) => set("highlights", v)} a="Big text (50)" b="Small text (Business ideas)" add="Add highlight" />
        </Card>
        {!download && <Card title="What buyers will learn">
          <TextList items={f.learn} onChange={(v) => set("learn", v)} placeholder="e.g. Pick a business that fits your budget" add="Add point" />
        </Card>}
        {!download && <Card title="What's inside" sub="Main parts of the book, each with a short explanation.">
          <PairList items={f.inside} onChange={(v) => set("inside", v)} a="Heading" b="Short explanation" add="Add section" />
        </Card>}
        {!bundle && !download && (
          <Card title="Chapters">
            <TextList items={f.chapters} onChange={(v) => set("chapters", v)} placeholder="Chapter name" add="Add chapter" />
          </Card>
        )}
        {!bundle && !download && (
          <Card title="Files & languages" sub="Buyers read the PDF inside SahiKaam’s reader. They can’t download it.">
            <div key="hi">{pdfCard("hi")}</div><div key="en">{pdfCard("en")}</div>
          </Card>
        )}
        <Card title={download ? "Files buyers download" : "Bonus downloads"} sub={download ? "The file(s) a buyer gets the moment they pay — image, ZIP, anything. Large files upload in pieces." : "Extra files only buyers can download (Excel sheets, checklists…)."}>
          <div className="grid gap-2">
            {bonus.map((b, i) => (
              <div key={i} className="grid gap-2 rounded-2xl bg-ink/[0.04] p-2.5 sm:grid-cols-[1fr_1fr_auto]">
                <input value={b.title} onChange={(e) => setBonus((x) => x.map((y, j) => (j === i ? { ...y, title: e.target.value } : y)))} placeholder="Title (e.g. Profit calculator)" className="field h-11" />
                <input value={b.text} onChange={(e) => setBonus((x) => x.map((y, j) => (j === i ? { ...y, text: e.target.value } : y)))} placeholder="Short note (optional)" className="field h-11" />
                <button type="button" onClick={() => setBonus((x) => x.filter((_, j) => j !== i))} aria-label="Remove" className="btn-ghost h-11 w-11 px-0">✕</button>
                <p className="text-[12px] text-fog sm:col-span-3">
                  {b.upload ? `New file: ${b.upload.name}` : b.file ? `File: ${b.file}` : "No file yet"}{" · "}
                  <label className="cursor-pointer font-semibold text-saffron-400">{b.file || b.upload ? "Replace" : "Choose file"}<input type="file" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) setBonus((x) => x.map((y, j) => (j === i ? { ...y, upload: file } : y))); }} /></label>
                </p>
              </div>
            ))}
            <button type="button" onClick={() => setBonus((x) => [...x, { title: "", text: "", file: "" }])} className="btn-ghost h-10 justify-self-start px-4 text-[13px]">+ Add bonus file</button>
          </div>
        </Card>
      </div>

      <aside className="grid content-start gap-5 lg:sticky lg:top-6 lg:self-start">
        <section className="card p-5">
          <h2 className="font-display text-[18px] font-bold text-cream">Status</h2>
          <label className="mt-3 flex items-start gap-2 text-[14px] text-cream"><input type="checkbox" className="mt-1" checked={f.published} onChange={(e) => set("published", e.target.checked)} />
            <span><b>{f.published ? "Visible on the website" : "Hidden (draft)"}</b><span className="block text-[12px] text-fog">{f.published && !filesReady && !bundle && !download ? "No PDF yet — buyers would get nothing. Add a PDF or mark it “coming soon”." : "Hidden books can’t be seen or bought."}</span></span>
          </label>
          {msg && <p role={msg.ok ? "status" : "alert"} className={`mt-3 rounded-xl p-2.5 text-[13px] ${msg.ok ? "bg-mint/10 text-cream" : "bg-rosy/10 text-rosy"}`}>{msg.text}</p>}
          <button disabled={busy} className="btn-primary mt-3 h-12 w-full disabled:opacity-60">{busy ? (progress || "Saving…") : isNew ? (bundle ? "Create bundle" : download ? "Create download" : "Create product") : "Save changes"}</button>
          {!isNew && <Link href={`/${download ? "wallpaper" : "book"}/${initial.slug}`} target="_blank" className="btn-ghost mt-2 h-11 w-full text-[13px]">View live page ↗</Link>}
          <Link href="/admin/books" className="mt-3 block text-center text-[13px] font-semibold text-fog hover:text-cream">← All products</Link>
        </section>

        <section className="card grid gap-3 p-5">
          <h2 className="font-display text-[18px] font-bold text-cream">Organisation</h2>
          {!bundle && !download && <label className={lbl}>Category *<select value={f.category} onChange={(e) => set("category", e.target.value)} className="field mt-1 h-11 w-full"><option value="" disabled>Choose…</option>{categories.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</select></label>}
          <label className={lbl}>Badge<input value={f.badge} onChange={(e) => set("badge", e.target.value)} className="field mt-1 h-11 w-full" placeholder="e.g. Bestseller" /></label>
          <label className={lbl}>Level<input value={f.level} onChange={(e) => set("level", e.target.value)} className="field mt-1 h-11 w-full" placeholder="e.g. Beginner to advanced" /></label>
          <label className={lbl}>Position in lists<input type="number" value={f.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} className="field mt-1 h-11 w-full" /><span className={hint}>Smaller number shows first.</span></label>
        </section>

        <section className="card p-5">
          <h2 className="font-display text-[18px] font-bold text-cream">Preview</h2>
          <div className="mt-3 flex gap-3">
            {cover ? <img src={cover.url} alt="" className="h-24 w-[4.5rem] shrink-0 rounded-lg object-cover ring-1 ring-ink/10" /> : <div className="h-24 w-[4.5rem] shrink-0 rounded-lg bg-ink/[0.06]" />}
            <div className="min-w-0">
              {f.badge && <span className="chip">{f.badge}</span>}
              <p className="mt-1 font-bold leading-tight text-cream">{f.title || "Product title"}</p>
              {f.subtitle && <p className="mt-0.5 line-clamp-2 text-[12px] text-fog">{f.subtitle}</p>}
              <p className="mt-1.5 text-[15px] font-extrabold text-cream">{f.price === "" ? "₹—" : price === 0 ? "Free" : inr(price)} {off > 0 && <span className="ml-1 text-[12px] font-normal text-fog line-through">{inr(mrp)}</span>}</p>
            </div>
          </div>
        </section>
      </aside>
    </form>
  );
}
