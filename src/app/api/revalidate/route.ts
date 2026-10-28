import { revalidateTag } from "next/cache";
import { PORTFOLIO_TAG } from "@/lib/portfolio";

/** Called by the NestJS backend after any admin edit. */
export async function POST(request: Request) {
  const secret = request.headers.get("x-revalidate-secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ message: "Invalid secret" }, { status: 401 });
  }

  // Expire immediately so the next visitor sees the edit, not stale content.
  revalidateTag(PORTFOLIO_TAG, { expire: 0 });
  return Response.json({ revalidated: true });
}
