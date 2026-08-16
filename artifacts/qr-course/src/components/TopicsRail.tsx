import { useListTopics } from "@workspace/api-client-react";
import { Download, FileText } from "lucide-react";

// Compact vertical list of every topic in the course, shown top-left on the
// landing page and dashboard. Plain titles only — no week/unit markers.
export function TopicsRail() {
  const { data: topics } = useListTopics();

  return (
    <nav
      aria-label="Topics covered in this course"
      className="w-56 shrink-0 text-left"
      data-testid="topics-rail"
    >
      <h2 className="font-serif font-bold text-base leading-snug mb-1">
        Topics Covered in This Course
      </h2>
      <div className="text-[11px] text-muted-foreground mb-3">
        {topics ? `${topics.length} topics` : "\u00a0"}
      </div>
      <ul className="flex flex-col gap-2">
        {(topics ?? []).map((t) => (
          <li
            key={t.id}
            className="text-xs leading-snug text-muted-foreground"
          >
            {t.title}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-col gap-2">
        <a
          href="/api/course/export?format=pdf"
          className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          data-testid="link-download-pdf"
        >
          <Download className="w-3.5 h-3.5" />
          Download Course (PDF)
        </a>
        <a
          href="/api/course/export?format=txt"
          className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium border border-border hover:bg-secondary transition-colors"
          data-testid="link-download-txt"
        >
          <FileText className="w-3.5 h-3.5" />
          Download as TXT
        </a>
        <p className="text-[10px] text-muted-foreground leading-snug">
          Every lecture (short version) plus practice homework and exam
          problems.
        </p>
      </div>
    </nav>
  );
}
