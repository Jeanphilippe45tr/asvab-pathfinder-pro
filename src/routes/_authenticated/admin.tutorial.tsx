import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminGetTutorial, adminUpsertTutorial, adminDeleteTutorial } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

const q = queryOptions({ queryKey: ["admin", "tutorial"], queryFn: () => adminGetTutorial() });

export const Route = createFileRoute("/_authenticated/admin/tutorial")({
  head: () => ({ meta: [{ title: "Tutorial quiz — Admin" }] }),
  loader: ({ context }) => { context.queryClient.ensureQueryData(q); },
  component: AdminTutorial,
});

function AdminTutorial() {
  const { data: rows } = useSuspenseQuery(q);
  const qc = useQueryClient();
  const save = useServerFn(adminUpsertTutorial);
  const del = useServerFn(adminDeleteTutorial);
  return (
    <div>
      <h1 className="text-3xl font-bold">Pre-signup tutorial quiz</h1>
      <p className="mt-2 text-muted-foreground">10 questions, total 7 minutes.</p>
      <div className="mt-6 space-y-4">
        {rows.map((r: any) => (
          <Editor key={r.id} q={r}
            onSave={async (row) => { try { await save({ data: row }); toast.success("Saved"); qc.invalidateQueries({ queryKey: ["admin", "tutorial"] }); qc.invalidateQueries({ queryKey: ["tutorial"] }); } catch (e: any) { toast.error(e.message); } }}
            onDelete={async () => { if (!confirm("Delete?")) return; try { await del({ data: { id: r.id } }); toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin", "tutorial"] }); qc.invalidateQueries({ queryKey: ["tutorial"] }); } catch (e: any) { toast.error(e.message); } }}
          />
        ))}
        <Editor onSave={async (row) => { try { await save({ data: row }); toast.success("Added"); qc.invalidateQueries({ queryKey: ["admin", "tutorial"] }); qc.invalidateQueries({ queryKey: ["tutorial"] }); } catch (e: any) { toast.error(e.message); } }} />
      </div>
    </div>
  );
}

function Editor({ q, onSave, onDelete }: { q?: any; onSave: (row: any) => void; onDelete?: () => void }) {
  const [prompt, setPrompt] = useState(q?.prompt ?? "");
  const [choices, setChoices] = useState((q?.choices ?? ["", "", "", ""]).join("\n"));
  const [correct, setCorrect] = useState(q?.correct_index ?? 0);
  const [time, setTime] = useState(q?.time_seconds ?? 42);
  const [order, setOrder] = useState(q?.sort_order ?? 0);
  return (
    <Card className="p-6">
      <div className="grid gap-3">
        <div><Label>Prompt</Label><Textarea rows={2} value={prompt} onChange={(e) => setPrompt(e.target.value)} /></div>
        <div><Label>Choices (one per line)</Label><Textarea rows={4} value={choices} onChange={(e) => setChoices(e.target.value)} /></div>
        <div className="grid grid-cols-3 gap-3">
          <div><Label>Correct index (0-based)</Label><Input type="number" value={correct} onChange={(e) => setCorrect(+e.target.value)} /></div>
          <div><Label>Time (seconds)</Label><Input type="number" value={time} onChange={(e) => setTime(+e.target.value)} /></div>
          <div><Label>Sort order</Label><Input type="number" value={order} onChange={(e) => setOrder(+e.target.value)} /></div>
        </div>
      </div>
      <div className="mt-4 flex justify-between">
        <Button onClick={() => onSave({ id: q?.id, prompt, choices: choices.split("\n").map((s: string) => s.trim()).filter(Boolean), correct_index: correct, time_seconds: time, sort_order: order })}>
          {q ? "Save" : <><Plus className="mr-1 h-4 w-4" /> Add question</>}
        </Button>
        {onDelete && <Button variant="outline" onClick={onDelete}><Trash2 className="mr-1 h-4 w-4" /></Button>}
      </div>
    </Card>
  );
}
