import { cacheLife, cacheTag } from "next/cache";
import type { Portfolio } from "./types";

export const PORTFOLIO_TAG = "portfolio";

/**
 * Public portfolio content. Cached and tagged so the backend can invalidate it
 * through /api/revalidate whenever something is edited in the admin panel.
 */
export async function getPortfolio(): Promise<Portfolio | null> {
  "use cache";
  cacheTag(PORTFOLIO_TAG);

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portfolio`);
    if (!res.ok) throw new Error(`API responded ${res.status}`);
    cacheLife("hours");
    return (await res.json()) as Portfolio;
  } catch (err) {
    // Backend unreachable (e.g. during a build without the API running):
    // render an empty state and retry soon instead of caching the failure.
    console.error("Failed to load portfolio:", err);
    cacheLife("seconds");
    return null;
  }
}
