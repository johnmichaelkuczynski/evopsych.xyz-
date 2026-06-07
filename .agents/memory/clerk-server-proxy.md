---
name: Clerk server proxy is production-only by design
description: Why the api-server Clerk proxy middleware gates on NODE_ENV=production, and why that is correct.
---

The Replit-managed Clerk server proxy middleware (`artifacts/api-server/src/middlewares/clerkProxyMiddleware.ts`) intentionally only proxies when `NODE_ENV === "production"` and `CLERK_SECRET_KEY` exists.

**Why:** This is the canonical Replit-managed Clerk template, copied verbatim per the `clerk-auth` skill. The server-side proxy is used in production only; in dev the frontend talks to Clerk directly. The skill's "no PROD gating" rule applies to the **frontend** `proxyUrl`/`publishableKeyFromHost` wiring (which must stay ungated), NOT to this server middleware.

**How to apply:** Do not "fix" the NODE_ENV check in the server proxy — a code review (architect) may flag it as "production gating," but that is a false positive. Leave the template verbatim; only theme/appearance is meant to be edited.
