import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getSiteSettings, getTutorialQuestions, recordQuizAttempt } from "@/lib/site.functions";
import { SitePage } from "@/components/SiteLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useEffect, useMemo, useState } from "react";
import { Timer } from "lucide-react";

const settingsQ = queryOptions({ queryKey: ["settings"], queryFn: () => getSiteSettings() });
const tutQ = queryOptions({ queryKey: ["tutorial"], queryFn: () => getTutorialQuestions() });

export const Route = createFileRoute("/tutorial")({
  head: () => ({ meta: [{ title: "Free ASVAB Quiz — 7 minutes" }, { name: "description", content: "Try a free 10-question, 7-minute ASVAB style quiz." }] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(settingsQ);
    context.queryClient.ensureQueryData(tutQ);
  },
  component: Tutorial,
});

const TOTAL_SECONDS = 7 * 60;

function Tutorial() {
  const { data: settings } = useSuspenseQuery(settingsQ);
  const { data: questions } = useSuspenseQuery(tutQ);
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [remaining, setRemaining] = useState(TOTAL_SECONDS);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!started || finished) return;
    const t = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [started, finished]);

  useEffect(() => {
    if (started && !finished && remaining === 0) finish(answers);
  }, [remaining, started, finished]);

  const current = questions[idx];
  const score = useMemo(() => answers.reduce((s, a, i) => s + (a === questions[i]?.correct_index ? 1 : 0), 0), [answers, questions]);

  function pick(i: number) {
    const next = [...answers];
    next[idx] = i;
    setAnswers(next);
    if (idx + 1 < questions.length) setIdx(idx + 1);
    else finish(next);
  }

  function finish(final: number[]) {
    setFinished(true);
    const s = final.reduce((sum, a, i) => sum + (a === questions[i]?.correct_index ? 1 : 0), 0);
    recordQuizAttempt({ data: { score: s, total: questions.length } }).catch(() => {});
  }

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <SitePage footerData={settings}>
      <section className="mx-auto max-w-3xl px-4 py-16 md:px-8">
        {!started && (
          <Card className="p-8 shadow-card">
            <h1 className="text-3xl font-bold">Free ASVAB Practice Quiz</h1>
            <p className="mt-3 text-muted-foreground">10 questions across ASVAB subtests. You have <strong>7 minutes total</strong>. Try to answer as many as you can before time runs out.</p>
            <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
              <li>• 10 multiple-choice questions</li>
              <li>• Automatic scoring at the end</li>
              <li>• No signup required</li>
            </ul>
            <Button size="lg" className="mt-6 bg-gold text-gold-foreground hover:opacity-90" onClick={() => setStarted(true)}>
              Start quiz
            </Button>
          </Card>
        )}

        {started && !finished && current && (
          <Card className="p-8 shadow-card">
            <div className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground">Question {idx + 1} of {questions.length}</div>
              <div className="flex items-center gap-2 font-mono text-primary"><Timer className="h-4 w-4" /> {mm}:{ss}</div>
            </div>
            <Progress className="mt-3" value={((TOTAL_SECONDS - remaining) / TOTAL_SECONDS) * 100} />
            <h2 className="mt-6 text-xl font-semibold">{current.prompt}</h2>
            <div className="mt-6 grid gap-3">
              {(current.choices as string[]).map((c, i) => (
                <Button key={i} variant="outline" className="justify-start h-auto py-3 text-left whitespace-normal" onClick={() => pick(i)}>
                  <span className="mr-2 font-mono text-muted-foreground">{String.fromCharCode(65 + i)}.</span> {c}
                </Button>
              ))}
            </div>
          </Card>
        )}

        {finished && (
          <Card className="p-8 shadow-card text-center">
            <h1 className="text-3xl font-bold">Your score</h1>
            <div className="mt-6 text-6xl font-bold text-primary">{score} / {questions.length}</div>
            <p className="mt-4 text-muted-foreground">Great start! Create your account and pick a plan to unlock full-length practice, all 9 subtests, and score analytics.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="bg-gold text-gold-foreground hover:opacity-90"><Link to="/auth">Create account</Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/pricing">See plans</Link></Button>
            </div>
          </Card>
        )}
      </section>
    </SitePage>
  );
}
