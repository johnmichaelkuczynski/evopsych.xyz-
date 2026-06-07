import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";

// Gate sensitive endpoints behind a valid Clerk session. The web app sends the
// session cookie automatically on same-origin requests, so signed-in users pass
// transparently while anonymous callers are rejected.
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
