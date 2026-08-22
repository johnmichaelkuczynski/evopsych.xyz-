import { Link } from "wouter";
import { BookOpen, Brain, Dna, GraduationCap } from "lucide-react";
import { TopicsRail } from "@/components/TopicsRail";

const weeks = [
  {
    title: "Foundations",
    body: "Natural selection, adaptation, inclusive fitness, and the adapted, modular mind.",
  },
  {
    title: "Survival",
    body: "The evolved body, food and fear, threat detection, and the behavioral immune system.",
  },
  {
    title: "Mating & Reproduction",
    body: "Mate preferences, short- and long-term strategies, attraction, jealousy, and parenting.",
  },
  {
    title: "Social Life & Culture",
    body: "Kinship, cooperation, status, coalitions, language, emotions, and the evolved roots of culture.",
  },
];

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <header className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-serif font-bold text-lg">
            🧬
          </div>
          <span className="font-serif font-semibold text-lg tracking-tight">EvoPsych</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 flex items-start gap-10">
        <aside className="hidden lg:block sticky top-6 pt-10">
          <TopicsRail />
        </aside>

        <div className="flex-1 min-w-0">
        <section className="py-16 md:py-24 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary/60 text-xs font-medium text-muted-foreground mb-6">
            <Dna className="w-3.5 h-3.5" />
            A four-week course on the adapted mind
          </div>
          <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Evolutionary Psychology
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Why do we fear some things so easily, favor kin, feel jealousy, cooperate with
            strangers, and build cultures? Read the idea, see it grounded in a real example,
            then state it precisely in your own words.
          </p>
          <div className="mt-9 flex items-center justify-center gap-3">
            <Link href="/dashboard">
              <button
                className="px-6 py-3 rounded-md text-base font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                data-testid="button-start-course"
              >
                Start the course
              </button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Browse the entire course, practice, tutoring, and grading freely.
          </p>
        </section>

        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-16">
          {weeks.map((w, i) => (
            <div
              key={w.title}
              className="rounded-lg border border-card-border bg-card p-5 text-left"
            >
              <div className="text-xs font-semibold text-muted-foreground mb-2">
                Week {i + 1}
              </div>
              <h3 className="font-serif font-semibold text-lg mb-1.5">{w.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{w.body}</p>
            </div>
          ))}
        </section>

        <section className="grid md:grid-cols-3 gap-6 pb-24">
          <Feature
            icon={BookOpen}
            title="29 micro-lectures"
            body="Each idea grounded in a worked example from biology, anthropology, or experimental psychology — at short, medium, or long depth."
          />
          <Feature
            icon={Brain}
            title="Section-scoped AI tutor"
            body="Ask questions about the exact lecture you're reading, with adaptive practice that tunes its difficulty to you."
          />
          <Feature
            icon={GraduationCap}
            title="AI-graded work"
            body="Homework, tests, a midterm, and a final — graded for conceptual precision, with built-in AI-authorship detection."
          />
        </section>

        <section className="lg:hidden pb-16">
          <TopicsRail />
        </section>
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-muted-foreground">
          Evolutionary Psychology — read the idea, ground the idea, state the idea.
        </div>
      </footer>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof BookOpen;
  title: string;
  body: string;
}) {
  return (
    <div className="text-left">
      <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center text-primary mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-serif font-semibold text-lg mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
