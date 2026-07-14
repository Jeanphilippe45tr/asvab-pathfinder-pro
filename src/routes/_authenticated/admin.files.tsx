import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  adminListFiles,
  adminGetUploadUrl,
  adminRegisterFile,
  adminDeleteFile,
  adminListCourses,
  adminListUsers,
  adminListLessons,
} from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Trash2, Upload, FolderLock, BookOpen } from "lucide-react";

const filesQ = queryOptions({ queryKey: ["admin", "files"], queryFn: () => adminListFiles() });
const coursesQ = queryOptions({ queryKey: ["admin", "courses"], queryFn: () => adminListCourses() });
const usersQ = queryOptions({ queryKey: ["admin", "users"], queryFn: () => adminListUsers() });

export const Route = createFileRoute("/_authenticated/admin/files")({
  head: () => ({ meta: [{ title: "Files — Admin" }] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(filesQ);
    context.queryClient.ensureQueryData(coursesQ);
    context.queryClient.ensureQueryData(usersQ);
  },
  component: AdminFiles,
});

function AdminFiles() {
  const { data: files } = useSuspenseQuery(filesQ);
  const { data: courses } = useSuspenseQuery(coursesQ);
  const { data: users } = useSuspenseQuery(usersQ);
  const qc = useQueryClient();
  const del = useServerFn(adminDeleteFile);

  function invalidate() {
    qc.invalidateQueries({ queryKey: ["admin", "files"] });
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this file permanently?")) return;
    try {
      await del({ data: { id } });
      toast.success("Deleted");
      invalidate();
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Protected files</h1>
      <p className="mt-2 text-muted-foreground">
        Upload materials for a course (visible to approved subscribers of that tier) or private files for a single user's personal area. Files are stored securely and can only be viewed in-app.
      </p>

      <Tabs defaultValue="course" className="mt-6">
        <TabsList>
          <TabsTrigger value="course"><BookOpen className="mr-1 h-4 w-4" /> Course file</TabsTrigger>
          <TabsTrigger value="user"><FolderLock className="mr-1 h-4 w-4" /> Personal user file</TabsTrigger>
        </TabsList>
        <TabsContent value="course">
          <CourseUpload courses={courses} onDone={invalidate} />
        </TabsContent>
        <TabsContent value="user">
          <UserUpload users={users} onDone={invalidate} />
        </TabsContent>
      </Tabs>

      <h2 className="mt-10 text-xl font-semibold">All uploaded files</h2>
      <Card className="mt-3 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((f: any) => (
              <TableRow key={f.id}>
                <TableCell className="max-w-xs truncate">{f.file_name}</TableCell>
                <TableCell><Badge variant="outline">{f.scope}</Badge></TableCell>
                <TableCell className="text-xs">
                  {f.scope === "course" ? (f.courses?.title ?? "—") : (f.profiles?.email ?? "—")}
                </TableCell>
                <TableCell className="text-xs">{new Date(f.created_at).toLocaleString()}</TableCell>
                <TableCell>
                  <Button size="sm" variant="destructive" onClick={() => onDelete(f.id)}><Trash2 className="h-3 w-3" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {files.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No files uploaded yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function CourseUpload({ courses, onDone }: { courses: any[]; onDone: () => void }) {
  const [courseId, setCourseId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [lessons, setLessons] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const listLessons = useServerFn(adminListLessons);
  const getUrl = useServerFn(adminGetUploadUrl);
  const register = useServerFn(adminRegisterFile);

  useEffect(() => {
    if (!courseId) { setLessons([]); setLessonId(""); return; }
    listLessons({ data: { courseId } }).then((rows) => setLessons(rows as any[])).catch(() => setLessons([]));
  }, [courseId, listLessons]);

  async function submit() {
    if (!courseId || !file) return toast.error("Pick a course and a file");
    setUploading(true);
    try {
      const { path, signedUrl } = await getUrl({ data: { fileName: file.name, scope: "course" } });
      const putRes = await fetch(signedUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type || "application/octet-stream" } });
      if (!putRes.ok) throw new Error(`Upload failed [${putRes.status}]: ${await putRes.text()}`);
      await register({
        data: {
          scope: "course",
          course_id: courseId,
          lesson_id: lessonId || undefined,
          storage_path: path,
          file_name: file.name,
          mime_type: file.type || undefined,
          size_bytes: file.size,
        },
      });
      toast.success("Uploaded");
      setFile(null);
      onDone();
    } catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  }

  return (
    <Card className="mt-4 p-6 space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Label>Course</Label>
          <Select value={courseId} onValueChange={setCourseId}>
            <SelectTrigger><SelectValue placeholder="Choose a course" /></SelectTrigger>
            <SelectContent>{courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Attach to lesson (optional)</Label>
          <Select value={lessonId || "__none__"} onValueChange={(v) => setLessonId(v === "__none__" ? "" : v)} disabled={!courseId}>
            <SelectTrigger><SelectValue placeholder="Course-level (no specific lesson)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Course-level (no specific lesson)</SelectItem>
              {lessons.map((l) => <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>File (PDF recommended; images and text files also preview inline)</Label>
        <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </div>
      <Button onClick={submit} disabled={uploading || !file || !courseId}>
        <Upload className="mr-1 h-4 w-4" /> {uploading ? "Uploading…" : "Upload course file"}
      </Button>
    </Card>
  );
}

function UserUpload({ users, onDone }: { users: any[]; onDone: () => void }) {
  const [userId, setUserId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const getUrl = useServerFn(adminGetUploadUrl);
  const register = useServerFn(adminRegisterFile);

  async function submit() {
    if (!userId || !file) return toast.error("Pick a user and a file");
    setUploading(true);
    try {
      const { path, signedUrl } = await getUrl({ data: { fileName: file.name, scope: "user" } });
      const putRes = await fetch(signedUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type || "application/octet-stream" } });
      if (!putRes.ok) throw new Error(`Upload failed [${putRes.status}]: ${await putRes.text()}`);
      await register({
        data: {
          scope: "user",
          user_id: userId,
          storage_path: path,
          file_name: file.name,
          mime_type: file.type || undefined,
          size_bytes: file.size,
        },
      });
      toast.success("Uploaded to user's personal area");
      setFile(null);
      onDone();
    } catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  }

  return (
    <Card className="mt-4 p-6 space-y-3">
      <div>
        <Label>User</Label>
        <Select value={userId} onValueChange={setUserId}>
          <SelectTrigger><SelectValue placeholder="Choose a user" /></SelectTrigger>
          <SelectContent>{users.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.email}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label>File</Label>
        <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </div>
      <Button onClick={submit} disabled={uploading || !file || !userId}>
        <Upload className="mr-1 h-4 w-4" /> {uploading ? "Uploading…" : "Upload to user"}
      </Button>
    </Card>
  );
}
