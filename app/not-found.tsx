import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container-x max-w-md py-24 text-center">
      <p className="font-display text-[72px] font-extrabold text-gradient">404</p>
      <h1 className="font-display text-[24px] font-bold text-cream">We couldn&apos;t find that page</h1>
      <Link href="/" className="btn-primary mt-7">Go to home</Link>
    </div>
  );
}
