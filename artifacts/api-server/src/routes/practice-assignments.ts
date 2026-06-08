import { Router, type IRouter } from "express";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import {
  db,
  assignmentsTable,
  problemsTable,
  topicsTable,
  practiceAssignmentsTable,
  practiceAssignmentProblemsTable,
  practiceAssignmentAnswersTable,
  practiceFeedbackMessagesTable,
  learnerProfileTable,
} from "@workspace/db";
import {
  GeneratePracticeAssignmentBody,
  GeneratePracticeAssignmentResponse,
  ListPracticeAssignmentsResponse,
  GetPracticeAssignmentResponse,
  SavePracticeAssignmentAnswerBody,
  SavePracticeAssignmentAnswerResponse,
  SubmitPracticeAssignmentResponse,
  GetPracticeFeedbackChatResponse,
  SendPracticeFeedbackChatBody,
  SendPracticeFeedbackChatResponse,
  GetLearnerProfileResponse,
} from "@workspace/api-zod";
import { chatText, chatJson } from "../lib/ai";
import { gradeAnswer } from "../lib/grading";

const router: IRouter = Router();

function parseIdParam(raw: unknown): number {
  const s = Array.isArray(raw) ? raw[0] : (raw as string);
  return parseInt(s ?? "", 10);
}

type Kind = "homework" | "test" | "midterm" | "final";

