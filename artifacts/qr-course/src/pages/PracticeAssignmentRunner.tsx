import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useParams, Link } from "wouter";
import {
  useGetPracticeAssignment,
  useSavePracticeAssignmentAnswer,
  useSubmitPracticeAssignment,
  useGetPracticeFeedbackChat,
  useSendPracticeFeedbackChat,
  type PracticeAssignmentResult,
  type FeedbackMessage,
  type KeystrokeTrace,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AnswerInput } from "@/components/AnswerInput";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { TutorPane } from "@/components/TutorPane";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Send,
  Target,
} from "lucide-react";

export default function PracticeAssignmentRunner() {
  const params = useParams();
  const id = Number(params.id);

  const { data: pa, isLoading, refetch } = useGetPracticeAssignment(id, {
    query: { queryKey: ["practice-assignment", id] },
  });
  const saveAnswer = useSavePracticeAssignmentAnswer();
  const submit = useSubmitPracticeAssignment();

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<PracticeAssignmentResult | null>(null);

  // Seed local answers from the loaded attempt.
  useEffect(() => {
    if (!pa) return;
    const init: Record<number, string> = {};
    for (const a of pa.answers) init[a.problemId] = a.answer;
    setAnswers(init);
  }, [pa]);

  const submitted = pa?.status === "submitted" || !!result;

  function handleChange(problemId: number, val: string, trace: KeystrokeTrace) {
    setAnswers((prev) => ({ ...prev, [problemId]: val }));
    saveAnswer.mutate({ id, problemId, data: { answer: val, trace } });
  }

  function handleSubmit() {
    submit.mutate(
      { id },
      {
        onSuccess: (data) => {
          setResult(data);
          refetch();
        },
      },
    );
  }

  if (isLoading || !pa) {
    return (
      <Layout>
        <div className="p-8 max-w-3xl mx-auto w-full flex flex-col gap-6">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  const readiness = result?.readiness ?? pa.readiness ?? null;
  const scorePercent =
    result?.percent ?? (pa.scorePercent != null ? pa.scorePercent : null);

  return (
    <Layout>
      <div className="px-6 pt-4 pb-2">
        <Link href={`/assignments/${pa.sourceAssignmentId}/practice`}>
          <Button
            variant="ghost"
            className="-ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to practice for {pa.sourceTitle}
          </Button>
        </Link>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-0">
        {/* LEFT: the practice work / feedback */}
        <div className="overflow-y-auto px-8 pb-16 border-r border-border">
          <header className="mb-6 mt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {pa.kind} · Practice {submitted ? "· Results" : ""}
            </span>
            <h1 className="text-2xl font-serif font-bold text-primary mt-1">
              {pa.title}
            </h1>
            {submitted && scorePercent != null && (
              <p className="text-muted-foreground mt-1">
                Score: {Math.round(scorePercent)}%
              </p>
            )}
          </header>

          {/* Readiness briefing */}
          {submitted && readiness && (
            <div className="mb-6 rounded-lg border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center gap-2 font-semibold text-primary mb-2">
                <Target className="w-4 h-4" />
                Readiness for the graded {pa.kind}
              </div>
              <div className="prose prose-sm max-w-none">
                <MarkdownRenderer content={readiness} />
              </div>
              <div className="mt-3">
                <Link href={`/assignments/${pa.sourceAssignmentId}`}>
                  <Button variant="outline" size="sm">
                    Go to graded {pa.kind}
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-6">
            {pa.problems.map((problem, idx) => {
              const answerState = pa.answers.find(
                (a) => a.problemId === problem.id,
              );
              const perResult = result?.perProblem.find(
                (r) => r.problemId === problem.id,
              );
              const correct = perResult?.correct ?? answerState?.correct ?? null;
              const feedback = perResult?.feedback ?? answerState?.feedback ?? null;
              const correctAnswer =
                perResult?.correctAnswer ?? answerState?.correctAnswer ?? null;
              const userAnswer =
                perResult?.userAnswer ?? answerState?.answer ?? answers[problem.id] ?? "";

              return (
                <div
                  key={problem.id}
                  className={`rounded-lg border p-5 ${
                    submitted
                      ? correct
                        ? "border-emerald-300 bg-emerald-50/50"
                        : "border-red-300 bg-red-50/50"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Problem {idx + 1}
                      {problem.topicTitle ? ` · ${problem.topicTitle}` : ""}
                    </span>
                    {submitted &&
                      (correct ? (
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
                          <CheckCircle2 className="w-4 h-4" /> Correct
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-red-700">
                          <XCircle className="w-4 h-4" /> Not quite
                        </span>
                      ))}
                  </div>

                  <div className="prose prose-slate max-w-none text-base mb-4">
                    <MarkdownRenderer content={problem.prompt} />
                  </div>

                  {!submitted && problem.hint && (
                    <details className="mb-3 text-sm">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        Show hint
                      </summary>
                      <div className="mt-2 text-muted-foreground">
                        <MarkdownRenderer content={problem.hint} />
                      </div>
                    </details>
                  )}

                  {submitted ? (
                    <div className="flex flex-col gap-3">
                      <div>
                        <span className="text-sm font-semibold">Your answer:</span>
                        <div className="font-mono mt-1 text-sm">
                          {userAnswer || "No answer"}
                        </div>
                      </div>
                      {!correct && correctAnswer && (
                        <div className="text-primary">
                          <span className="text-sm font-semibold">Correct answer:</span>
                          <div className="font-mono mt-1 text-sm">{correctAnswer}</div>
                        </div>
                      )}
                      {feedback && (
                        <div className="rounded-md bg-card border border-border p-3">
                          <div className="text-sm font-semibold mb-1">Feedback</div>
                          <div className="prose prose-sm max-w-none">
                            <MarkdownRenderer content={feedback} />
                          </div>
                        </div>
                      )}
                      <FeedbackChat practiceAssignmentId={id} problemId={problem.id} />
                    </div>
                  ) : (
                    <AnswerInput
                      value={answers[problem.id] ?? ""}
                      onChange={(val, trace) => handleChange(problem.id, val, trace)}
                      promptSource={problem.prompt}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {!submitted && (
            <div className="mt-8 flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={submit.isPending}
                className="bg-chart-2 hover:bg-chart-2/90 text-white"
                data-testid="button-submit-practice-assignment"
              >
                {submit.isPending ? "Submitting…" : "Submit practice"}
              </Button>
            </div>
          )}
        </div>

        {/* RIGHT: tutor pane — ALWAYS on screen during practice */}
        <div className="flex flex-col min-h-0 bg-secondary/20">
          <div className="flex items-center gap-2 border-b border-border bg-background px-4 py-2.5">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Tutor (available during practice)</span>
          </div>
          <TutorPane
            lectureId={null}
            selectedText=""
            onUsedSelection={() => {}}
            contextLabel={`this practice ${pa.kind}`}
          />
        </div>
      </div>
    </Layout>
  );
}

/* ============ Per-problem feedback dialogue ============ */
function FeedbackChat({
  practiceAssignmentId,
  problemId,
}: {
  practiceAssignmentId: number;
  problemId: number;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { data: allMessages, refetch } = useGetPracticeFeedbackChat(
    practiceAssignmentId,
    {
      query: {
        queryKey: ["practice-feedback-chat", practiceAssignmentId],
        enabled: open,
      },
    },
  );
  const send = useSendPracticeFeedbackChat();

  const thread = useMemo(
    () =>
      (allMessages ?? []).filter(
        (m: FeedbackMessage) => (m.problemId ?? null) === problemId,
      ),
    [allMessages, problemId],
  );

  function handleSend() {
    const message = input.trim();
    if (!message) return;
    setInput("");
    send.mutate(
      { id: practiceAssignmentId, data: { problemId, message } },
      { onSuccess: () => refetch() },
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="self-start inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        data-testid={`button-discuss-${problemId}`}
      >
        <MessageSquare className="w-4 h-4" />
        Discuss this feedback
      </button>
    );
  }

  return (
    <div className="rounded-md border border-border bg-background p-3 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Discuss this feedback</span>
        <button
          onClick={() => setOpen(false)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          collapse
        </button>
      </div>

      <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
        {thread.length === 0 && (
          <p className="text-sm text-muted-foreground italic">
            Ask anything about this problem's feedback — why your answer was marked the way
            it was, or how to get it right next time.
          </p>
        )}
        {thread.map((m) => (
          <div
            key={m.id}
            className={`max-w-[92%] ${m.role === "user" ? "self-end" : "self-start"}`}
          >
            <div
              className={`px-3 py-2 rounded-lg text-sm ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border"
              }`}
            >
              <MarkdownRenderer content={m.content} inverted={m.role === "user"} />
            </div>
          </div>
        ))}
        {send.isPending && (
          <div className="self-start px-3 py-2 rounded-lg bg-card border border-border text-sm animate-pulse text-muted-foreground">
            Thinking…
          </div>
        )}
      </div>

      <div className="flex gap-2 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask about this feedback…"
          rows={2}
          className="flex-1 bg-secondary border-none rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-y"
          data-testid={`input-discuss-${problemId}`}
        />
        <Button onClick={handleSend} disabled={!input.trim() || send.isPending}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
