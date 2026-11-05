import "server-only";
import { one, run } from "./db";

/** Counts a hit for key k inside a rolling window; false once the limit for this window is used up. */
export async function hit(k: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now();
  const row = await one<{ hits: number; window_start: number }>("SELECT hits, window_start FROM rate_limits WHERE k = ?", [k]);
  if (row && now - Number(row.window_start) < windowMs) {
    if (Number(row.hits) >= limit) return false;
    await run("UPDATE rate_limits SET hits = hits + 1 WHERE k = ?", [k]);
    return true;
  }
  await run("DELETE FROM rate_limits WHERE k = ?", [k]);
  await run("INSERT INTO rate_limits (k, hits, window_start) VALUES (?, 1, ?)", [k, now]);
  return true;
}
