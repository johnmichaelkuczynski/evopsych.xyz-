---
name: qr-course single-user backend
description: The EvoPsych course backend is intentionally single-user; only diagnostics is auth-gated server-side.
---

The `artifacts/api-server` backend for the EvoPsych course is **single-user by design**.

- No table carries a `userId`; no route filters by user except `routes/diagnostics.ts`, which mounts `requireAuth`.
- All other data (assignments, attempts, analytics, practice-assignments, learner_profile) is global/unscoped.
- User-facing auth is enforced **only on the frontend** via the Clerk `requireAuth` HOC wrapping pages in `App.tsx`.

**Why:** `replit.md` describes this as a "single-user web course." A code reviewer (architect) will flag the practice routes for "broken access control / missing ownership scoping" — that is the app-wide architecture, not a regression. Do NOT bolt `userId` onto only one feature's routes; it would be inconsistent and add no real security while diverging from every other route.

**How to apply:** If asked to add multi-user/per-user data isolation, treat it as an app-wide change (schema + every route + auth middleware), not a per-feature patch — and confirm scope with the user first.

**Testing diagnostics endpoints:** `routes/diagnostics.ts` (including `expand-lectures`, which supports an optional `?id=` to generate medium/long for ONE lecture) authenticates only via the same-origin Clerk session cookie. `curl` will always get `{"error":"Unauthorized"}` — verify these flows in the browser, not from the shell.
