import Link from "next/link";
export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <p className="text-[56px] font-extrabold text-brand-500">404</p>
      <h1 className="text-[22px] font-bold">Ye page nahi mila</h1>
      <Link href="/" className="mt-6 inline-flex h-12 items-center rounded-full bg-ink px-6 font-bold text-white">Home par jaayein</Link>
    </div>
  );
}
