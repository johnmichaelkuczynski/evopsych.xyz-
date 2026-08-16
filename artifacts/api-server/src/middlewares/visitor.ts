import { randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { sql } from "drizzle-orm";
import { db } from "@workspace/db";

export const VISITOR_COOKIE = "evo_vid";
const COOKIE_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; // 1 year

// Signed-out visitors may consume roughly two paragraphs of AI-generated
// output before the login gate kicks in. Measured as serialized response
// characters from AI endpoints.
export const FREE_AI_CHAR_LIMIT = 2400;

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

async function addAiUsage(visitorId: string, chars: number): Promise<void> {
  await db.execute(
    sql`update visitors
        set ai_chars_used = greatest(ai_chars_used + ${chars}, 0), last_seen_at = now()
        where visitor_id = ${visitorId}`,
  );
}

// Worst-case allowance reserved atomically before an AI call runs; reconciled
// against actual output length afterwards. Prevents parallel requests from
// all slipping under the limit at once.
const RESERVE_CHARS = 800;

/**
 * Atomically reserve AI budget for one request. Returns true when the visitor
 * was still under the limit (reservation applied), false when exhausted.
 */
async function reserveAiBudget(visitorId: string): Promise<boolean> {
  const result = await db.execute(
    sql`insert into visitors (visitor_id, ai_chars_used) values (${visitorId}, ${RESERVE_CHARS})
        on conflict (visitor_id) do update
          set last_seen_at = now(),
              ai_chars_used = visitors.ai_chars_used + ${RESERVE_CHARS}
          where visitors.ai_chars_used < ${FREE_AI_CHAR_LIMIT}
        returning ai_chars_used`,
  );
  return result.rows.length > 0;
}

// GET endpoints that still trigger AI generation and must be gated.
// Matched against originalUrl because router mounting strips path prefixes.
const AI_GET_PATHS = [/\/tutor\/suggestions\//];

/**
 * Gate for AI-generating endpoints. Signed-in users pass untouched. Anonymous
 * visitors get a free budget of AI output; once exhausted, mutating requests
 * are rejected with a LOGIN_REQUIRED payload the frontend turns into a
 * "Sign in with Google" prompt. Successful anonymous responses are metered by
 * serialized length.
 */
export function aiUsageGate(req: Request, res: Response, next: NextFunction) {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (userId) {
    next();
    return;
  }

  // Gate requests that trigger AI generation: all mutations under the gated
  // routers, plus specific AI-generating GET endpoints.
  const isAiGet = AI_GET_PATHS.some((re) => re.test(req.originalUrl));
  if ((req.method === "GET" || req.method === "HEAD") && !isAiGet) {
    next();
    return;
  }

  const visitorId = ensureVisitorId(req, res);

  reserveAiBudget(visitorId)
    .then((allowed) => {
      if (!allowed) {
        res.status(401).json({
          error: "login_required",
          code: "LOGIN_REQUIRED",
          message:
            "You've used your free preview. Sign in with Google to keep going — it's free.",
        });
        return;
      }

      // Reconcile the reservation against actual AI output length.
      const originalJson = res.json.bind(res);
      let reconciled = false;
      res.json = ((body: unknown) => {
        try {
          if (!reconciled) {
            reconciled = true;
            let actual = 0;
            if (res.statusCode < 400 && body != null) {
              actual = JSON.stringify(body)?.length ?? 0;
            }
            const delta = actual - RESERVE_CHARS;
            if (delta !== 0) {
              addAiUsage(visitorId, delta).catch((err) =>
                req.log.warn({ err }, "failed to reconcile AI usage"),
              );
            }
          }
        } catch {
          // metering must never break the response
        }
        return originalJson(body as never);
      }) as typeof res.json;

      next();
    })
    .catch(next);
}
