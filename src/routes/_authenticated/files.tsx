import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getMyPersonalFiles } from "@/lib/courses.functions";
import { getMyContext } from "@/lib/user.functions";
import { Card } from "@/components/ui/card";
import { FileText, FolderLock } from "lucide-react";
import { ProtectedFileViewer } from "@/components/ProtectedFileViewer";

const q = queryOptions({ queryKey: ["my-files"], queryFn: () => getMyPersonalFiles() });
const meQ = queryOptions({ queryKey: ["me"], queryFn: () => getMyContext() });

export const Route = createFileRoute("/_authenticated/files")({
  head: () => ({ meta: [{ title: "My files — ASVAB Pro" }] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(q);
    context.queryClient.ensureQueryData(meQ);
  },
  component: MyFiles,
});

function MyFiles() {
  const { data: files } = useSuspenseQuery(q);
  const { data: me } = useSuspenseQuery(meQ);
  const watermark = me.profile?.email ?? "ASVAB Pro user";

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold flex items-center gap-2"><FolderLock className="h-7 w-7" /> My files</h1>
      <p className="mt-2 text-muted-foreground">
        Documents your admin uploaded just for you. View-only — downloading and printing are disabled.
      </p>

      {files.length === 0 && (
        <Card className="mt-6 p-6 text-muted-foreground">No files yet.</Card>
      )}

      <div className="mt-6 space-y-2">
        {files.map((f: any) => (
          <Card key={f.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <div className="truncate font-medium">{f.file_name}</div>
                <div className="text-xs text-muted-foreground">
                  {f.mime_type ?? "file"} · {new Date(f.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            <ProtectedFileViewer fileId={f.id} fileName={f.file_name} mimeType={f.mime_type} watermark={watermark} />
          </Card>
        ))}
      </div>
    </div>
  );
}
