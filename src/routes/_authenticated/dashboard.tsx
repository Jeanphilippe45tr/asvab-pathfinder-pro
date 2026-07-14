import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getMyContext } from "@/lib/user.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

const q = queryOptions({ queryKey: ["me"], queryFn: () => getMyContext() });

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ASVAB Pro" }] }),
  loader: ({ context }) => { context.queryClient.ensureQueryData(q); },
  component: Dashboard,
});

function Dashboard() {
  const { data } = useSuspenseQuery(q);
  const activeSub = data.subscriptions.find((s: any) => s.approved && s.status === "active");
  const pendingSub = data.subscriptions.find((s: any) => !s.approved);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold">Welcome back{data.profile?.full_name ? `, ${data.profile.full_name}` : ""}</h1>
      <p className="mt-2 text-muted-foreground">Your ASVAB prep hub.</p>

      {data.profile?.banned && (
        <Card className="mt-6 border-destructive p-6">
          <div className="flex items-center gap-3 text-destructive"><XCircle className="h-5 w-5" /> Your account has been suspended. Contact support.</div>
        </Card>
      )}

      {!activeSub && pendingSub && (
        <Card className="mt-6 border-accent p-6">
          <div className="flex items-center gap-3"><Clock className="h-5 w-5 text-accent" /><div>
            <div className="font-semibold">Awaiting admin approval</div>
            <p className="text-sm text-muted-foreground">Your payment for <strong>{pendingSub.plans?.name}</strong> is recorded. An admin will approve your access shortly.</p>
          </div></div>
        </Card>
      )}

      {!activeSub && !pendingSub && (
        <Card className="mt-6 p-6">
          <h2 className="font-semibold">Choose a plan to unlock full access</h2>
          <p className="mt-1 text-sm text-muted-foreground">You need an active subscription to access practice materials.</p>
          <Button asChild className="mt-4"><Link to="/pricing">See plans</Link></Button>
        </Card>
      )}

      {activeSub && (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-accent" /> Active plan</div>
            <div className="mt-2 text-xl font-bold">{activeSub.plans?.name}</div>
            <Badge variant="outline" className="mt-2">Tier {activeSub.plans?.tier}</Badge>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground">Courses</div>
            <div className="mt-2 text-xl font-bold">Learn</div>
            <Button asChild size="sm" className="mt-3"><Link to="/courses">Open courses</Link></Button>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground">Practice</div>
            <div className="mt-2 text-xl font-bold">Ready</div>
            <Button asChild size="sm" className="mt-3"><Link to="/practice">Start practicing</Link></Button>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground">My files</div>
            <div className="mt-2 text-xl font-bold">Private</div>
            <Button asChild size="sm" variant="outline" className="mt-3"><Link to="/files">View files</Link></Button>
          </Card>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-xl font-semibold">Your orders</h2>
        <div className="mt-4 space-y-2">
          {data.orders.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
          {data.orders.map((o: any) => (
            <Card key={o.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">{o.plans?.name}</div>
                <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="font-mono">${(o.amount_cents / 100).toFixed(2)}</div>
                <Badge variant={o.status === "paid" ? "default" : "secondary"}>{o.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
