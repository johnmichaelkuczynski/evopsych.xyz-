import { Router, type IRouter } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { ensureVisitorId, upsertVisitor } from "../middlewares/visitor";

const router: IRouter = Router();

const OWNER_EMAIL = "johnmichaelkuczynski@gmail.com";

// Called once per app load: mint/refresh the anonymous visitor cookie and
// upsert the unique-visitor row.
router.post("/visitors/track", async (req, res) => {
  const visitorId = ensureVisitorId(req, res);
  await upsertVisitor(visitorId, { bumpVisit: true });
  res.json({ ok: true });
});

// Owner-only unique visitor count. Requires a signed-in Clerk session whose
// primary email is the owner's.
router.get("/visitors/count", async (req, res) => {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  let email: string | undefined;
  try {
    const user = await clerkClient.users.getUser(String(userId));
    email =
      user.primaryEmailAddress?.emailAddress ??
      user.emailAddresses[0]?.emailAddress;
  } catch (err) {
    req.log.warn({ err }, "failed to look up Clerk user for visitor count");
  }
  if (email?.toLowerCase() !== OWNER_EMAIL) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const result = await db.execute(
    sql`select count(*)::int as n from visitors`,
  );
  const uniqueVisitors = (result.rows[0] as { n?: number } | undefined)?.n ?? 0;
  res.json({ uniqueVisitors });
});

export default router;
