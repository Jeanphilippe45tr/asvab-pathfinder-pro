import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { adminAnalytics } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, ShoppingCart, RotateCcw } from "lucide-react";

const q = queryOptions({ queryKey: ["admin", "analytics"], queryFn: () => adminAnalytics() });

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Admin" }] }),
  loader: ({ context }) => { context.queryClient.ensureQueryData(q); },
  component: AdminAnalytics,
});

function AdminAnalytics() {
  const { data } = useSuspenseQuery(q);
  const days = Object.entries(data.revenueByDay).sort(([a], [b]) => a.localeCompare(b));
  const max = Math.max(1, ...days.map(([, v]) => v));

  return (
    <div>
      <h1 className="text-3xl font-bold">Analytics</h1>
      <p className="mt-2 text-muted-foreground">Site activity, revenue trends, and quiz attempts.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card className="p-5"><div className="flex items-center gap-2 text-sm text-muted-foreground"><ShoppingCart className="h-4 w-4" /> Total orders</div><div className="mt-2 text-3xl font-bold">{data.totalOrders}</div></Card>
        <Card className="p-5"><div className="flex items-center gap-2 text-sm text-muted-foreground"><TrendingUp className="h-4 w-4" /> Paid</div><div className="mt-2 text-3xl font-bold">{data.paidCount}</div></Card>
        <Card className="p-5"><div className="flex items-center gap-2 text-sm text-muted-foreground"><RotateCcw className="h-4 w-4" /> Refunded</div><div className="mt-2 text-3xl font-bold">{data.refundedCount}</div></Card>
      </div>

      <Card className="mt-6 p-6">
        <h2 className="text-lg font-semibold">Revenue by day</h2>
        {days.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No paid orders yet.</p>
        ) : (
          <div className="mt-4 flex h-40 items-end gap-2">
            {days.map(([d, v]) => (
              <div key={d} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-t bg-primary" style={{ height: `${(v / max) * 100}%` }} title={`$${(v / 100).toFixed(2)}`} />
                <div className="text-[10px] text-muted-foreground">{d.slice(5)}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="text-lg font-semibold">Active subscriptions by plan</h2>
        <div className="mt-4 space-y-2">
          {Object.entries(data.subsByPlan).map(([name, count]) => (
            <div key={name} className="flex items-center justify-between border-b pb-2 last:border-0">
              <span>{name}</span><span className="font-mono">{count}</span>
            </div>
          ))}
          {Object.keys(data.subsByPlan).length === 0 && <p className="text-sm text-muted-foreground">No subscriptions.</p>}
        </div>
      </Card>

      <Card className="mt-6 overflow-x-auto">
        <div className="p-4"><h2 className="text-lg font-semibold">Recent quiz attempts</h2></div>
        <Table>
          <TableHeader><TableRow><TableHead>When</TableHead><TableHead>User</TableHead><TableHead>Score</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.attempts.map((a: any) => (
              <TableRow key={a.id}>
                <TableCell className="text-xs">{new Date(a.created_at).toLocaleString()}</TableCell>
                <TableCell>{a.profiles?.email ?? a.user_id.slice(0, 8)}</TableCell>
                <TableCell className="font-mono">{a.score}/{a.total}</TableCell>
              </TableRow>
            ))}
            {data.attempts.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No attempts yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
