import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getPracticeQuestions } from "@/lib/user.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { Lock } from "lucide-react";

const q = queryOptions({ queryKey: ["practice", "all"], queryFn: () => getPracticeQuestions({ data: {} }) });

export const Route = createFileRoute("/_authenticated/practice")({
  head: () => ({ meta: [{ title: "Practice — ASVAB Pro" }] }),
  loader: ({ context }) => { context.queryClient.ensureQueryData(q); },
  component: Practice,
});

function Practice() {
  const { data } = useSuspenseQuery(q);

  const bySubtest = useMemo(() => {
    const m: Record<string, any[]> = {};
    (data.questions ?? []).forEach((q: any) => { m[q.subtest] = m[q.subtest] || []; m[q.subtest].push(q); });
    return m;
  }, [data]);

  const [selected, setSelected] = useState<string | null>(null);

  if (data.locked) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card className="p-10 text-center">
          <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-bold">Practice is locked</h1>
          <p className="mt-2 text-muted-foreground">You need an approved, active subscription to access practice questions.</p>
          <Button asChild className="mt-4"><Link to="/pricing">Choose a plan</Link></Button>
        </Card>
      </div>
    );
  }

  if (selected) {
    const questions = bySubtest[selected] ?? [];
    return <QuizRunner subtest={selected} questions={questions} onExit={() => setSelected(null)} />;
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold">Practice</h1>
      <p className="mt-2 text-muted-foreground">Pick a subtest to start a drill.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(bySubtest).map(([sub, qs]) => (
          <Card key={sub} className="p-6">
            <div className="font-semibold">{sub}</div>
            <div className="mt-1 text-sm text-muted-foreground">{qs.length} questions available</div>
            <Button className="mt-4" onClick={() => setSelected(sub)}>Start drill</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function QuizRunner({ subtest, questions, onExit }: { subtest: string; questions: any[]; onExit: () => void }) {
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const current = questions[idx];
  const score = picks.reduce((s, a, i) => s + (a === questions[i]?.correct_index ? 1 : 0), 0);

  function pick(i: number) {
    const n = [...picks]; n[idx] = i; setPicks(n);
    if (idx + 1 < questions.length) setIdx(idx + 1); else setDone(true);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold">{subtest}</h2>
          <div className="mt-4 text-5xl font-bold text-primary">{score} / {questions.length}</div>
          <div className="mt-6 space-y-3 text-left">
            {questions.map((q, i) => (
              <div key={q.id} className="rounded border p-3 text-sm">
                <div className="font-medium">{q.prompt}</div>
                <div className={picks[i] === q.correct_index ? "text-accent" : "text-destructive"}>
                  Your answer: {q.choices[picks[i]] ?? "—"}
                </div>
                {picks[i] !== q.correct_index && <div className="text-muted-foreground">Correct: {q.choices[q.correct_index]}</div>}
                {q.explanation && <div className="mt-1 text-xs text-muted-foreground">{q.explanation}</div>}
              </div>
            ))}
          </div>
          <Button className="mt-6" onClick={onExit}>Back to practice</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex items-center justify-between text-sm">
        <button onClick={onExit} className="text-muted-foreground hover:underline">← Exit</button>
        <div className="text-muted-foreground">Q {idx + 1} / {questions.length}</div>
      </div>
      <Card className="p-8">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{subtest}</div>
        <h2 className="mt-2 text-xl font-semibold">{current.prompt}</h2>
        <div className="mt-6 grid gap-2">
          {(current.choices as string[]).map((c: string, i: number) => (
            <Button key={i} variant="outline" className="justify-start h-auto py-3 text-left whitespace-normal" onClick={() => pick(i)}>
              <span className="mr-2 font-mono text-muted-foreground">{String.fromCharCode(65 + i)}.</span>{c}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
