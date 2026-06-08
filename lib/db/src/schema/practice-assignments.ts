import {
  pgTable,
  serial,
  integer,
  text,
  boolean,
  timestamp,
  jsonb,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { assignmentsTable } from "./course";

// A single generated practice instance of a graded assignment. The user can
// spawn unlimited instances per source assignment; each holds its own fresh,
// non-repeating problem set.
export const practiceAssignmentsTable = pgTable("practice_assignments", {
  id: serial("id").primaryKey(),
  sourceAssignmentId: integer("source_assignment_id")
    .notNull()
    .references(() => assignmentsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  status: text("status").notNull().default("in_progress"), // in_progress | submitted
  scorePercent: doublePrecision("score_percent"),
  readiness: text("readiness"), // surgically-precise pointers narrative (generated at submit)
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
});

export const practiceAssignmentProblemsTable = pgTable("practice_assignment_problems", {
  id: serial("id").primaryKey(),
  practiceAssignmentId: integer("practice_assignment_id")
    .notNull()
    .references(() => practiceAssignmentsTable.id, { onDelete: "cascade" }),
  topicId: integer("topic_id").notNull(),
  position: integer("position").notNull(),
  prompt: text("prompt").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation").notNull(),
  hint: text("hint"),
  concept: text("concept"), // short concept tag used for the evolving profile
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const practiceAssignmentAnswersTable = pgTable("practice_assignment_answers", {
  id: serial("id").primaryKey(),
  practiceAssignmentId: integer("practice_assignment_id")
    .notNull()
    .references(() => practiceAssignmentsTable.id, { onDelete: "cascade" }),
  problemId: integer("problem_id")
    .notNull()
    .references(() => practiceAssignmentProblemsTable.id, { onDelete: "cascade" }),
  answer: text("answer").notNull().default(""),
  correct: boolean("correct"),
  feedback: text("feedback"), // rich per-problem feedback generated at submit
  keystrokeCount: integer("keystroke_count").notNull().default(0),
  eraseCount: integer("erase_count").notNull().default(0),
  bulkInsertCount: integer("bulk_insert_count").notNull().default(0),
  longestBulkInsertChars: integer("longest_bulk_insert_chars").notNull().default(0),
  rewriteSegments: integer("rewrite_segments").notNull().default(0),
  durationMs: integer("duration_ms").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Dialogue threads about feedback. problemId is null for whole-assignment
// conversations, or set to discuss one specific problem's feedback.
export const practiceFeedbackMessagesTable = pgTable("practice_feedback_messages", {
  id: serial("id").primaryKey(),
  practiceAssignmentId: integer("practice_assignment_id")
    .notNull()
    .references(() => practiceAssignmentsTable.id, { onDelete: "cascade" }),
  problemId: integer("problem_id"),
  role: text("role").notNull(), // user | assistant
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Evolving, single-learner profile. Rebuilt from accumulated activity after each
// practice submission and surfaced as targeted study guidance.
export const learnerProfileTable = pgTable("learner_profile", {
  id: serial("id").primaryKey(),
  summary: text("summary").notNull().default(""),
  strengths: jsonb("strengths").notNull().default([]),
  weaknesses: jsonb("weaknesses").notNull().default([]),
  focusAreas: jsonb("focus_areas").notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
