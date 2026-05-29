---
name: Course content auto-reseed coupling
description: How seedIfEmpty decides to wipe+reseed, and what to bump when overhauling course content.
---

The api-server's `seedIfEmpty` (in `@workspace/db` lib seed) decides whether the DB holds current content by checking TWO things: (1) the sorted set of topic slugs matches the expected set, AND (2) a sentinel phrase (`REVISION_SENTINEL_PHRASE`) is present in the body of one designated lecture (`REVISION_SENTINEL_SLUG`). If either differs, it wipes child→parent tables and re-seeds. `CONTENT_REVISION` is logged for humans but the actual drift gate is slugs + sentinel phrase.

**Why:** A pure content swap (changing answers/bodies) may keep the same slugs; without the sentinel check the DB would silently keep stale content. The sentinel phrase is the lever that forces a reseed when slugs are unchanged.

**How to apply:** When overhauling course content, if you change slugs the reseed fires automatically. If you change only bodies/answers/problems while keeping slugs, you MUST change the sentinel phrase (and bump CONTENT_REVISION for clarity) or the new content will not propagate on boot.
