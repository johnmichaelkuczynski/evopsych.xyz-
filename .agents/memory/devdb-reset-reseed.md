---
name: Dev DB reset breaks seed (relation does not exist)
description: When seedIfEmpty fails with "relation \"topics\" does not exist", the dev Postgres schema was wiped, not a content bug.
---

When the api-server boots and the diagnostic reports "course content seeded: False" with logs showing `Seed failed ... relation "topics" does not exist`, the development Postgres database has lost its tables (e.g. after a database checkpoint rollback or dev DB reprovision). seedIfEmpty's first `select count(*) from topics` throws before it can create anything.

**Why:** There is no migration/`CREATE TABLE` step in the app boot path. The schema is owned by `@workspace/db` (drizzle) and applied out-of-band via `drizzle-kit push`. The seed assumes tables already exist.

**How to apply:** Re-push the schema, then restart the api-server so seedIfEmpty repopulates:
`pnpm --filter @workspace/db run push` then restart the `API Server` workflow. Do NOT touch seed.ts — it is not the cause.
