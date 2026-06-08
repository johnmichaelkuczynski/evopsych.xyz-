import { useEffect, useMemo, useRef, useState } from "react";
import {
  useGetLecture,
  useStartPracticeSession,
  useNextPracticeProblem,
  useGradePracticeAnswer,
  type PracticeProblem,
  type PracticeGrade,
  type KeystrokeTrace,
} from "@workspace/api-client-react";
import { Layout } from "@/components/layout/Layout";
import { useParams, Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { AnswerInput } from "@/components/AnswerInput";
import { TutorPane } from "@/components/TutorPane";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare, Sparkles, X, RefreshCw, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function LectureView() {
  const params = useParams();
  const lectureId = Number(params.lectureId);
  const { data: lecture, isLoading, refetch } = useGetLecture(lectureId);

  // shared selected-text state (used by both Tutor and Practice)
  const [selectedText, setSelectedText] = useState("");
  const articleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onSelect() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) return;
      const text = sel.toString().trim();
      if (!text) return;
      // only capture selections that are inside the article
      if (!articleRef.current) return;
      const anchor = sel.anchorNode;
      if (anchor && articleRef.current.contains(anchor)) {
        setSelectedText(text.slice(0, 800));
      }
    }
    document.addEventListener("mouseup", onSelect);
    document.addEventListener("keyup", onSelect);
    return () => {
      document.removeEventListener("mouseup", onSelect);
      document.removeEventListener("keyup", onSelect);
    };
  }, []);

  const [tab, setTab] = useState<"tutor" | "practice">("tutor");
  const [level, setLevel] = useState<"short" | "medium" | "long">("short");
  const [generatingLevel, setGeneratingLevel] = useState<
    "medium" | "long" | null
  >(null);
  const [genError, setGenError] = useState<string | null>(null);

  // wouter reuses this component across /lectures/:id, so an in-flight generation
  // can outlive a navigation. Track the current id in a ref to detect that.
  const lectureIdRef = useRef(lectureId);
  lectureIdRef.current = lectureId;

  function hasLevel(lvl: "short" | "medium" | "long"): boolean {
    if (lvl === "short") return true;
    if (lvl === "medium") return !!lecture?.bodyMedium;
    return !!lecture?.bodyLong;
  }

  async function selectLevel(lvl: "short" | "medium" | "long") {
    if (lvl === "short" || hasLevel(lvl)) {
      setLevel(lvl);
      return;
    }
    if (generatingLevel) return;
    const requestedId = lectureId;
    setGeneratingLevel(lvl);
    setGenError(null);
    try {
      const res = await fetch(
        `/api/diagnostics/expand-lectures?level=${lvl}&id=${requestedId}`,
        { method: "POST" },
      );
      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { updated?: number; failed?: number };
      if (!data.updated)
        throw new Error("Generation didn't return content — please try again.");
      const refreshed = await refetch();
      // The user may have navigated to a different lecture while we waited.
      if (requestedId !== lectureIdRef.current) return;
      const body =
        lvl === "medium"
          ? refreshed.data?.bodyMedium
          : refreshed.data?.bodyLong;
      if (!body)
        throw new Error("Generated content didn't load — please try again.");
      setLevel(lvl);
    } catch (e) {
      if (requestedId !== lectureIdRef.current) return;
      setGenError(
        `Couldn't generate the ${lvl} version: ${(e as Error).message}`,
      );
    } finally {
      setGeneratingLevel((cur) => (requestedId === lectureIdRef.current ? null : cur));
    }
  }

  const activeBody =
    level === "long" && lecture?.bodyLong
      ? lecture.bodyLong
      : level === "medium" && lecture?.bodyMedium
        ? lecture.bodyMedium
        : (lecture?.body ?? "");

  return (
    <Layout>
      <div className="px-6 pt-4 pb-2">
        <Link href={lecture ? `/weeks/${lecture.weekNumber}` : "/"}>
          <Button variant="ghost" className="-ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Week {lecture?.weekNumber ?? ""}
          </Button>
        </Link>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-0">
        {/* LEFT: lecture */}
        <div className="overflow-y-auto px-8 pb-16 border-r border-border">
          {isLoading ? (
            <div className="flex flex-col gap-6 mt-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : lecture ? (
            <article>
              <header className="mb-6 mt-2">
                <h1 className="text-3xl font-serif font-bold text-primary mb-3 leading-tight">
                  {lecture.title}
                </h1>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Week {lecture.weekNumber}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="inline-flex rounded-md border border-border overflow-hidden text-xs">
                      {(["short", "medium", "long"] as const).map((lvl) => {
                        const exists = hasLevel(lvl);
                        const active = level === lvl;
                        const isGenerating = generatingLevel === lvl;
                        const anyGenerating = generatingLevel !== null;
                        return (
                          <button
                            key={lvl}
                            onClick={() => selectLevel(lvl)}
                            disabled={anyGenerating}
                            title={
                              exists
                                ? `${lvl[0].toUpperCase() + lvl.slice(1)} version`
                                : `Generate the ${lvl} version of this lecture`
                            }
                            className={`inline-flex items-center gap-1 px-3 py-1.5 font-medium uppercase tracking-wider transition-colors ${
                              active
                                ? "bg-primary text-primary-foreground"
                                : "bg-background hover:bg-secondary text-foreground"
                            } ${anyGenerating ? "opacity-70" : ""}`}
                            data-testid={`button-level-${lvl}`}
                          >
                            {isGenerating ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              !exists && <Sparkles className="w-3 h-3" />
                            )}
                            {lvl}
                          </button>
                        );
                      })}
                    </div>
                    {generatingLevel && (
                      <span className="text-[11px] text-muted-foreground">
                        Generating the {generatingLevel} version of this lecture…
                      </span>
                    )}
                    {genError && !generatingLevel && (
                      <span className="text-[11px] text-red-600 max-w-xs text-right">
                        {genError}
                      </span>
                    )}
                  </div>
                </div>
              </header>
              <div className="bg-card border shadow-sm rounded-lg p-6 md:p-8" ref={articleRef}>
                <MarkdownRenderer content={activeBody} />
                <div className="mt-6 pt-4 border-t border-dashed border-border text-xs text-muted-foreground italic">
                  Tip: highlight any passage above to ask the tutor about it, or to generate practice problems specifically on what you selected.
                </div>
              </div>
            </article>
          ) : (
            <div className="mt-8">Lecture not found.</div>
          )}
        </div>

        {/* RIGHT: practice + tutor */}
        <div className="flex flex-col min-h-0 bg-secondary/20">
          <div className="flex items-center justify-between border-b border-border bg-background px-4 py-2">
            <div className="flex gap-1">
              <button
                onClick={() => setTab("tutor")}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${
                  tab === "tutor" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                }`}
                data-testid="tab-tutor"
              >
                <MessageSquare className="w-4 h-4" />
                Ask the tutor
              </button>
              <button
                onClick={() => setTab("practice")}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${
                  tab === "practice" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                }`}
                data-testid="tab-practice"
              >
                <Sparkles className="w-4 h-4" />
                Practice on this
              </button>
            </div>
            {selectedText && (
              <button
                onClick={() => setSelectedText("")}
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                <X className="w-3 h-3" /> clear selection
              </button>
            )}
          </div>

          {selectedText && (
            <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-xs text-amber-900">
              <div className="font-semibold mb-0.5">Using your highlighted text:</div>
              <div className="line-clamp-2 italic">"{selectedText}"</div>
            </div>
          )}

          {tab === "tutor" ? (
            <TutorPane
              lectureId={lecture?.id ?? null}
              selectedText={selectedText}
              onUsedSelection={() => {/* keep selection visible */}}
            />
          ) : (
            <PracticePane
              lectureId={lecture?.id ?? null}
              topicId={lecture?.topicId ?? null}
              weekNumber={lecture?.weekNumber ?? null}
              selectedText={selectedText}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}

/* ============ Practice pane (inline, scoped to this lecture's topic) ============ */
function PracticePane({
  lectureId,
  topicId,
  weekNumber,
  selectedText,
}: {
  lectureId: number | null;
  topicId: number | null;
  weekNumber: number | null;
  selectedText: string;
}) {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [problem, setProblem] = useState<PracticeProblem | null>(null);
  const [answer, setAnswer] = useState("");
  const [grade, setGrade] = useState<PracticeGrade | null>(null);
  const [trace, setTrace] = useState<KeystrokeTrace>({
    keystrokeCount: 0,
    eraseCount: 0,
    durationMs: 0,
  });

  const start = useStartPracticeSession();
  const next = useNextPracticeProblem();
  const grader = useGradePracticeAnswer();

  // auto-start a session scoped to this lecture's topic
  useEffect(() => {
    if (sessionId != null || topicId == null) return;
    start.mutate(
      {
        data: {
          tutorEnabled: true,
          focusOnWeaknesses: false,
          topicId,
          weekNumber: weekNumber ?? undefined,
        },
      },
      {
        onSuccess: (s) => {
          setSessionId(s.id);
          loadNext(s.id);
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  const requestText = useMemo(() => {
    return selectedText
      ? `Make a problem that drills exactly this passage from the lecture:\n"""${selectedText}"""`
      : "";
  }, [selectedText]);

  function loadNext(sid: number) {
    setAnswer("");
    setGrade(null);
    setTrace({ keystrokeCount: 0, eraseCount: 0, durationMs: 0 });
    setProblem(null);
    next.mutate(
      {
        sessionId: sid,
        data: { topicId: topicId ?? undefined, request: requestText || undefined },
      },
      { onSuccess: (p) => setProblem(p) },
    );
  }

  function submit() {
    if (!sessionId || !problem) return;
    grader.mutate(
      { sessionId, data: { problemId: problem.id, answer, trace } },
      { onSuccess: (r) => setGrade(r) },
    );
  }

  if (topicId == null) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground p-8">
        Loading lecture…
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Practice · {problem?.topicTitle ?? "this lecture"}
            {problem?.difficulty != null && (
              <span className="ml-2 normal-case font-normal">
                · difficulty {problem.difficulty.toFixed(1)}/5
              </span>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => sessionId && loadNext(sessionId)}
            disabled={next.isPending || grader.isPending}
            data-testid="button-new-problem"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            New problem
          </Button>
        </div>

        {selectedText && (
          <div className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-md p-2">
            The next problem you generate will be drilled specifically on the passage you highlighted. Click <strong>New problem</strong> to regenerate.
          </div>
        )}

        <div className="bg-card border rounded-lg p-5 min-h-[160px] text-lg leading-relaxed">
          {next.isPending || !problem ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <MarkdownRenderer content={problem.prompt} />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <AnswerInput
            value={answer}
            onChange={(val, t) => {
              setAnswer(val);
              setTrace(t);
            }}
            disabled={!!grade || !problem}
            promptSource={problem?.prompt}
          />
        </div>

        {grade ? (
          <div
            className={`rounded-md border p-3 ${
              grade.correct
                ? "bg-emerald-50 border-emerald-300"
                : "bg-red-50 border-red-300"
            }`}
          >
            <div
              className={`flex items-center gap-2 font-semibold mb-2 ${
                grade.correct ? "text-emerald-800" : "text-red-800"
              }`}
            >
              {grade.correct ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {grade.correct ? "Correct" : "Not quite"}
            </div>
            <div className="text-sm prose prose-sm max-w-none">
              <MarkdownRenderer content={grade.explanation} />
            </div>
            {grade.tutorTip && (
              <div className="mt-2 pt-2 border-t border-border/60 text-sm italic text-muted-foreground">
                Tutor tip: {grade.tutorTip}
              </div>
            )}
            <div className="mt-3 flex justify-end">
              <Button
                onClick={() => sessionId && loadNext(sessionId)}
                disabled={next.isPending}
                data-testid="button-next-after-grade"
              >
                Next problem
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end">
            <Button
              onClick={submit}
              disabled={!answer.trim() || grader.isPending || !problem}
              data-testid="button-submit-practice"
            >
              {grader.isPending ? "Grading…" : "Submit answer"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
