# Technical Blueprint — Teach Yourself Evolutionary Psychology

This document describes the system architecture, data flow, and the contracts that hold the pieces together. For a feature overview and setup steps, see [README.md](./README.md).

---

## 1. System overview

```
                         ┌─────────────────────────────┐
                         │        Shared proxy          │
                         │        (localhost:80)        │
                         └──────────────┬──────────────┘
            /            │            /api            │        /qr-course-demo
   ┌────────────────┐    │   ┌────────────────────┐   │   ┌────────────────────┐
   │  qr-course     │    │   │   api-server       │   │   │  qr-course-demo    │
   │  React + Vite  │────┼──▶│   Express          │   │   │  React + Framer    │
   │  (course UI)   │    │   │                    │   │   │  (narrated video)  │
   └────────────────┘    │   └─────────┬──────────┘   │   └────────────────────┘
                         │             │              │
                         │   ┌─────────▼──────────┐   │
                         │   │   Postgres (Neon)  │   │
                         │   │   via Drizzle ORM  │   │
                         │   └────────────────────┘   │
                         │   external: OpenAI, GPTZero │
                         └─────────────────────────────┘
```

All artifacts are routed by path through a single reverse proxy. Services handle their own full base path; paths are not rewritten.

---

## 2. Contract-first API

The single source of truth is the OpenAPI document in `lib/api-spec`. From it we generate:

- **React Query hooks** — consumed by the `qr-course` frontend.
- **Zod schemas** — used by the `api-server` to validate request and response payloads.

Regenerate after any spec change:

```bash
pnpm --filter @workspace/api-spec run codegen
```

Do not change the OpenAPI `info.title` — it controls generated filenames.

---

## 3. API surface (`artifacts/api-server`)

| Route group | Responsibility |
| --- | --- |
| `course` | Course overview (week titles, lecture/assignment counts), lecture content. |
| `tutor` | Section-scoped AI tutor; token-by-token Server-Sent-Event streaming. |
| `practice` | Adaptive practice sessions; on-demand problem generation; difficulty 1–4. |
| `assignments` | Assignment attempts and answer submission. Invokes the internal AI grader (LaTeX-aware, with a numeric short-circuit). |
| `detection` | Two-layer AI-authorship detection on submitted answers. |
| `analytics` | Per-topic mastery, activity feed, and an LLM-authored narrative report. |
| `diagnostics` | System self-test and synthetic-student end-to-end run. |
| `health` | Liveness/readiness check. |

> AI **grading** is a service/library invoked by the `assignments` and `practice` routes — it is not a standalone route group.

**Logging:** route handlers use `req.log`; non-request code uses the singleton `logger`. No `console.log` in server code.

---

## 4. Data layer (`lib/db`)

- Schema defined with Drizzle in `lib/db/src/schema`.
- Applied out-of-band via `drizzle-kit push` (there is no migration/`CREATE TABLE` step in the app boot path).
- Core tables: `topics`, `lectures`, `assignments`, `problems`, `attempts`, `answers`, `practice_sessions`, `practice_problems`, `practice_attempts`.

### Auto-reseed contract

On boot, `seedIfEmpty` decides whether the database holds the current content by checking **two** things:

1. The sorted set of topic slugs matches the expected curriculum.
2. A revision-sentinel phrase is present in one designated lecture body.

If **either** differs, it wipes (child → parent order) and re-seeds. `CONTENT_REVISION` is logged for humans; the actual drift gate is the slug set plus the sentinel phrase.

> **When overhauling content:** changing slugs triggers a reseed automatically. If you change only lecture bodies / answers / problems while keeping slugs, you **must** also bump the sentinel phrase (and `CONTENT_REVISION`), or the new content will not propagate.

---

## 5. Two-layer AI-authorship detection

**Static (per-document):**
- Each submitted answer is sent to GPTZero's `predict/text` endpoint.
- Final score blends `0.85 × GPTZero + 0.15 × structural-heuristic`.
- If GPTZero is unavailable, the system silently falls back to an LLM scorer plus the heuristic.

**Diachronic (keystroke pattern):**
- The student textarea captures keystroke count, erase count, bulk-insert events, longest bulk insert, rewrite segments, and total duration.
- A scorer penalizes paste-then-reword behavior, low keystroke-to-output ratios, and impossibly sustained typing speeds.

---

## 6. Conceptual answer harness

Problems are structured so the canonical answer is a precise statement of an evolutionary-psychology concept — occasionally notation (e.g. Hamilton's rule `$rB > C$`, relatedness `r = 1/2` for full siblings).

- **Prompt rendering:** KaTeX.
- **Answer entry:** an on-screen math/symbol keyboard (Relations / Operators / Greek / Logic & sets).
- **Grading:** a LaTeX-aware AI grader with a numeric short-circuit for purely numeric answers.

---

## 7. Demo video with audio (`artifacts/qr-course-demo`)

- Six scenes built with React + Framer Motion, driven by a scene-duration timeline (total ≈ 62s).
- A continuous instrumental **music bed** (`public/audio/bg_music.mp3`) is seeked per scene so the score stays aligned when a viewer jumps between scenes.
- **Scene-synced voiceover narration** (`public/audio/narration/s{1..6}.mp3`) plays the current scene's clip from its start on each scene change, layered over the (ducked) music bed.
- Audio starts muted (browser autoplay policy); the in-iframe control bar exposes mute/unmute, per-scene scrubbing, and loop.

---

## 8. Diagnostics

| Diagnostic | Endpoint | Method |
| --- | --- | --- |
| System self-test | `/api/diagnostics/system` | `GET` |
| Synthetic-student run | `/api/diagnostics/synthetic-run` | `POST` |

The system test returns `{ ok, generatedAt, steps: [{ name, ok, ms, detail }] }`. The synthetic run proves the whole stack by having a fake student exercise lectures, all 12 assignments, practice, the tutor, detection, and analytics.

---

## 9. Required external services

| Service | Used by | Failure behavior |
| --- | --- | --- |
| OpenAI | tutor, practice, grading, analytics narrative, lecture expansion | Required at boot. |
| GPTZero | static AI detection | Falls back to LLM scorer + heuristic. |
| Postgres | all persistence | App cannot serve course data; reseed requires the schema to be pushed first. |
