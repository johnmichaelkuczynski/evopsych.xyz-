# 🧬 Evolutionary Psychology

**A Four-Week Course on the Adapted Mind — From Natural Selection to Cooperation, Language, and Culture**

---

## 🧩 Overview

Evolutionary Psychology is a self-paced, single-user web course that asks the question most psychology classes skip: *why* do we have the minds we do? It grounds human behavior in the logic of natural selection rather than cataloguing isolated findings.

It delivers a complete, end-to-end learning loop — three-depth lectures, a section-scoped AI tutor, adaptive practice, AI-graded assignments, and two-layer authorship detection — across **29 micro-lectures** organized into four themed weeks.

Designed for curious readers, students, and educators, it teaches the conceptual backbone that runs through every undergraduate text in the field — adaptation, selection, kinship, mating, cooperation, and culture — presented in one connected arc rather than a pile of disconnected experiments.

---

## 🧠 What It Does

- **Four-Week Curriculum (29 Micro-Lectures)** — Foundations of evolutionary psychology (Week 1), survival and the evolved individual (Week 2), mating and reproduction (Week 3), and social life, cooperation, and culture (Week 4), sequenced so each idea builds on the last.
- **Three-Depth Lectures** — Every lecture is available at short, medium, and long depth, so you can skim the core idea or read the full treatment of the same concept.
- **One Real Example per Lecture** — Each micro-lecture grounds its concept in a worked example from biology, anthropology, history, or experimental psychology — Hamilton's rule and the evolution of altruism, Trivers' parental-investment theory, the Wason selection task, snake-fear preparedness, Buss's cross-cultural mate-preference surveys, and more.
- **Section-Scoped AI Tutor** — A streaming tutor grounded in the active lecture answers questions, offers starter prompts, and stays on-topic for the section you're reading.
- **Adaptive Practice Engine** — Per-session difficulty (1–4) adjusts after each attempt, and practice problems are generated on demand for the current concept.
- **AI-Graded Assignments** — 12 assignments (homework, tests, midterm, final) with conceptual short-answer problems. Each problem asks you to *state the key idea precisely* — in plain language or in symbolic form (Hamilton's rule `$rB > C$`, relatedness coefficients) via the on-screen math/symbol keyboard.
- **Two-Layer AI-Authorship Detection** — Every submission is checked for AI authorship both statically (GPTZero + structural heuristic) and diachronically (keystroke-pattern analysis).
- **Built-In Product Demo Video** — A companion artifact ships as a short, narrated screencast of the live UI.

---

## ⚙️ Technical Features

- **Conceptual Answer Harness** — Every problem prompt is structured so the canonical answer is a precise statement of an evolutionary-psychology concept, occasionally a piece of notation. Both prompt rendering (KaTeX) and answer grading (a LaTeX-aware AI grader with a numeric short-circuit) handle these cleanly.
- **Two-Layer AI-Authorship Detection** — Static detection sends each answer to GPTZero's `predict/text` endpoint and blends `0.85 × GPTZero + 0.15 × structural-heuristic`; if GPTZero is unavailable, it falls back to an LLM scorer plus heuristic. Diachronic detection scores the keystroke timeline — keystroke count, erase count, bulk-insert events, rewrite segments, and duration — to penalize paste-then-reword behavior and impossibly sustained typing.
- **Two Diagnostic Self-Tests** — A **System** diagnostic checks environment, database round-trip, seed integrity, OpenAI chat + JSON mode, the detection pipeline, and the grader. A **Synthetic-Student** diagnostic proves the full stack end-to-end: a fake student reads lectures, submits every assignment, runs practice, asks the tutor, triggers detection, and verifies analytics.
- **Auto-Reseed on Curriculum Change** — `seedIfEmpty` compares the database's topic slugs to the expected curriculum *and* checks a sentinel phrase in a designated lecture; if either differs, it wipes and re-seeds in dependency order. A single content swap propagates cleanly.
- **Contract-First API** — A single OpenAPI document is the source of truth; React Query hooks for the UI and Zod validators for the server are generated from it.
- **Streaming AI Tutor** — Token-by-token Server-Sent-Event streaming with a section-scoped system prompt grounded in the active lecture.
- **pnpm Monorepo Architecture** — `artifacts/qr-course` (React + Vite frontend), `artifacts/api-server` (Express API), `artifacts/qr-course-demo` (demo video), `lib/db` (Drizzle schema + Postgres), and `lib/api-spec` (OpenAPI + codegen).

---

## 🎓 Designed For

- **Curious Readers:** Anyone who wants to understand *why* the mind works the way it does — a short, focused course on the conceptual scaffolding behind human behavior.
- **Students of Psychology & Biology:** Self-paced coverage of the conceptual backbone — adaptation, kin selection, mating strategies, cooperation, and culture — with worked examples and precise-statement practice.
- **Educators & Lecturers:** A connected, example-grounded arc through evolutionary psychology, with built-in practice, grading, and authorship checks for assigned writing.
- **Runtime Maintainers:** A clean exercise of the lecture / tutor / grading / detection stack under a conceptual-precision curriculum, complete with one-click diagnostics.

---

## 💡 Core Idea

Evolutionary Psychology reframes a psychology course as a chain of *explanations*, not a catalogue of findings.

Most courses teach what people do in this experiment or that survey. Far fewer teach the evolutionary logic that explains where those behaviors come from and why they hang together. This course is built around the second list: read the idea, see it grounded in a real example, then state the idea precisely in your own words.

**Evolutionary Psychology — read the idea, ground the idea, state the idea.**
