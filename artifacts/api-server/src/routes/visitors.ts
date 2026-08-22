import { Router, type IRouter } from "express";
import { ensureVisitorId, upsertVisitor } from "../middlewares/visitor";

const router: IRouter = Router();

// Called once per app load: mint/refresh the anonymous visitor cookie and
// upsert the unique-visitor row.
router.post("/visitors/track", async (req, res) => {
  const visitorId = ensureVisitorId(req, res);
  await upsertVisitor(visitorId, { bumpVisit: true });
  res.json({ ok: true });
});

export default router;
