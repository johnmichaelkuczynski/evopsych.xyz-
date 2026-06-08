---
name: Practice-assignments list is unbounded by design
description: Why the /practice-assignments list query must use batched aggregates, not per-row queries
---

The practice-assignments feature lets the user generate UNLIMITED never-repeated practice sets, so the `practice_assignments` table grows without bound for a single user.

**Rule:** Any query that lists practice sets (especially the global Practice tab, which lists ALL sets with no `sourceAssignmentId` filter) must derive per-set data (problem counts, source titles) with batched/grouped queries (`inArray` + `GROUP BY`), never one query per row.

**Why:** A per-set `count(*)` loop is an N+1 that was tolerable when the list was filtered to one assignment but degrades badly once the global tab lists the entire unbounded history.

**How to apply:** When adding columns/derived fields to the list response, extend the batched lookups; if the history grows large, add pagination (limit + cursor) to the unfiltered list.
