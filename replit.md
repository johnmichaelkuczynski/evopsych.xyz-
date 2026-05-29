# 🧬 Teach Yourself Evolutionary Psychology

**A Four-Week Course on the Adapted Mind — From Natural Selection to Cooperation, Language, and Culture**

---

## 🧩 Overview

Teach Yourself Evolutionary Psychology is a self-paced, single-user web course that asks the question most psychology classes skip: *why* do we have the minds we do? Why do we fear some things more easily than others? Why do mating preferences differ? Why do we cooperate with strangers, favor kin, feel jealousy, fall for status, and build cultures and religions? The organizing answer is one idea: the mind is a set of information-processing devices — cognitive adaptations — built by natural selection to solve the recurring problems faced by our ancestors.

The runtime — lectures with short / medium / long depth, section-scoped AI tutor, adaptive practice, AI-graded homework / tests / midterm / final, two-layer AI-authorship detection, and one-click diagnostics — supports a single goal: teaching the conceptual backbone of evolutionary psychology — the same backbone that runs through every undergraduate text in the field — presented in one connected arc.

---

## 🧠 What It Does

- **Four-Week Curriculum of 29 Micro-Lectures** — organized by theme:
  - **Week 1 — Foundations of evolutionary psychology**: what the field is and why it exists; natural selection and adaptation; genes, inheritance, and replication; sexual selection; inclusive fitness and kin selection; the adapted, modular mind; levels of explanation and common misunderstandings.
  - **Week 2 — Survival and the evolved individual**: survival and the evolved body; foraging, food, and the evolved palate; fear, predators, and threat detection; habitat preferences and environmental cognition; disease avoidance and the behavioral immune system; life history theory; development and the child mind.
  - **Week 3 — Mating and reproduction**: mating fundamentals; female and male mate preferences; short- and long-term strategies; attraction, beauty, and signals of fitness; jealousy, conflict, and mate retention; parental investment and parenting.
  - **Week 4 — Social life, cooperation, and culture**: kinship and family dynamics; cooperation and reciprocal altruism; aggression, status, and dominance; coalitions, groups, and warfare; language and communication; emotions as evolved programs; culture, religion, and the evolved mind; a capstone synthesis.
- **One Real Example per Lecture** — Every micro-lecture grounds its concept in a worked example from biology, anthropology, history, or experimental psychology — e.g. Hamilton's rule and the evolution of altruism, Trivers' parental-investment theory, the Wason selection task and cheater detection, Cosmides and Tooby's adapted-mind program, snake- and spider-fear preparedness experiments, and Buss's cross-cultural mate-preference surveys.
- **One Analytic Question per Lecture** — Every homework / test / midterm / final problem requires the student to *state the key idea precisely* — sometimes in words, sometimes in symbols (Hamilton's rule $rB > C$, the coefficient of relatedness $r$, parental-investment asymmetries) — not just gesture at it in English. The on-screen math/symbol keyboard remains available for the symbolic answers.
- **Three-Depth Lectures, Section-Scoped Tutor, Adaptive Practice, AI Grading, Two-Layer Detection, One-Click Diagnostics** — The full learning runtime.
- **Built-In Product Demo Video** — The companion `qr-course-demo` artifact still ships as a short screencast of the live UI.

---

## ⚙️ Technical Features

- **Conceptual Answer Harness** — Every problem prompt is structured so the canonical answer is a precise statement of an evolutionary-psychology concept, occasionally a piece of notation (e.g. Hamilton's rule $rB > C$, relatedness $r = 1/2$ for full siblings). Both the prompt rendering (KaTeX) and the answer entry/grading (LaTeX-aware AI grader with numeric short-circuit) handle these cleanly.
- **Two-Layer AI-Authorship Detection** —
  - **Static (GPTZero):** Every submitted answer is sent to GPTZero's `predict/text` endpoint; the per-document AI probability is blended `0.85 × GPTZero + 0.15 × structural-heuristic` for the final score. If GPTZero is unavailable, the system silently falls back to an LLM scorer plus heuristic.
  - **Diachronic (Keystroke Pattern):** The student textarea captures keystroke count, erase count, bulk-insert events, longest bulk insert, rewrite segments, and total duration. A scorer penalizes paste-then-reword behavior, low keystroke-to-output ratios, and impossibly sustained typing speeds.
- **Two Diagnostic Self-Tests** —
  - **System Diagnostic** (`/diagnostics/system`): environment, database round-trip, course-seed integrity, OpenAI chat completion, OpenAI JSON mode, detection pipeline, AI-positive control sample, and GPTZero connectivity.
  - **Synthetic-Student Diagnostic** (`/diagnostics/synthetic-run`): end-to-end stack proof — fake student takes a practice session, takes a full assignment attempt, submits, and verifies grading + detection + analytics all reflect the run.
- **Auto-Reseed on Curriculum Change** — `seedIfEmpty` compares the set of topic slugs in the database to the expected curriculum *and* checks a sentinel phrase in a designated lecture. If either differs, it wipes and re-seeds in dependency order. This is what lets a single content swap propagate cleanly when the seed file changes.
- **Contract-First API** — Single OpenAPI document; React Query hooks for the UI and Zod validators for the server are generated from it.
- **Streaming AI Tutor** — Token-by-token Server-Sent-Event streaming with a section-scoped system prompt grounded in the active lecture.
- **Adaptive Practice Engine** — Per-session difficulty (1–4) adjusts after each attempt; problems are generated on demand.
- **Operator Console** — Dedicated Diagnostics page surfaces both self-tests with one-click execution and raw error output.

---

## 🔐 Required Secrets

- `OPENAI_API_KEY` — required at boot. Powers the tutor, practice generator, AI graders, and lecture-expansion job.
- `GPTZERO_API_KEY` — required for the GPTZero leg of the static-AI-detection layer. If absent, the system falls back to the LLM scorer + heuristic, but you lose the primary detection signal.

Both are requested via the secrets panel; neither is hard-coded.

---

## 🎓 Designed For

- **Anyone Curious About Why the Mind Works the Way It Does:** A short, focused course on the conceptual scaffolding behind human behavior — adaptation, selection, kinship, mating, cooperation, and culture.
- **Anyone Maintaining the Underlying Runtime:** A clean exercise of the lecture / tutor / grading / detection stack under a conceptual-precision curriculum, with answers that lean on precise statements and the occasional symbolic form (Hamilton's rule, relatedness coefficients).

---

## 💡 Core Idea

Most psychology courses teach *findings* — what people do in this experiment or that survey. Far fewer teach the *why* — the evolutionary logic that explains where those behaviors come from and why they hang together. This course is built around the second list.

Read the idea, see it grounded in a real example, then state the idea precisely in your own words.

**Teach Yourself Evolutionary Psychology — read the idea, ground the idea, state the idea.**

---

## User preferences

_(none recorded yet)_
