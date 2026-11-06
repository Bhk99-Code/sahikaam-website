import { notFound, redirect } from "next/navigation";
import { getDownloads } from "@/lib/data";

export const dynamic = "force-dynamic";

/** sahikaam.com/wallpaper → the current wallpaper's page (the link to share on Instagram). */
export default function WallpaperIndex() {
  const first = getDownloads()[0];
  if (!first) notFound();
  redirect(`/wallpaper/${first.slug}`);
}
