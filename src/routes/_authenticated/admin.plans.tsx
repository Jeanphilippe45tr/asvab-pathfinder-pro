import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminGetPlans, adminUpsertPlan, adminDeletePlan } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

const q = queryOptions({ queryKey: ["admin", "plans"], queryFn: () => adminGetPlans() });

export const Route = createFileRoute("/_authenticated/admin/plans")({
  head: () => ({ meta: [{ title: "Plans — Admin" }] }),
  loader: ({ context }) => { context.queryClient.ensureQueryData(q); },
  component: AdminPlans,
});

function AdminPlans() {
  const { data: plans } = useSuspenseQuery(q);
  const qc = useQueryClient();
  const save = useServerFn(adminUpsertPlan);
  const del = useServerFn(adminDeletePlan);

  return (
    <div>
      <h1 className="text-3xl font-bold">Plans & pricing</h1>
      <p className="mt-2 text-muted-foreground">Set any price for any plan. Changes are live immediately.</p>
      <div className="mt-6 space-y-4">
        {plans.map((p: any) => (
          <PlanEditor key={p.id} plan={p} onSave={async (row) => {
            try { await save({ data: row }); toast.success("Saved"); qc.invalidateQueries({ queryKey: ["admin", "plans"] }); qc.invalidateQueries({ queryKey: ["plans"] }); }
            catch (e: any) { toast.error(e.message); }
          }} onDelete={async () => {
            if (!confirm("Delete this plan?")) return;
            try { await del({ data: { id: p.id } }); toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin", "plans"] }); qc.invalidateQueries({ queryKey: ["plans"] }); }
            catch (e: any) { toast.error(e.message); }
          }} />
        ))}
        <PlanEditor onSave={async (row) => {
          try { await save({ data: row }); toast.success("Created"); qc.invalidateQueries({ queryKey: ["admin", "plans"] }); qc.invalidateQueries({ queryKey: ["plans"] }); }
          catch (e: any) { toast.error(e.message); }
        }} />
      </div>
    </div>
  );
}

function PlanEditor({ plan, onSave, onDelete }: { plan?: any; onSave: (row: any) => void; onDelete?: () => void }) {
  const [name, setName] = useState(plan?.name ?? "");
  const [tier, setTier] = useState(plan?.tier ?? 1);
  const [price, setPrice] = useState(((plan?.price_cents ?? 0) / 100).toString());
  const [description, setDescription] = useState(plan?.description ?? "");
  const [features, setFeatures] = useState((plan?.features ?? []).join("\n"));
  const [active, setActive] = useState(plan?.active ?? true);
  const [sortOrder, setSortOrder] = useState(plan?.sort_order ?? 0);

  return (
    <Card className="p-6">
      <div className="grid gap-3 md:grid-cols-2">
        <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder={plan ? "" : "New plan name"} /></div>
        <div><Label>Tier (1-9)</Label><Input type="number" value={tier} onChange={(e) => setTier(+e.target.value)} /></div>
        <div><Label>Price (USD)</Label><Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
        <div><Label>Sort order</Label><Input type="number" value={sortOrder} onChange={(e) => setSortOrder(+e.target.value)} /></div>
        <div className="md:col-span-2"><Label>Description</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        <div className="md:col-span-2"><Label>Features (one per line)</Label><Textarea rows={4} value={features} onChange={(e) => setFeatures(e.target.value)} /></div>
        <div className="flex items-center gap-2"><Switch checked={active} onCheckedChange={setActive} /><Label>Active</Label></div>
      </div>
      <div className="mt-4 flex justify-between">
        <Button onClick={() => onSave({
          id: plan?.id,
          name, tier: +tier, price_cents: Math.round(parseFloat(price || "0") * 100),
          description, features: features.split("\n").map((s: string) => s.trim()).filter(Boolean),
          active, sort_order: +sortOrder,
        })}>{plan ? "Save" : <><Plus className="mr-1 h-4 w-4" /> Add plan</>}</Button>
        {onDelete && <Button variant="outline" onClick={onDelete}><Trash2 className="mr-1 h-4 w-4" /> Delete</Button>}
      </div>
    </Card>
  );
}
