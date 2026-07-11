import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListUsers, adminSetUserFlag, adminListSubscriptions, adminApproveSubscription } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { toast } from "sonner";

const usersQ = queryOptions({ queryKey: ["admin", "users"], queryFn: () => adminListUsers() });
const subsQ = queryOptions({ queryKey: ["admin", "subs"], queryFn: () => adminListSubscriptions() });

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({ meta: [{ title: "Users — Admin" }] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(usersQ);
    context.queryClient.ensureQueryData(subsQ);
  },
  component: AdminUsers,
});

function AdminUsers() {
  const { data: users } = useSuspenseQuery(usersQ);
  const { data: subs } = useSuspenseQuery(subsQ);
  const qc = useQueryClient();
  const setFlag = useServerFn(adminSetUserFlag);
  const approve = useServerFn(adminApproveSubscription);
  const [filter, setFilter] = useState<"all" | "paid" | "unpaid" | "active" | "inactive" | "banned">("all");

  const filtered = users.filter((u: any) => {
    if (filter === "paid") return u.paid;
    if (filter === "unpaid") return !u.paid;
    if (filter === "active") return u.status === "active" && !u.banned;
    if (filter === "inactive") return u.status === "inactive";
    if (filter === "banned") return u.banned;
    return true;
  });

  async function action(userId: string, patch: any) {
    try { await setFlag({ data: { userId, ...patch } }); toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin", "users"] }); }
    catch (e: any) { toast.error(e.message); }
  }

  async function approveSub(id: string, ok: boolean) {
    try { await approve({ data: { subscriptionId: id, approve: ok } }); toast.success(ok ? "Approved" : "Rejected"); qc.invalidateQueries({ queryKey: ["admin", "subs"] }); }
    catch (e: any) { toast.error(e.message); }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Users & subscriptions</h1>
      <Tabs defaultValue="users" className="mt-6">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="pending">Pending approvals</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <div className="mt-4 flex flex-wrap gap-2">
            {(["all", "paid", "unpaid", "active", "inactive", "banned"] as const).map((f) => (
              <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>{f}</Button>
            ))}
          </div>
          <Card className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u: any) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.full_name || "—"}</TableCell>
                    <TableCell>
                      {u.banned ? <Badge variant="destructive">banned</Badge> : <Badge>{u.status}</Badge>}
                      {u.paid && <Badge variant="outline" className="ml-1">paid</Badge>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{u.subscriptions.map((s: any) => s.plans?.name).join(", ") || "—"}</TableCell>
                    <TableCell className="space-x-1">
                      <Button size="sm" variant="outline" onClick={() => action(u.id, { banned: !u.banned })}>{u.banned ? "Unban" : "Ban"}</Button>
                      <Button size="sm" variant="outline" onClick={() => action(u.id, { status: u.status === "active" ? "inactive" : "active" })}>
                        {u.status === "active" ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        <TabsContent value="pending">
          <Card className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subs.filter((s: any) => !s.approved).map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.profiles?.email}</TableCell>
                    <TableCell>{s.plans?.name}</TableCell>
                    <TableCell><Badge>{s.status}</Badge></TableCell>
                    <TableCell className="space-x-1">
                      <Button size="sm" onClick={() => approveSub(s.id, true)}>Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => approveSub(s.id, false)}>Reject</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {subs.filter((s: any) => !s.approved).length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No pending approvals</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
