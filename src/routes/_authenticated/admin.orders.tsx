import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListOrders, adminSetOrderStatus } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

const q = queryOptions({ queryKey: ["admin", "orders"], queryFn: () => adminListOrders() });

export const Route = createFileRoute("/_authenticated/admin/orders")({
  head: () => ({ meta: [{ title: "Orders — Admin" }] }),
  loader: ({ context }) => { context.queryClient.ensureQueryData(q); },
  component: AdminOrders,
});

function AdminOrders() {
  const { data: orders } = useSuspenseQuery(q);
  const setStatus = useServerFn(adminSetOrderStatus);
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const filtered = orders.filter((o: any) => filter === "all" || o.status === filter);

  async function change(id: string, status: string) {
    try { await setStatus({ data: { orderId: id, status } }); toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin", "orders"] }); }
    catch (e: any) { toast.error(e.message); }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Orders</h1>
      <div className="mt-4 w-48">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card className="mt-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((o: any) => (
              <TableRow key={o.id}>
                <TableCell className="text-xs">{new Date(o.created_at).toLocaleString()}</TableCell>
                <TableCell>{o.profiles?.email}</TableCell>
                <TableCell>{o.plans?.name}</TableCell>
                <TableCell className="font-mono">${(o.amount_cents / 100).toFixed(2)}</TableCell>
                <TableCell><Badge>{o.status}</Badge></TableCell>
                <TableCell className="space-x-1">
                  <Button size="sm" variant="outline" onClick={() => change(o.id, "paid")}>Paid</Button>
                  <Button size="sm" variant="outline" onClick={() => change(o.id, "refunded")}>Refund</Button>
                  <Button size="sm" variant="outline" onClick={() => change(o.id, "cancelled")}>Cancel</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
