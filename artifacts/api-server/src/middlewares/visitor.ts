import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { sql } from "drizzle-orm";
import { db } from "@workspace/db";

export const VISITOR_COOKIE = "evo_vid";
const COOKIE_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; // 1 year


export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    if (!key) continue;
    try {
      out[key] = decodeURIComponent(part.slice(idx + 1).trim());
    } catch {
      out[key] = part.slice(idx + 1).trim();
    }
  }
  return out;
}

/** Read the visitor id cookie, minting + setting it when absent. */
export function ensureVisitorId(req: Request, res: Response): string {
  const cookies = parseCookies(req.headers.cookie);
  let vid = cookies[VISITOR_COOKIE];
  if (!vid || !/^[A-Za-z0-9-]{16,64}$/.test(vid)) {
    vid = randomUUID();
    res.cookie(VISITOR_COOKIE, vid, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: COOKIE_MAX_AGE_MS,
      path: "/",
    });
  }
  return vid;
}

/** Upsert the visitor row, bumping last-seen. Returns current aiCharsUsed. */
export async function upsertVisitor(
  visitorId: string,
  opts: { bumpVisit?: boolean } = {},
): Promise<number> {
  const bump = opts.bumpVisit ? 1 : 0;
  const result = await db.execute(
    sql`insert into visitors (visitor_id) values (${visitorId})
        on conflict (visitor_id) do update
          set last_seen_at = now(),
              visit_count = visitors.visit_count + ${bump}
        returning ai_chars_used`,
  );
  return (result.rows[0] as { ai_chars_used?: number } | undefined)?.ai_chars_used ?? 0;
}

