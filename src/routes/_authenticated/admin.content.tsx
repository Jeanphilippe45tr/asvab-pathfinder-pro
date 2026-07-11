import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminGetSettings, adminSaveSettings } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const q = queryOptions({ queryKey: ["admin", "settings"], queryFn: () => adminGetSettings() });

export const Route = createFileRoute("/_authenticated/admin/content")({
  head: () => ({ meta: [{ title: "Site content — Admin" }] }),
  loader: ({ context }) => { context.queryClient.ensureQueryData(q); },
  component: AdminContent,
});

const FIELDS: { key: string; label: string; textarea?: boolean }[] = [
  { key: "hero_title", label: "Hero title" },
  { key: "hero_subtitle", label: "Hero subtitle", textarea: true },
  { key: "about_html", label: "About page content", textarea: true },
  { key: "contact_email", label: "Contact email" },
  { key: "contact_phone", label: "Contact phone" },
  { key: "contact_address", label: "Contact address" },
];

function AdminContent() {
  const { data } = useSuspenseQuery(q);
  const save = useServerFn(adminSaveSettings);
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>(data);

  useEffect(() => { setValues(data); }, [data]);

  async function submit() {
    try { await save({ data: { settings: values } }); toast.success("Saved"); qc.invalidateQueries({ queryKey: ["admin", "settings"] }); qc.invalidateQueries({ queryKey: ["settings"] }); }
    catch (e: any) { toast.error(e.message); }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Site content</h1>
      <p className="mt-2 text-muted-foreground">Edit the public site: hero, about, and contact.</p>
      <Card className="mt-6 space-y-4 p-6">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <Label>{f.label}</Label>
            {f.textarea
              ? <Textarea rows={4} value={values[f.key] ?? ""} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />
              : <Input value={values[f.key] ?? ""} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />}
          </div>
        ))}
        <Button onClick={submit}>Save changes</Button>
      </Card>
    </div>
  );
}
