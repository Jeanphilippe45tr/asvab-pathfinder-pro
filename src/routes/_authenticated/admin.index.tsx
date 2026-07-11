import { createFileRoute, redirect } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { adminOverview } from "@/lib/admin.functions";
import { getMyContext } from "@/lib/user.functions";
import { Card } from "@/components/ui/card";
import { Users, DollarSign, Clock, ShieldAlert, Mail } from "lucide-react";

const meQ = queryOptions({ queryKey: ["me"], queryFn: () => getMyContext() });
const q = queryOptions({ queryKey: ["admin", "overview"], queryFn: () => adminOverview() });

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin — ASVAB Pro" }] }),
  beforeLoad: async ({ context }) => {
    const me = await context.queryClient.ensureQueryData(meQ);
    if (!me.isAdmin) throw redirect({ to: "/dashboard" });
  },
  loader: ({ context }) => { context.queryClient.ensureQueryData(q); },
  component: AdminOverview,
});

function AdminOverview() {
  const { data } = useSuspenseQuery(q);
  const items = [
    { icon: Users, label: "Total users", value: data.totalUsers },
    { icon: Users, label: "Active users", value: data.activeUsers },
    { icon: ShieldAlert, label: "Banned users", value: data.bannedUsers },
    { icon: DollarSign, label: "Paid orders", value: data.paidOrders },
    { icon: Clock, label: "Pending approvals", value: data.pendingApprovals },
    { icon: DollarSign, label: "Revenue (sim)", value: `$${(data.revenueCents / 100).toFixed(2)}` },
    { icon: Mail, label: "New messages", value: data.messages },
  ];
  return (
    <div>
      <h1 className="text-3xl font-bold">Admin overview</h1>
      <p className="mt-2 text-muted-foreground">You are the supreme master of ASVAB Pro.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {items.map((it) => (
          <Card key={it.label} className="p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><it.icon className="h-4 w-4" /> {it.label}</div>
            <div className="mt-2 text-3xl font-bold">{it.value}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
