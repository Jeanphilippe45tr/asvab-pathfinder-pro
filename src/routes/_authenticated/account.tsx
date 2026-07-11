import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getMyContext } from "@/lib/user.functions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const q = queryOptions({ queryKey: ["me"], queryFn: () => getMyContext() });

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "Account — ASVAB Pro" }] }),
  loader: ({ context }) => { context.queryClient.ensureQueryData(q); },
  component: Account,
});

function Account() {
  const { data } = useSuspenseQuery(q);
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold">Account</h1>
      <Card className="mt-6 p-6">
        <div className="grid gap-3 text-sm">
          <Row label="Email" value={data.profile?.email} />
          <Row label="Name" value={data.profile?.full_name || "—"} />
          <Row label="Status" value={<Badge>{data.profile?.status}</Badge>} />
          <Row label="Roles" value={data.roles.join(", ") || "user"} />
        </div>
      </Card>
      <h2 className="mt-8 text-xl font-semibold">Subscriptions</h2>
      <div className="mt-3 space-y-2">
        {data.subscriptions.length === 0 && <p className="text-sm text-muted-foreground">No subscriptions.</p>}
        {data.subscriptions.map((s: any) => (
          <Card key={s.id} className="flex items-center justify-between p-4">
            <div>
              <div className="font-medium">{s.plans?.name}</div>
              <div className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={s.approved ? "default" : "secondary"}>{s.approved ? "approved" : "pending"}</Badge>
              <Badge variant="outline">{s.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b pb-2 last:border-0">
      <div className="text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
