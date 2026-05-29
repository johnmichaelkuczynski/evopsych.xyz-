# Teach Yourself Evolutionary Psychology

A self-paced, single-user web course on the adapted mind — from natural selection to cooperation, language, and culture. It is a content reskin of the **QuantReason** runtime: the full lecture / tutor / practice / grading / detection / diagnostics stack is preserved, with the curriculum replaced by 29 evolutionary-psychology micro-lectures across four weeks.

> Read the idea, see it grounded in a real example, then state the idea precisely.

---

## Features

- **29 micro-lectures across 4 weeks** (7 / 7 / 7 / 8), each at three depths (short / medium / long).
- **Section-scoped AI tutor** — streaming, grounded in the active lecture.
- **Adaptive practice** — per-session difficulty (1–4) adjusts after each attempt; problems are generated on demand.
- **AI-graded assignments** — 12 assignments (homework, tests, midterm, final) with conceptual short-answer problems. Answers can be plain language or symbolic (e.g. Hamilton's rule `$rB > C$`) via the on-screen math/symbol keyboard.
- **Two-layer AI-authorship detection** — static (GPTZero + structural heuristic) and diachronic (keystroke-pattern analysis).
- **Two one-click diagnostics** — a system self-test and an end-to-end synthetic-student run.
- **Auto-reseed** — the database re-seeds itself when the curriculum content changes.
- **Companion demo video** — a narrated screencast of the live UI (`qr-course-demo`).

---

## Architecture

This is a pnpm monorepo. The contract is defined once in OpenAPI; React Query hooks and Zod validators are generated from it.

| Path | Description |
| --- | --- |
| `artifacts/qr-course` | React + Vite frontend (the course UI). |
| `artifacts/qr-course-demo` | React + Framer Motion demo video with scene-synced narration + music. |
| `artifacts/api-server` | Express API: course, lectures, tutor (SSE), practice, grading, analytics, diagnostics. |
| `lib/db` | Drizzle schema + `drizzle-kit push` for the Postgres database. |
| `lib/api-spec` | OpenAPI document and code generation. |

See [BLUEPRINT.md](./BLUEPRINT.md) for the full technical blueprint.

---

## Required secrets

| Secret | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Tutor, practice generator, AI graders, lecture-expansion job. Required at boot. |
| `GPTZERO_API_KEY` | GPTZero leg of static AI detection. If absent, falls back to an LLM scorer + heuristic. |
| `DATABASE_URL` | Postgres connection string (Neon or Replit Postgres). |

Secrets are requested via the Replit secrets panel; none are hard-coded.

---

## Running locally

The app runs via Replit **workflows**, not root-level `pnpm dev`. Each artifact has its own workflow:

- `artifacts/api-server: API Server`
- `artifacts/qr-course: web`
- `artifacts/qr-course-demo: web`

### Database setup

The schema lives in `@workspace/db`. After provisioning a fresh database (or pointing `DATABASE_URL` at a new one), push the schema and restart the API server so it seeds the course content:

```bash
pnpm --filter @workspace/db run push
# then restart the "API Server" workflow
```

On boot, `seedIfEmpty` populates 29 topics · 29 lectures · 12 assignments · 53 problems, and re-seeds automatically whenever the curriculum content changes.

### Typecheck

```bash
pnpm --filter @workspace/api-server run typecheck
pnpm --filter @workspace/qr-course run typecheck
pnpm --filter @workspace/qr-course-demo run typecheck
```

---

## Diagnostics

Two self-tests verify the full stack (both reachable from the in-app **Diagnostic** button, and via the API through the shared proxy at `localhost:80`):

| Diagnostic | Endpoint | What it checks |
| --- | --- | --- |
| **System** | `GET /api/diagnostics/system` | Environment, DB round-trip, seed integrity, OpenAI chat + JSON mode, detection pipeline, grader equivalence. |
| **Synthetic student** | `POST /api/diagnostics/synthetic-run` | End-to-end: a fake student reads every lecture, submits all 12 assignments, runs adaptive practice, asks the tutor, triggers AI detection, and verifies analytics. |

---

## Curriculum

- **Week 1 — Foundations of evolutionary psychology**
- **Week 2 — Survival and the evolved individual**
- **Week 3 — Mating and reproduction**
- **Week 4 — Social life, cooperation, and culture**

Every lecture grounds its concept in a worked example (Hamilton's rule, Trivers' parental investment, the Wason selection task, snake-fear preparedness, Buss's mate-preference surveys, and more), and every problem asks the student to state the key idea precisely.
