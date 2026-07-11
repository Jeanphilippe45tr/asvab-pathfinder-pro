import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  adminListUsers,
  adminSetUserFlag,
  adminListSubscriptions,
  adminApproveSubscription,
  adminDeleteUser,
  adminResetUserPassword,
  adminGrantSubscription,
  adminRevokeSubscription,
  adminGetPlans,
} from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Key, PlusCircle, X } from "lucide-react";

const usersQ = queryOptions({ queryKey: ["admin", "users"], queryFn: () => adminListUsers() });
const subsQ = queryOptions({ queryKey: ["admin", "subs"], queryFn: () => adminListSubscriptions() });
const plansQ = queryOptions({ queryKey: ["admin", "plans"], queryFn: () => adminGetPlans() });

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({ meta: [{ title: "Users — Admin" }] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(usersQ);
    context.queryClient.ensureQueryData(subsQ);
    context.queryClient.ensureQueryData(plansQ);
  },
  component: AdminUsers,
});

function AdminUsers() {
  const { data: users } = useSuspenseQuery(usersQ);
  const { data: subs } = useSuspenseQuery(subsQ);
  const { data: plans } = useSuspenseQuery(plansQ);
  const qc = useQueryClient();
  const setFlag = useServerFn(adminSetUserFlag);
  const approve = useServerFn(adminApproveSubscription);
  const delUser = useServerFn(adminDeleteUser);
  const resetPw = useServerFn(adminResetUserPassword);
  const grant = useServerFn(adminGrantSubscription);
  const revoke = useServerFn(adminRevokeSubscription);
  const [filter, setFilter] = useState<"all" | "paid" | "unpaid" | "active" | "inactive" | "banned">("all");
  const [pwUser, setPwUser] = useState<any>(null);
  const [pw, setPw] = useState("");
  const [grantUser, setGrantUser] = useState<any>(null);
  const [grantPlan, setGrantPlan] = useState("");

  const filtered = users.filter((u: any) => {
    if (filter === "paid") return u.paid;
    if (filter === "unpaid") return !u.paid;
    if (filter === "active") return u.status === "active" && !u.banned;
    if (filter === "inactive") return u.status === "inactive";
    if (filter === "banned") return u.banned;
    return true;
  });

  function invalidateAll() {
    qc.invalidateQueries({ queryKey: ["admin", "users"] });
    qc.invalidateQueries({ queryKey: ["admin", "subs"] });
  }

  async function action(userId: string, patch: any) {
    try { await setFlag({ data: { userId, ...patch } }); toast.success("Updated"); invalidateAll(); }
    catch (e: any) { toast.error(e.message); }
  }
  async function approveSub(id: string, ok: boolean) {
    try { await approve({ data: { subscriptionId: id, approve: ok } }); toast.success(ok ? "Approved" : "Rejected"); invalidateAll(); }
    catch (e: any) { toast.error(e.message); }
  }
  async function removeUser(u: any) {
    if (!confirm(`Delete ${u.email} permanently? This cannot be undone.`)) return;
    try { await delUser({ data: { userId: u.id } }); toast.success("User deleted"); invalidateAll(); }
    catch (e: any) { toast.error(e.message); }
  }
  async function doReset() {
    if (!pwUser) return;
    try { await resetPw({ data: { userId: pwUser.id, password: pw } }); toast.success("Password updated"); setPwUser(null); setPw(""); }
    catch (e: any) { toast.error(e.message); }
  }
  async function doGrant() {
    if (!grantUser || !grantPlan) return;
    try { await grant({ data: { userId: grantUser.id, planId: grantPlan } }); toast.success("Subscription granted"); setGrantUser(null); setGrantPlan(""); invalidateAll(); }
    catch (e: any) { toast.error(e.message); }
  }
  async function doRevoke(subId: string) {
    if (!confirm("Revoke this subscription?")) return;
    try { await revoke({ data: { subscriptionId: subId } }); toast.success("Revoked"); invalidateAll(); }
    catch (e: any) { toast.error(e.message); }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Users & subscriptions</h1>
      <Tabs defaultValue="users" className="mt-6">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="pending">Pending approvals</TabsTrigger>
          <TabsTrigger value="all-subs">All subscriptions</TabsTrigger>
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
                  <TableHead>Plans</TableHead>
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
                    <TableCell className="space-x-1 whitespace-nowrap">
                      <Button size="sm" variant="outline" onClick={() => action(u.id, { banned: !u.banned })}>{u.banned ? "Unban" : "Ban"}</Button>
                      <Button size="sm" variant="outline" onClick={() => action(u.id, { status: u.status === "active" ? "inactive" : "active" })}>
                        {u.status === "active" ? "Deactivate" : "Activate"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setGrantUser(u); setGrantPlan(""); }}><PlusCircle className="mr-1 h-3 w-3" /> Grant</Button>
                      <Button size="sm" variant="outline" onClick={() => { setPwUser(u); setPw(""); }}><Key className="mr-1 h-3 w-3" /> Password</Button>
                      <Button size="sm" variant="destructive" onClick={() => removeUser(u)}><Trash2 className="h-3 w-3" /></Button>
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
              <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Plan</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
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

        <TabsContent value="all-subs">
          <Card className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Plan</TableHead><TableHead>Status</TableHead><TableHead>Approved</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {subs.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.profiles?.email}</TableCell>
                    <TableCell>{s.plans?.name}</TableCell>
                    <TableCell><Badge>{s.status}</Badge></TableCell>
                    <TableCell>{s.approved ? "yes" : "no"}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="destructive" onClick={() => doRevoke(s.id)}><X className="mr-1 h-3 w-3" /> Revoke</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {subs.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">None</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!pwUser} onOpenChange={(o) => !o && setPwUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reset password for {pwUser?.email}</DialogTitle></DialogHeader>
          <div className="space-y-2"><Label>New password</Label><Input type="text" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="min 6 chars" /></div>
          <DialogFooter><Button variant="outline" onClick={() => setPwUser(null)}>Cancel</Button><Button onClick={doReset}>Update</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!grantUser} onOpenChange={(o) => !o && setGrantUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Grant subscription to {grantUser?.email}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Plan</Label>
            <Select value={grantPlan} onValueChange={setGrantPlan}>
              <SelectTrigger><SelectValue placeholder="Choose a plan" /></SelectTrigger>
              <SelectContent>{plans.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setGrantUser(null)}>Cancel</Button><Button onClick={doGrant} disabled={!grantPlan}>Grant</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
