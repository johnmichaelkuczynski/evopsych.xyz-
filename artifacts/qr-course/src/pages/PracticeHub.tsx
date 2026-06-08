import { Layout } from "@/components/layout/Layout";
import { useParams, Link, useLocation } from "wouter";
import {
  useGetAssignment,
  useListPracticeAssignments,
  useGeneratePracticeAssignment,
  useGetLearnerProfile,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Sparkles,
  Target,
  TrendingUp,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";

export default function PracticeHub() {
  const params = useParams();
  const assignmentId = Number(params.assignmentId);
  const [, setLocation] = useLocation();

  const { data: assignment, isLoading: loadingAssignment } =
    useGetAssignment(assignmentId);
  const { data: sets, isLoading: loadingSets } = useListPracticeAssignments(
    { sourceAssignmentId: assignmentId },
    { query: { queryKey: ["practice-assignments", assignmentId] } },
  );
  const { data: profile } = useGetLearnerProfile();
  const generate = useGeneratePracticeAssignment();

  function handleGenerate() {
    generate.mutate(
      { data: { sourceAssignmentId: assignmentId } },
      { onSuccess: (pa) => setLocation(`/practice-assignments/${pa.id}`) },
    );
  }

  const inProgress = (sets ?? []).find((s) => s.status === "in_progress");
  const completed = (sets ?? []).filter((s) => s.status === "submitted");

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto w-full flex flex-col gap-8">
        <div>
          <Link href="/assignments">
            <Button
              variant="ghost"
              className="-ml-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Assignments
            </Button>
          </Link>
        </div>

        {loadingAssignment || !assignment ? (
          <Skeleton className="h-12 w-2/3" />
        ) : (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {assignment.kind} · Practice
            </span>
            <h1 className="text-3xl font-serif font-bold text-primary">
              Practice for {assignment.title}
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Practice is unlimited and never repeats a question — and it never reuses the
              real graded questions. Warm up here with the tutor on screen, get rich
              feedback you can talk back to, then take the graded version when you're ready.
            </p>
          </div>
        )}

        {/* Encouragement / generate */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold">Generate a fresh practice set</div>
                <div className="text-sm text-muted-foreground">
                  Brand-new questions matched to this assignment's topics and difficulty.
                </div>
              </div>
            </div>
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={generate.isPending}
              data-testid="button-generate-practice"
            >
              {generate.isPending ? "Generating…" : "Generate practice set"}
            </Button>
          </CardContent>
        </Card>

        {/* Learner profile pointers */}
        {profile &&
          (profile.summary ||
            profile.focusAreas.length > 0 ||
            profile.weaknesses.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  What to focus on
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {profile.summary && (
                  <p className="text-sm text-muted-foreground">{profile.summary}</p>
                )}
                {profile.focusAreas.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Focus areas
                    </div>
                    <ul className="flex flex-col gap-1.5">
                      {profile.focusAreas.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <TrendingUp className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex flex-wrap gap-6">
                  {profile.strengths.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Strengths
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.strengths.map((s, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {profile.weaknesses.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Needs work
                      </div>
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
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Prior practice sets */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-serif font-semibold border-b pb-2">
            Your practice sets
          </h2>
          {loadingSets ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (sets ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No practice sets yet. Generate one above to get started.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {inProgress && (
                <Link href={`/practice-assignments/${inProgress.id}`}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="flex items-center justify-between py-4">
                      <div>
                        <div className="font-medium">{inProgress.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {inProgress.problemCount} problems · in progress
                        </div>
                      </div>
                      <Button variant="default">Resume</Button>
                    </CardContent>
                  </Card>
                </Link>
              )}
              {completed.map((s) => (
                <Link key={s.id} href={`/practice-assignments/${s.id}`}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="flex items-center justify-between py-4">
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          {s.title}
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

        {/* CTA to graded */}
        {assignment && (
          <Card className="bg-secondary/40">
            <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">Ready for the real thing?</div>
                  <div className="text-sm text-muted-foreground">
                    The graded version has no tutor and counts toward your score.
                  </div>
                </div>
              </div>
              <Link href={`/assignments/${assignmentId}`}>
                <Button variant="outline">Go to graded {assignment.kind}</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
