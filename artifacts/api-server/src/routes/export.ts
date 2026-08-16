import { Router, type IRouter } from "express";
import { asc, eq, inArray } from "drizzle-orm";
import PDFDocument from "pdfkit";
import {
  db,
  topicsTable,
  lecturesTable,
  assignmentsTable,
  problemsTable,
} from "@workspace/db";

const router: IRouter = Router();

const COURSE_TITLE = "Evolutionary Psychology";
const COURSE_SUBTITLE =
  "A Four-Week Course on the Adapted Mind — From Natural Selection to Cooperation, Language, and Culture";

// Light Markdown → plain text cleanup for TXT/PDF output.
function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/```\w*\n?/g, ""))
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .replace(/\[(.+?)\]\((.+?)\)/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

interface ExportSection {
  heading: string;
  blocks: { title: string; body: string }[];
}

async function buildExportSections(): Promise<ExportSection[]> {
  const lectures = await db
    .select()
    .from(lecturesTable)
    .orderBy(asc(lecturesTable.weekNumber), asc(lecturesTable.id));
  const topics = await db
    .select()
    .from(topicsTable)
    .orderBy(asc(topicsTable.position));
  const assignments = await db
    .select()
    .from(assignmentsTable)
    .orderBy(asc(assignmentsTable.weekNumber), asc(assignmentsTable.position));

  const sections: ExportSection[] = [];

  // All 29 lectures (short versions), in course order.
  sections.push({
    heading: "Lectures",
    blocks: lectures.map((l) => ({
      title: l.title,
      body: stripMarkdown(l.body),
    })),
  });

  // A few practice homeworks: the first homework of each week (prompts + hints).
  const sampleHomeworks = [1, 2, 3, 4]
    .map((w) =>
      assignments.find((a) => a.weekNumber === w && a.kind === "homework"),
    )
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  // Exams: week tests, midterm, final (prompts only).
  const exams = assignments.filter((a) =>
    ["test", "midterm", "final"].includes(a.kind),
  );

  const wanted = [...sampleHomeworks, ...exams];
  const wantedIds = wanted.map((a) => a.id);
  const allProblems = wantedIds.length
    ? await db
        .select()
        .from(problemsTable)
        .where(inArray(problemsTable.assignmentId, wantedIds))
        .orderBy(asc(problemsTable.position))
    : [];
  const topicById = new Map(topics.map((t) => [t.id, t.title]));

  function assignmentBlock(a: (typeof wanted)[number]) {
    const probs = allProblems.filter((p) => p.assignmentId === a.id);
    const body = probs
      .map((p, i) => {
        const topic = topicById.get(p.topicId);
        const hint = p.hint ? `\n   Hint: ${stripMarkdown(p.hint)}` : "";
        return `${i + 1}. ${stripMarkdown(p.prompt)}${hint}${topic ? `\n   Topic: ${topic}` : ""}`;
      })
      .join("\n\n");
    return { title: a.title, body: body || "(no problems)" };
  }

  sections.push({
    heading: "Practice Homework",
    blocks: sampleHomeworks.map(assignmentBlock),
  });
  sections.push({
    heading: "Exams",
    blocks: exams.map(assignmentBlock),
  });

  return sections;
}

function sectionsToTxt(sections: ExportSection[]): string {
  const lines: string[] = [
    COURSE_TITLE.toUpperCase(),
    COURSE_SUBTITLE,
    "",
    "=".repeat(72),
  ];
  for (const section of sections) {
    lines.push("", "", section.heading.toUpperCase(), "=".repeat(72));
    for (const block of section.blocks) {
      lines.push("", block.title, "-".repeat(block.title.length), "", block.body);
    }
  }
  return lines.join("\n") + "\n";
}

function sectionsToPdf(sections: ExportSection[]): typeof PDFDocument.prototype {
  const doc = new PDFDocument({
    size: "LETTER",
    margins: { top: 64, bottom: 64, left: 64, right: 64 },
    info: { Title: COURSE_TITLE, Author: COURSE_TITLE },
  });

  doc.font("Times-Bold").fontSize(24).text(COURSE_TITLE, { align: "center" });
  doc.moveDown(0.5);
  doc.font("Times-Italic").fontSize(12).text(COURSE_SUBTITLE, { align: "center" });

  for (const section of sections) {
    doc.addPage();
    doc.font("Times-Bold").fontSize(18).text(section.heading);
    doc.moveDown(0.5);
    for (const block of section.blocks) {
      if (doc.y > doc.page.height - 160) doc.addPage();
      doc.font("Times-Bold").fontSize(13).text(block.title);
      doc.moveDown(0.25);
      doc.font("Times-Roman").fontSize(11).text(block.body, { lineGap: 2 });
      doc.moveDown(1);
    }
  }
  return doc;
}

// Public download of the course: short lectures + sample homework and exams.
router.get("/course/export", async (req, res) => {
  const format = req.query.format === "pdf" ? "pdf" : "txt";
  const sections = await buildExportSections();

  if (format === "txt") {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="evolutionary-psychology-course.txt"',
    );
    res.send(sectionsToTxt(sections));
    return;
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="evolutionary-psychology-course.pdf"',
  );
  const doc = sectionsToPdf(sections);
  doc.pipe(res);
  doc.end();
});

export default router;
