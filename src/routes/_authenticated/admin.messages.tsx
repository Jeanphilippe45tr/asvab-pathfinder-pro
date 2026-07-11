import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListMessages, adminMarkMessage, adminDeleteMessage } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Check, RotateCcw, Mail } from "lucide-react";

const q = queryOptions({ queryKey: ["admin", "messages"], queryFn: () => adminListMessages() });

export const Route = createFileRoute("/_authenticated/admin/messages")({
  head: () => ({ meta: [{ title: "Messages — Admin" }] }),
  loader: ({ context }) => { context.queryClient.ensureQueryData(q); },
  component: AdminMessages,
});

function AdminMessages() {
  const { data: rows } = useSuspenseQuery(q);
  const qc = useQueryClient();
  const mark = useServerFn(adminMarkMessage);
  const del = useServerFn(adminDeleteMessage);

  async function toggle(id: string, handled: boolean) {
    try { await mark({ data: { id, handled } }); toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin", "messages"] }); }
    catch (e: any) { toast.error(e.message); }
  }
  async function remove(id: string) {
    if (!confirm("Delete this message?")) return;
    try { await del({ data: { id } }); toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin", "messages"] }); }
    catch (e: any) { toast.error(e.message); }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Contact messages</h1>
      <p className="mt-2 text-muted-foreground">Inbox of messages sent from the contact page.</p>
      <div className="mt-6 space-y-3">
        {rows.length === 0 && (
          <Card className="p-10 text-center text-muted-foreground"><Mail className="mx-auto mb-2 h-6 w-6" /> No messages yet</Card>
        )}
        {rows.map((m: any) => (
          <Card key={m.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{m.name || "Anonymous"}</div>
                  <span className="text-xs text-muted-foreground">{m.email}</span>
                  {m.handled ? <Badge variant="outline">handled</Badge> : <Badge>new</Badge>}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</div>
                {m.subject && <div className="mt-2 text-sm font-medium">{m.subject}</div>}
                <p className="mt-2 whitespace-pre-wrap text-sm">{m.message}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" variant="outline" onClick={() => toggle(m.id, !m.handled)}>
                  {m.handled ? <><RotateCcw className="mr-1 h-4 w-4" /> Reopen</> : <><Check className="mr-1 h-4 w-4" /> Mark handled</>}
                </Button>
                <Button size="sm" variant="outline" onClick={() => remove(m.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
