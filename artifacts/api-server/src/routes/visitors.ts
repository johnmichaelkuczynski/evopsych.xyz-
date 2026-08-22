import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { ensureVisitorId, upsertVisitor } from "../middlewares/visitor";

const router: IRouter = Router();

// Called once per app load: mint/refresh the anonymous visitor cookie and
// upsert the unique-visitor row.
router.post("/visitors/track", async (req, res) => {
  const visitorId = ensureVisitorId(req, res);
  await upsertVisitor(visitorId, { bumpVisit: true });
  res.json({ ok: true });
});

// Public course statistic. The application has no account system, so this is
// intentionally available to every visitor.
router.get("/visitors/count", async (_req, res) => {
  const result = await db.execute(
    sql`select count(*)::int as n from visitors`,
  );
  const uniqueVisitors =
    (result.rows[0] as { n?: number } | undefined)?.n ?? 0;
  res.json({ uniqueVisitors });
});

export default router;
