import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminGetPractice, adminUpsertPractice, adminDeletePractice } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

const q = queryOptions({ queryKey: ["admin", "practice"], queryFn: () => adminGetPractice() });

export const Route = createFileRoute("/_authenticated/admin/practice")({
  head: () => ({ meta: [{ title: "Practice bank — Admin" }] }),
  loader: ({ context }) => { context.queryClient.ensureQueryData(q); },
  component: AdminPractice,
});

function AdminPractice() {
  const { data: rows } = useSuspenseQuery(q);
  const qc = useQueryClient();
  const save = useServerFn(adminUpsertPractice);
  const del = useServerFn(adminDeletePractice);
  return (
    <div>
      <h1 className="text-3xl font-bold">Practice question bank</h1>
      <div className="mt-6 space-y-4">
        {rows.map((r: any) => (
          <Editor key={r.id} q={r}
            onSave={async (row) => { try { await save({ data: row }); toast.success("Saved"); qc.invalidateQueries({ queryKey: ["admin", "practice"] }); } catch (e: any) { toast.error(e.message); } }}
            onDelete={async () => { if (!confirm("Delete?")) return; try { await del({ data: { id: r.id } }); toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin", "practice"] }); } catch (e: any) { toast.error(e.message); } }}
          />
        ))}
        <Editor onSave={async (row) => { try { await save({ data: row }); toast.success("Added"); qc.invalidateQueries({ queryKey: ["admin", "practice"] }); } catch (e: any) { toast.error(e.message); } }} />
      </div>
    </div>
  );
}

function Editor({ q, onSave, onDelete }: { q?: any; onSave: (row: any) => void; onDelete?: () => void }) {
  const [subtest, setSubtest] = useState(q?.subtest ?? "");
  const [prompt, setPrompt] = useState(q?.prompt ?? "");
  const [choices, setChoices] = useState((q?.choices ?? ["", "", "", ""]).join("\n"));
  const [correct, setCorrect] = useState(q?.correct_index ?? 0);
  const [explanation, setExplanation] = useState(q?.explanation ?? "");
  const [tier, setTier] = useState(q?.min_tier ?? 1);
  return (
    <Card className="p-6">
      <div className="grid gap-3">
        <div className="grid gap-3 md:grid-cols-2">
          <div><Label>Subtest</Label><Input value={subtest} onChange={(e) => setSubtest(e.target.value)} /></div>
          <div><Label>Min tier</Label><Input type="number" value={tier} onChange={(e) => setTier(+e.target.value)} /></div>
        </div>
        <div><Label>Prompt</Label><Textarea rows={2} value={prompt} onChange={(e) => setPrompt(e.target.value)} /></div>
        <div><Label>Choices (one per line)</Label><Textarea rows={4} value={choices} onChange={(e) => setChoices(e.target.value)} /></div>
        <div><Label>Correct index (0-based)</Label><Input type="number" value={correct} onChange={(e) => setCorrect(+e.target.value)} /></div>
        <div><Label>Explanation</Label><Textarea rows={2} value={explanation} onChange={(e) => setExplanation(e.target.value)} /></div>
      </div>
      <div className="mt-4 flex justify-between">
        <Button onClick={() => onSave({ id: q?.id, subtest, prompt, choices: choices.split("\n").map((s: string) => s.trim()).filter(Boolean), correct_index: correct, explanation, min_tier: tier })}>
          {q ? "Save" : <><Plus className="mr-1 h-4 w-4" /> Add question</>}
        </Button>
        {onDelete && <Button variant="outline" onClick={onDelete}><Trash2 className="mr-1 h-4 w-4" /></Button>}
      </div>
    </Card>
  );
}
