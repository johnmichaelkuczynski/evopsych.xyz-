---
name: Anonymous AI usage gate
description: How the signed-out free-preview gate works and its known limits
---
Anonymous visitors get a free AI-output budget tracked in the `visitors` table keyed by an `evo_vid` cookie; when exhausted, gated routes return 401 `{code:"LOGIN_REQUIRED"}` which the frontend turns into a sign-in dialog.
**Why:** owner wanted the login wall removed but AI spend capped (~two paragraphs free).
**How to apply:** budget must be reserved atomically (conditional upsert) before the AI call, not check-then-increment — parallel requests bypass a read-then-write check. Gate by explicit AI-route classification, not HTTP verb: some GETs (tutor suggestions) generate AI output. Cookie deletion resets the budget by design (soft gate); IP throttling is a proposed follow-up, not implemented.