// Normalize a prompt for duplicate detection: lowercase, strip punctuation,
// collapse whitespace. Two prompts that normalize to the same string are
// treated as the same question and must never both appear.
function normalizePrompt(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

interface GeneratedProblem {
  prompt: string;
  correctAnswer: string;
  explanation: string;
  hint?: string | null;
  concept?: string | null;
}

// ---- Learner profile helpers -------------------------------------------------

interface ProfileShape {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  focusAreas: string[];
  updatedAt: string | null;
}

const EMPTY_PROFILE: ProfileShape = {
  summary: "",
  strengths: [],
  weaknesses: [],
  focusAreas: [],
  updatedAt: null,
};

async function readProfile(): Promise<ProfileShape> {
  const [row] = await db
    .select()
    .from(learnerProfileTable)
    .orderBy(asc(learnerProfileTable.id))
    .limit(1);
  if (!row) return EMPTY_PROFILE;
  return {
    summary: row.summary,
    strengths: (row.strengths as string[]) ?? [],
    weaknesses: (row.weaknesses as string[]) ?? [],
    focusAreas: (row.focusAreas as string[]) ?? [],
    updatedAt: row.updatedAt?.toISOString() ?? null,
  };
}

async function writeProfile(p: {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  focusAreas: string[];
}): Promise<ProfileShape> {
  const [existing] = await db
    .select()
    .from(learnerProfileTable)
    .orderBy(asc(learnerProfileTable.id))
    .limit(1);
  const values = {
    summary: p.summary,
    strengths: p.strengths,
    weaknesses: p.weaknesses,
    focusAreas: p.focusAreas,
    updatedAt: new Date(),
  };
  let saved;
  if (existing) {
    [saved] = await db
      .update(learnerProfileTable)
      .set(values)
      .where(eq(learnerProfileTable.id, existing.id))
      .returning();
  } else {
    [saved] = await db.insert(learnerProfileTable).values(values).returning();
  }
  return {
    summary: saved!.summary,
    strengths: (saved!.strengths as string[]) ?? [],
    weaknesses: (saved!.weaknesses as string[]) ?? [],
    focusAreas: (saved!.focusAreas as string[]) ?? [],
    updatedAt: saved!.updatedAt?.toISOString() ?? null,
  };
}

// Recompute the evolving learner profile from ALL graded practice answers.
async function rebuildProfile(): Promise<ProfileShape> {
  const rows = await db
    .select({
      correct: practiceAssignmentAnswersTable.correct,
      concept: practiceAssignmentProblemsTable.concept,
      topicId: practiceAssignmentProblemsTable.topicId,
    })
    .from(practiceAssignmentAnswersTable)
    .innerJoin(
      practiceAssignmentProblemsTable,
      eq(practiceAssignmentAnswersTable.problemId, practiceAssignmentProblemsTable.id),
    )
    .innerJoin(
      practiceAssignmentsTable,
      eq(practiceAssignmentAnswersTable.practiceAssignmentId, practiceAssignmentsTable.id),
    )
    .where(eq(practiceAssignmentsTable.status, "submitted"));

  // Aggregate accuracy per concept/topic.
  const topics = await db.select().from(topicsTable);
  const topicTitle = new Map(topics.map((t) => [t.id, t.title]));

  const byConcept = new Map<string, { n: number; correct: number }>();
  for (const r of rows) {
    if (r.correct == null) continue;
    const key = (r.concept && r.concept.trim()) || topicTitle.get(r.topicId) || "general";
    const cur = byConcept.get(key) ?? { n: 0, correct: 0 };
    cur.n += 1;
    if (r.correct) cur.correct += 1;
    byConcept.set(key, cur);
  }

  const stats = [...byConcept.entries()].map(([concept, v]) => ({
    concept,
    attempts: v.n,
    accuracy: v.n ? v.correct / v.n : 0,
  }));

  if (stats.length === 0) {
    return writeProfile({
      summary:
        "No graded practice yet. Generate a practice set and submit it to start building your learner profile.",
      strengths: [],
      weaknesses: [],
      focusAreas: [],
    });
  }

  try {
    const out = await chatJson<{
      summary: string;
      strengths: string[];
      weaknesses: string[];
      focusAreas: string[];
    }>(
      'You maintain an evolving learner profile for a student of evolutionary psychology. Given per-concept practice accuracy stats, write a concise profile. Respond as STRICT JSON: {"summary": string, "strengths": string[], "weaknesses": string[], "focusAreas": string[]}. summary = 2-3 sentences describing the learner\'s current command of the material. strengths/weaknesses = concept names the learner is strong/weak on (at most 5 each). focusAreas = 3-5 specific, actionable study pointers naming the exact concept and what to do. Be surgical and concrete; never generic.',
      JSON.stringify({ conceptStats: stats }),
    );
    return writeProfile({
      summary: out.summary || "",
      strengths: Array.isArray(out.strengths) ? out.strengths.slice(0, 5) : [],
      weaknesses: Array.isArray(out.weaknesses) ? out.weaknesses.slice(0, 5) : [],
      focusAreas: Array.isArray(out.focusAreas) ? out.focusAreas.slice(0, 5) : [],
    });
  } catch {
    const sorted = [...stats].sort((a, b) => a.accuracy - b.accuracy);
    const weak = sorted.filter((s) => s.accuracy < 0.6).map((s) => s.concept).slice(0, 5);
    const strong = sorted
      .filter((s) => s.accuracy >= 0.8)
      .map((s) => s.concept)
      .slice(0, 5);
    return writeProfile({
      summary:
        "Profile based on your practice accuracy across concepts. Keep practicing the weaker areas to raise your readiness.",
      strengths: strong,
      weaknesses: weak,
      focusAreas: weak.map((c) => `Re-study "${c}" and practice stating its core idea precisely.`),
    });
  }
}

// ---- Generation --------------------------------------------------------------

router.post("/practice-assignments", async (req, res): Promise<void> => {
  const parsed = GeneratePracticeAssignmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { sourceAssignmentId } = parsed.data;

  const [source] = await db
    .select()
    .from(assignmentsTable)
    .where(eq(assignmentsTable.id, sourceAssignmentId));
  if (!source) {
    res.status(404).json({ error: "source assignment not found" });
    return;
  }

  // The real graded problems — their topic mix defines the practice structure,
  // and their prompts must NEVER be reused.
  const realProblems = await db
    .select({
      position: problemsTable.position,
      prompt: problemsTable.prompt,
      topicId: problemsTable.topicId,
      topicTitle: topicsTable.title,
    })
    .from(problemsTable)
    .leftJoin(topicsTable, eq(problemsTable.topicId, topicsTable.id))
    .where(eq(problemsTable.assignmentId, sourceAssignmentId))
    .orderBy(asc(problemsTable.position));

  if (realProblems.length === 0) {
    res.status(400).json({ error: "source assignment has no problems" });
    return;
  }

  // All prompts ever generated for prior practice versions of this assignment,
  // so we never repeat a question.
  const priorSets = await db
    .select({ id: practiceAssignmentsTable.id })
    .from(practiceAssignmentsTable)
    .where(eq(practiceAssignmentsTable.sourceAssignmentId, sourceAssignmentId));
  const priorSetIds = priorSets.map((s) => s.id);
  const priorPrompts: string[] = [];
  if (priorSetIds.length > 0) {
    const rows = await db
      .select({ prompt: practiceAssignmentProblemsTable.prompt })
      .from(practiceAssignmentProblemsTable)
      .where(inArray(practiceAssignmentProblemsTable.practiceAssignmentId, priorSetIds))
      .orderBy(desc(practiceAssignmentProblemsTable.id));
    for (const r of rows) priorPrompts.push(r.prompt);
  }

  const blueprint = realProblems.map((p, i) => ({
    position: i + 1,
    topicTitle: p.topicTitle ?? "evolutionary psychology",
    topicId: p.topicId,
  }));
  const forbiddenPrompts = [...realProblems.map((p) => p.prompt), ...priorPrompts];
  // Set of every prompt (real + all prior practice) that must never be reused,
  // keyed by normalized form so trivial rephrasings of byte-identical text collide.
  const forbiddenNorm = new Set(forbiddenPrompts.map(normalizePrompt));

  async function generateBatch(extraForbidden: string[]): Promise<GeneratedProblem[]> {
    try {
      const out = await chatJson<{ problems: GeneratedProblem[] }>(
        `You generate a fresh PRACTICE version of a graded evolutionary-psychology ${source.kind}. Produce EXACTLY ${blueprint.length} problems, one per blueprint slot, on the same topic as that slot and of comparable difficulty. Each practice problem must (a) be brand-new, (b) NOT duplicate or trivially rephrase any forbidden prompt, and (c) require the student to state an evolutionary-psychology concept precisely (a term, mechanism, theory, researcher, relationship, or a short numeric/symbolic answer such as Hamilton's rule $rB > C$ or a coefficient of relatedness). Use $...$ for any inline LaTeX. correctAnswer must be a SHORT string. Respond as STRICT JSON: {"problems": [{"prompt": string, "correctAnswer": string, "explanation": string, "hint": string, "concept": string}]}. "concept" is a 2-4 word tag naming the precise idea tested (used for analytics). "explanation" is 1-3 sentences. Keep the order aligned to the blueprint.`,
        JSON.stringify({
          kind: source.kind,
          blueprint: blueprint.map((b) => ({ position: b.position, topic: b.topicTitle })),
          forbiddenPrompts: [...forbiddenPrompts, ...extraForbidden],
        }),
      );
      return Array.isArray(out?.problems) ? out.problems : [];
    } catch {
      return [];
    }
  }

  function fallbackProblem(b: (typeof blueprint)[number]): GeneratedProblem {
    return {
      prompt: `Practice (${b.topicTitle}): State the central idea of "${b.topicTitle}" precisely, in one sentence, and name the mechanism or principle it depends on.`,
      correctAnswer: `A precise one-sentence statement of the core concept of "${b.topicTitle}".`,
      explanation: `Re-read the lecture for "${b.topicTitle}" and state its key concept in your own words, connecting it to adaptive function or natural selection.`,
      hint: `Focus on what problem "${b.topicTitle}" solved for our ancestors.`,
      concept: b.topicTitle,
    };
  }

  // Resolve each blueprint slot to a prompt that is non-empty AND unique against
  // the forbidden set (real + prior) and against the other slots in THIS set.
  // Retry generation up to twice, feeding any colliding prompts back as forbidden,
  // then guarantee uniqueness deterministically as a last resort.
  const seenNorm = new Set<string>();
  const resolved: Array<GeneratedProblem & { topicId: number; position: number }> = new Array(
    blueprint.length,
  );
  let generated: GeneratedProblem[] = [];
  const colliding: string[] = [];
  for (let attempt = 0; attempt < 2; attempt++) {
    generated = await generateBatch(colliding);
    for (let i = 0; i < blueprint.length; i++) {
      if (resolved[i]) continue;
      const b = blueprint[i]!;
      const g = generated[i];
      const prompt = typeof g?.prompt === "string" ? g.prompt.trim() : "";
      if (!prompt) continue;
      const norm = normalizePrompt(prompt);
      if (forbiddenNorm.has(norm) || seenNorm.has(norm)) {
        colliding.push(prompt);
        continue;
      }
      seenNorm.add(norm);
      resolved[i] = {
        prompt,
        correctAnswer: (g!.correctAnswer ?? "").toString(),
        explanation: (g!.explanation ?? "").toString(),
        hint: g!.hint ?? null,
        concept: g!.concept ?? b.topicTitle,
        topicId: b.topicId,
        position: b.position,
      };
    }
    if (resolved.every(Boolean)) break;
  }

  // Any slot still unresolved gets a deterministic fallback, made unique with a
  // disambiguating suffix if even the fallback would collide.
  const versionNumber = priorSetIds.length + 1;
  const finalProblems = blueprint.map((b, i) => {
    if (resolved[i]) return resolved[i]!;
    const fb = fallbackProblem(b);
    let prompt = fb.prompt;
    let norm = normalizePrompt(prompt);
    if (forbiddenNorm.has(norm) || seenNorm.has(norm)) {
      prompt = `${fb.prompt} (practice set #${versionNumber}, item ${b.position})`;
      norm = normalizePrompt(prompt);
    }
    seenNorm.add(norm);
    return {
      prompt,
      correctAnswer: fb.correctAnswer,
      explanation: fb.explanation,
      hint: fb.hint ?? null,
      concept: fb.concept ?? b.topicTitle,
      topicId: b.topicId,
      position: b.position,
    };
  });

  const [created] = await db
    .insert(practiceAssignmentsTable)
    .values({
      sourceAssignmentId,
      title: `Practice · ${source.title} #${versionNumber}`,
      status: "in_progress",
    })
    .returning();
  if (!created) {
    res.status(500).json({ error: "failed to create practice assignment" });
    return;
  }

  await db.insert(practiceAssignmentProblemsTable).values(
    finalProblems.map((p) => ({
      practiceAssignmentId: created.id,
      topicId: p.topicId,
      position: p.position,
      prompt: p.prompt,
      correctAnswer: p.correctAnswer,
      explanation: p.explanation,
      hint: p.hint,
      concept: p.concept,
    })),
  );

  const detail = await loadDetail(created.id);
  res.json(GeneratePracticeAssignmentResponse.parse(detail));
});

// ---- Load detail -------------------------------------------------------------

async function loadDetail(id: number) {
  const [pa] = await db
    .select()
    .from(practiceAssignmentsTable)
    .where(eq(practiceAssignmentsTable.id, id));
  if (!pa) return null;

  const [source] = await db
    .select()
    .from(assignmentsTable)
    .where(eq(assignmentsTable.id, pa.sourceAssignmentId));

  const problems = await db
    .select({
      id: practiceAssignmentProblemsTable.id,
      position: practiceAssignmentProblemsTable.position,
      prompt: practiceAssignmentProblemsTable.prompt,
      topicId: practiceAssignmentProblemsTable.topicId,
      topicTitle: topicsTable.title,
      hint: practiceAssignmentProblemsTable.hint,
      correctAnswer: practiceAssignmentProblemsTable.correctAnswer,
      explanation: practiceAssignmentProblemsTable.explanation,
    })
    .from(practiceAssignmentProblemsTable)
    .leftJoin(topicsTable, eq(practiceAssignmentProblemsTable.topicId, topicsTable.id))
    .where(eq(practiceAssignmentProblemsTable.practiceAssignmentId, id))
    .orderBy(asc(practiceAssignmentProblemsTable.position));

  const answers = await db
    .select()
    .from(practiceAssignmentAnswersTable)
    .where(eq(practiceAssignmentAnswersTable.practiceAssignmentId, id));
  const byProblem = new Map(answers.map((a) => [a.problemId, a]));

  const submitted = pa.status === "submitted";

  return {
    id: pa.id,
    sourceAssignmentId: pa.sourceAssignmentId,
    sourceTitle: source?.title ?? "Assignment",
    kind: (source?.kind ?? "homework") as Kind,
    title: pa.title,
    weekNumber: source?.weekNumber ?? null,
    status: pa.status as "in_progress" | "submitted",
    scorePercent: pa.scorePercent ?? null,
    readiness: pa.readiness ?? null,
    problems: problems.map((p) => ({
      id: p.id,
      position: p.position,
      prompt: p.prompt,
      topicId: p.topicId,
      topicTitle: p.topicTitle,
      hint: p.hint,
    })),
    answers: problems.map((p) => {
      const a = byProblem.get(p.id);
      return {
        problemId: p.id,
        answer: a?.answer ?? "",
        correct: a?.correct ?? null,
        feedback: submitted ? a?.feedback ?? null : null,
        correctAnswer: submitted ? p.correctAnswer : null,
        explanation: submitted ? p.explanation : null,
      };
    }),
  };
}

router.get("/practice-assignments", async (req, res): Promise<void> => {
  const sourceAssignmentId = parseIdParam(req.query.sourceAssignmentId);
  if (!Number.isFinite(sourceAssignmentId)) {
    res.status(400).json({ error: "invalid sourceAssignmentId" });
    return;
  }
  const sets = await db
    .select()
    .from(practiceAssignmentsTable)
    .where(eq(practiceAssignmentsTable.sourceAssignmentId, sourceAssignmentId))
    .orderBy(desc(practiceAssignmentsTable.id));

  const result = await Promise.all(
    sets.map(async (s) => {
      const probs = await db
        .select({ id: practiceAssignmentProblemsTable.id })
        .from(practiceAssignmentProblemsTable)
        .where(eq(practiceAssignmentProblemsTable.practiceAssignmentId, s.id));
      return {
        id: s.id,
        sourceAssignmentId: s.sourceAssignmentId,
        title: s.title,
        status: s.status as "in_progress" | "submitted",
        scorePercent: s.scorePercent ?? null,
        problemCount: probs.length,
        createdAt: s.createdAt.toISOString(),
        submittedAt: s.submittedAt?.toISOString() ?? null,
      };
    }),
  );
  res.json(ListPracticeAssignmentsResponse.parse(result));
});

router.get("/practice-assignments/:id", async (req, res): Promise<void> => {
  const id = parseIdParam(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const detail = await loadDetail(id);
  if (!detail) {
    res.status(404).json({ error: "practice assignment not found" });
    return;
  }
  res.json(GetPracticeAssignmentResponse.parse(detail));
});

router.put(
  "/practice-assignments/:id/answers/:problemId",
  async (req, res): Promise<void> => {
    const id = parseIdParam(req.params.id);
    const problemId = parseIdParam(req.params.problemId);
    if (!Number.isFinite(id) || !Number.isFinite(problemId)) {
      res.status(400).json({ error: "invalid id" });
      return;
    }
    const parsed = SavePracticeAssignmentAnswerBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const { answer, trace } = parsed.data;

    const [pa] = await db
      .select()
      .from(practiceAssignmentsTable)
      .where(eq(practiceAssignmentsTable.id, id));
    if (!pa) {
      res.status(404).json({ error: "practice assignment not found" });
      return;
    }
    if (pa.status !== "in_progress") {
      res.status(400).json({ error: "practice assignment already submitted" });
      return;
    }
    const [problem] = await db
      .select()
      .from(practiceAssignmentProblemsTable)
      .where(
        and(
          eq(practiceAssignmentProblemsTable.id, problemId),
          eq(practiceAssignmentProblemsTable.practiceAssignmentId, id),
        ),
      );
    if (!problem) {
      res.status(404).json({ error: "problem not found in this practice assignment" });
      return;
    }

    const [existing] = await db
      .select()
      .from(practiceAssignmentAnswersTable)
      .where(
        and(
          eq(practiceAssignmentAnswersTable.practiceAssignmentId, id),
          eq(practiceAssignmentAnswersTable.problemId, problemId),
        ),
      );
    const values = {
      practiceAssignmentId: id,
      problemId,
      answer,
      keystrokeCount: trace.keystrokeCount,
      eraseCount: trace.eraseCount,
      bulkInsertCount: trace.bulkInsertCount ?? 0,
      longestBulkInsertChars: trace.longestBulkInsertChars ?? 0,
      rewriteSegments: trace.rewriteSegments ?? 0,
      durationMs: trace.durationMs,
      updatedAt: new Date(),
    };
    if (existing) {
      await db
        .update(practiceAssignmentAnswersTable)
        .set(values)
        .where(eq(practiceAssignmentAnswersTable.id, existing.id));
    } else {
      await db.insert(practiceAssignmentAnswersTable).values(values);
    }
    res.json(SavePracticeAssignmentAnswerResponse.parse({ ok: true }));
  },
);

router.post("/practice-assignments/:id/submit", async (req, res): Promise<void> => {
  const id = parseIdParam(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const [pa] = await db
    .select()
    .from(practiceAssignmentsTable)
    .where(eq(practiceAssignmentsTable.id, id));
  if (!pa) {
    res.status(404).json({ error: "practice assignment not found" });
    return;
  }

  // Idempotency: an already-submitted set must not be regraded. Return the
  // persisted result (grades, feedback, readiness, profile) as-is.
  if (pa.status === "submitted") {
    const detail = await loadDetail(id);
    const profile = await readProfile();
    const total = detail?.problems.length ?? 0;
    const score = (detail?.answers ?? []).filter((a) => a.correct === true).length;
    res.json(
      SubmitPracticeAssignmentResponse.parse({
        id,
        score,
        total,
        percent: pa.scorePercent ?? 0,
        perProblem: (detail?.problems ?? []).map((p) => {
          const a = (detail?.answers ?? []).find((x) => x.problemId === p.id);
          return {
            problemId: p.id,
            correct: a?.correct ?? false,
            userAnswer: a?.answer ?? "",
            correctAnswer: a?.correctAnswer ?? "",
            explanation: a?.explanation ?? "",
            feedback: a?.feedback ?? "",
          };
        }),
        readiness: pa.readiness ?? "",
        profile,
      }),
    );
    return;
  }

  const problems = await db
    .select({
      id: practiceAssignmentProblemsTable.id,
      position: practiceAssignmentProblemsTable.position,
      prompt: practiceAssignmentProblemsTable.prompt,
      correctAnswer: practiceAssignmentProblemsTable.correctAnswer,
      explanation: practiceAssignmentProblemsTable.explanation,
      concept: practiceAssignmentProblemsTable.concept,
      topicId: practiceAssignmentProblemsTable.topicId,
      topicTitle: topicsTable.title,
    })
    .from(practiceAssignmentProblemsTable)
    .leftJoin(topicsTable, eq(practiceAssignmentProblemsTable.topicId, topicsTable.id))
    .where(eq(practiceAssignmentProblemsTable.practiceAssignmentId, id))
    .orderBy(asc(practiceAssignmentProblemsTable.position));

  const answers = await db
    .select()
    .from(practiceAssignmentAnswersTable)
    .where(eq(practiceAssignmentAnswersTable.practiceAssignmentId, id));
  const byProblem = new Map(answers.map((a) => [a.problemId, a]));

  // Grade each problem.
  const graded = await Promise.all(
    problems.map(async (p) => {
      const a = byProblem.get(p.id);
      const userAnswer = a?.answer ?? "";
      const g = await gradeAnswer({
        prompt: p.prompt,
        correctAnswer: p.correctAnswer,
        userAnswer,
      });
      return { p, a, userAnswer, correct: g.correct, baseExplanation: g.explanation || p.explanation };
    }),
  );

  // Rich, per-problem feedback in a single batched call.
  let feedbackByIndex: string[] = [];
  try {
    const out = await chatJson<{ feedback: string[] }>(
      'You are a warm, exacting evolutionary-psychology coach giving feedback on a practice attempt. For EACH item, write 2-4 sentences of rich, specific feedback: name exactly what the student got right or wrong, correct the precise misconception, restate the key idea crisply, and give one concrete way to remember or apply it. Use $...$ for any math. Respond as STRICT JSON: {"feedback": string[]} with one string per item, in the same order.',
      JSON.stringify({
        items: graded.map((g) => ({
          prompt: g.p.prompt,
          concept: g.p.concept,
          correctAnswer: g.p.correctAnswer,
          studentAnswer: g.userAnswer,
          correct: g.correct,
        })),
      }),
    );
    if (Array.isArray(out?.feedback)) feedbackByIndex = out.feedback;
  } catch {
    feedbackByIndex = [];
  }

  let score = 0;
  const perProblem = [];
  for (let i = 0; i < graded.length; i++) {
    const g = graded[i]!;
    if (g.correct) score += 1;
    const feedback =
      (typeof feedbackByIndex[i] === "string" && feedbackByIndex[i]!.trim()) ||
      g.baseExplanation;

    // Persist grade + feedback (and any captured keystroke trace already saved).
    if (g.a) {
      await db
        .update(practiceAssignmentAnswersTable)
        .set({ correct: g.correct, feedback })
        .where(eq(practiceAssignmentAnswersTable.id, g.a.id));
    } else {
      await db.insert(practiceAssignmentAnswersTable).values({
        practiceAssignmentId: id,
        problemId: g.p.id,
        answer: "",
        correct: g.correct,
        feedback,
      });
    }

    perProblem.push({
      problemId: g.p.id,
      correct: g.correct,
      userAnswer: g.userAnswer,
      correctAnswer: g.p.correctAnswer,
      explanation: g.baseExplanation,
      feedback,
    });
  }

  const total = problems.length;
  const percent = total === 0 ? 0 : (score / total) * 100;

  // Surgically precise, analytics-based readiness pointers for the real version.
  let readiness = "";
  try {
    const out = await chatJson<{ readiness: string }>(
      'You write a short "readiness" briefing that tells a student exactly what to fix before taking the REAL graded version of this assignment. Be surgical: cite the specific concepts they missed and the exact next action for each, then end with one sentence on whether they look ready. Use Markdown with a short intro line and a bullet list. Use $...$ for math. Respond as STRICT JSON: {"readiness": string}.',
      JSON.stringify({
        scorePercent: Math.round(percent),
        results: graded.map((g) => ({
          concept: g.p.concept ?? g.p.topicTitle,
          topic: g.p.topicTitle,
          correct: g.correct,
        })),
      }),
    );
    readiness = out.readiness ?? "";
  } catch {
    const missed = graded.filter((g) => !g.correct).map((g) => g.p.concept ?? g.p.topicTitle);
    readiness =
      missed.length === 0
        ? `You scored ${Math.round(percent)}%. You look ready — consider one more practice set to lock it in.`
        : `You scored ${Math.round(percent)}%. Before the graded version, focus on:\n\n${missed
            .map((c) => `- **${c}** — re-read the lecture and practice stating the idea precisely.`)
            .join("\n")}`;
  }

  await db
    .update(practiceAssignmentsTable)
    .set({
      status: "submitted",
      submittedAt: new Date(),
      scorePercent: percent,
      readiness,
    })
    .where(eq(practiceAssignmentsTable.id, id));

  const profile = await rebuildProfile();

  res.json(
    SubmitPracticeAssignmentResponse.parse({
      id,
      score,
      total,
      percent,
      perProblem,
      readiness,
      profile,
    }),
  );
});

// ---- Feedback dialogue -------------------------------------------------------

router.get(
  "/practice-assignments/:id/feedback-chat",
  async (req, res): Promise<void> => {
    const id = parseIdParam(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "invalid id" });
      return;
    }
    const msgs = await db
      .select()
      .from(practiceFeedbackMessagesTable)
      .where(eq(practiceFeedbackMessagesTable.practiceAssignmentId, id))
      .orderBy(asc(practiceFeedbackMessagesTable.id));
    res.json(
      GetPracticeFeedbackChatResponse.parse(
        msgs.map((m) => ({
          id: m.id,
          problemId: m.problemId ?? null,
          role: m.role as "user" | "assistant",
          content: m.content,
          createdAt: m.createdAt.toISOString(),
        })),
      ),
    );
  },
);

router.post(
  "/practice-assignments/:id/feedback-chat",
  async (req, res): Promise<void> => {
    const id = parseIdParam(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "invalid id" });
      return;
    }
    const parsed = SendPracticeFeedbackChatBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const { problemId, message } = parsed.data;

    const [pa] = await db
      .select()
      .from(practiceAssignmentsTable)
      .where(eq(practiceAssignmentsTable.id, id));
    if (!pa) {
      res.status(404).json({ error: "practice assignment not found" });
      return;
    }

    // Context: the specific problem (if any) and its feedback.
    let problemContext = "";
    if (problemId != null) {
      const [p] = await db
        .select()
        .from(practiceAssignmentProblemsTable)
        .where(
          and(
            eq(practiceAssignmentProblemsTable.id, problemId),
            eq(practiceAssignmentProblemsTable.practiceAssignmentId, id),
          ),
        );
      if (p) {
        const [a] = await db
          .select()
          .from(practiceAssignmentAnswersTable)
          .where(
            and(
              eq(practiceAssignmentAnswersTable.practiceAssignmentId, id),
              eq(practiceAssignmentAnswersTable.problemId, problemId),
            ),
          );
        problemContext =
          `PROBLEM: ${p.prompt}\n` +
          `CORRECT ANSWER: ${p.correctAnswer}\n` +
          `STUDENT ANSWER: ${a?.answer ?? "(blank)"}\n` +
          `FEEDBACK ALREADY GIVEN: ${a?.feedback ?? "(none)"}\n`;
      }
    }

    // Prior thread for this scope.
    const allMsgs = await db
      .select()
      .from(practiceFeedbackMessagesTable)
      .where(eq(practiceFeedbackMessagesTable.practiceAssignmentId, id))
      .orderBy(asc(practiceFeedbackMessagesTable.id));
    const scoped = allMsgs.filter((m) => (m.problemId ?? null) === (problemId ?? null));
    const transcript = scoped
      .map((m) => `${m.role === "user" ? "Student" : "Tutor"}: ${m.content}`)
      .join("\n");

    await db.insert(practiceFeedbackMessagesTable).values({
      practiceAssignmentId: id,
      problemId: problemId ?? null,
      role: "user",
      content: message,
    });

    const sys =
      "You are an encouraging, precise evolutionary-psychology tutor helping a student understand feedback on a PRACTICE problem they just did. Answer their follow-up directly and concretely, ground ideas in the evolutionary logic and a quick example, and write any math as $...$ (LaTeX). Keep it to 2-5 sentences unless they ask for more.";
    const user =
      (problemContext ? `${problemContext}\n` : "") +
      (transcript ? `Conversation so far:\n${transcript}\n\n` : "") +
      `Student's new message: ${message}`;

    let reply = "";
    try {
      reply = await chatText(sys, user);
    } catch {
      reply =
        "I'm having trouble reaching the tutor service right now. Try again in a moment.";
    }

    await db.insert(practiceFeedbackMessagesTable).values({
      practiceAssignmentId: id,
      problemId: problemId ?? null,
      role: "assistant",
      content: reply,
    });

    const updated = await db
      .select()
      .from(practiceFeedbackMessagesTable)
      .where(eq(practiceFeedbackMessagesTable.practiceAssignmentId, id))
      .orderBy(asc(practiceFeedbackMessagesTable.id));
    const updatedScoped = updated.filter(
      (m) => (m.problemId ?? null) === (problemId ?? null),
    );

    res.json(
      SendPracticeFeedbackChatResponse.parse({
        messages: updatedScoped.map((m) => ({
          id: m.id,
          problemId: m.problemId ?? null,
          role: m.role as "user" | "assistant",
          content: m.content,
          createdAt: m.createdAt.toISOString(),
        })),
      }),
    );
  },
);

// ---- Learner profile ---------------------------------------------------------

router.get("/learner-profile", async (_req, res): Promise<void> => {
  const profile = await readProfile();
  res.json(GetLearnerProfileResponse.parse(profile));
});

export default router;
