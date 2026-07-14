import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getMyCourses } from "@/lib/courses.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Lock, ArrowRight } from "lucide-react";

const q = queryOptions({ queryKey: ["my-courses"], queryFn: () => getMyCourses() });

export const Route = createFileRoute("/_authenticated/courses")({
  head: () => ({ meta: [{ title: "My courses — ASVAB Pro" }] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(q);
  },
  component: MyCourses,
});

function MyCourses() {
  const { data } = useSuspenseQuery(q);

  if (data.locked) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="p-8 text-center">
          <Lock className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-bold">Courses locked</h1>
          <p className="mt-2 text-muted-foreground">
            You need an approved subscription to access ASVAB courses.
          </p>
          <Button asChild className="mt-6"><Link to="/pricing">See plans</Link></Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold flex items-center gap-2"><BookOpen className="h-7 w-7" /> My courses</h1>
      <p className="mt-2 text-muted-foreground">Full ASVAB lessons for your plan (tier {data.tier}).</p>

      {data.courses.length === 0 && (
        <Card className="mt-6 p-6 text-muted-foreground">No courses have been published yet for your tier. Check back soon.</Card>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {data.courses.map((c: any) => (
          <Link key={c.id} to="/courses/$courseId" params={{ courseId: c.id }} className="block">
            <Card className="p-6 h-full transition hover:border-primary hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <div className="font-semibold">{c.title}</div>
                <Badge variant="outline">Tier {c.min_tier}</Badge>
              </div>
              {c.description && <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>}
              <div className="mt-4 flex items-center gap-1 text-sm text-primary">Open <ArrowRight className="h-3 w-3" /></div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
