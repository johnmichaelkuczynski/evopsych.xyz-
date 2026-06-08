import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Link, useLocation } from "wouter";
import {
  useListAssignments,
  useListPracticeAssignments,
  useGeneratePracticeAssignment,
  useGetLearnerProfile,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dumbbell,
  Sparkles,
  Target,
  TrendingUp,
  CheckCircle2,
  PlayCircle,
} from "lucide-react";

export default function Practice() {
  const [, setLocation] = useLocation();
  const { data: assignments, isLoading: loadingAssignments } =
    useListAssignments();
  const { data: sets, isLoading: loadingSets } = useListPracticeAssignments(
    {},
    { query: { queryKey: ["practice-assignments", "all"] } },
  );
  const { data: profile } = useGetLearnerProfile();
  const generate = useGeneratePracticeAssignment();
  const [generatingFor, setGeneratingFor] = useState<number | null>(null);

  function handleStartPractice(sourceAssignmentId: number) {
    setGeneratingFor(sourceAssignmentId);
    generate.mutate(
      { data: { sourceAssignmentId } },
      {
        onSuccess: (pa) => setLocation(`/practice-assignments/${pa.id}`),
        onSettled: () => setGeneratingFor(null),
      },
    );
  }

  const inProgress = (sets ?? []).filter((s) => s.status === "in_progress");
  const completed = (sets ?? []).filter((s) => s.status === "submitted");

  const hasProfile =
    profile &&
    (profile.summary ||
      profile.focusAreas.length > 0 ||
      profile.weaknesses.length > 0);

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto w-full flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Dumbbell className="w-4 h-4" />
            Practice
          </span>
          <h1 className="text-3xl font-serif font-bold text-primary">
            Practice anything, as much as you want
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Pick any assignment below and start practicing in one click. Every
            practice set is brand-new — it never repeats a question and never
            reuses the real graded questions. The tutor stays on screen and you
            get rich feedback you can talk back to.
          </p>
        </div>

        {/* What to focus on */}
        {hasProfile && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                What to focus on
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {profile?.summary && (
                <p className="text-sm text-muted-foreground">
                  {profile.summary}
                </p>
              )}
              {profile && profile.focusAreas.length > 0 && (
                <ul className="flex flex-col gap-1.5">
                  {profile.focusAreas.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}
              {profile && profile.weaknesses.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {profile.weaknesses.map((s, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* In-progress sets — resume in one click */}
        {inProgress.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-serif font-semibold border-b pb-2">
              Continue where you left off
            </h2>
            {inProgress.map((s) => (
              <Link key={s.id} href={`/practice-assignments/${s.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <PlayCircle className="w-4 h-4 text-primary" />
                        {s.sourceTitle}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {s.problemCount} problems · in progress
                      </div>
                    </div>
                    <Button>Resume</Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pick an assignment to practice */}
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-serif font-semibold border-b pb-2">
            Start a new practice set
          </h2>
          {loadingAssignments ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (assignments ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No assignments available yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(assignments ?? []).map((a) => {
                const busy = generatingFor === a.id;
                return (
                  <Card key={a.id} className="flex flex-col justify-between">
                    <CardContent className="flex flex-col gap-3 py-4">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Week {a.weekNumber} · {a.kind}
                        </div>
                        <div className="font-medium leading-snug">{a.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {a.problemCount} problems
                        </div>
                      </div>
                      <Button
                        onClick={() => handleStartPractice(a.id)}
                        disabled={generate.isPending}
                        data-testid={`button-start-practice-${a.id}`}
                      >
                        <Sparkles
                          className={`w-4 h-4 mr-2 ${busy ? "animate-pulse" : ""}`}
                        />
                        {busy ? "Generating…" : "Start practice"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Past practice sets */}
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-serif font-semibold border-b pb-2">
            Past practice sets
          </h2>
          {loadingSets ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : completed.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No completed practice sets yet. Start one above.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {completed.map((s) => (
                <Link key={s.id} href={`/practice-assignments/${s.id}`}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="flex items-center justify-between py-4">
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          {s.sourceTitle}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {s.problemCount} problems · scored{" "}
                          {Math.round(s.scorePercent ?? 0)}%
                        </div>
                      </div>
                      <Button variant="outline">Review</Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
