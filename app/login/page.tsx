import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Login" };

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  const next = searchParams.next && searchParams.next.startsWith("/") && !searchParams.next.startsWith("//") ? searchParams.next : "/library";
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-10 sm:py-16">
      <div className="rounded-[24px] border border-line bg-white p-6 shadow-card sm:p-8">
        <h1 className="text-[26px] font-extrabold tracking-tight">Login / Sign up</h1>
        <p className="mt-2 text-[15px] text-ink-4">Apna email daalein — hum ek 6-digit code bhejenge. Password ki zaroorat nahi.</p>
        <LoginForm next={next} />
      </div>
    </div>
  );
}
