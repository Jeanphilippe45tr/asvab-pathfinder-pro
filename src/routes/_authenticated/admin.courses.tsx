import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  adminListCourses,
  adminUpsertCourse,
  adminDeleteCourse,
  adminListLessons,
  adminUpsertLesson,
  adminDeleteLesson,
} from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus, ChevronDown } from "lucide-react";

const q = queryOptions({ queryKey: ["admin", "courses"], queryFn: () => adminListCourses() });

export const Route = createFileRoute("/_authenticated/admin/courses")({
  head: () => ({ meta: [{ title: "Courses — Admin" }] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(q);
  },
  component: AdminCourses,
});

function AdminCourses() {
  const { data: rows } = useSuspenseQuery(q);
  const qc = useQueryClient();
  const save = useServerFn(adminUpsertCourse);
  const del = useServerFn(adminDeleteCourse);

  async function onSave(row: any) {
    try {
      await save({ data: row });
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin", "courses"] });
    } catch (e: any) { toast.error(e.message); }
  }
  async function onDelete(id: string) {
    if (!confirm("Delete course and all its lessons?")) return;
    try {
      await del({ data: { id } });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "courses"] });
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Courses</h1>
      <p className="mt-2 text-muted-foreground">
        Author ASVAB courses. Approved subscribers whose plan tier meets the course's minimum tier see the content.
      </p>

      <div className="mt-6 space-y-4">
        {rows.map((r: any) => (
          <CourseCard key={r.id} c={r} onSave={onSave} onDelete={() => onDelete(r.id)} />
        ))}
        <CourseEditor onSave={onSave} />
      </div>
    </div>
  );
}

function CourseCard({ c, onSave, onDelete }: { c: any; onSave: (row: any) => void; onDelete: () => void }) {
  return (
    <Card className="p-6">
      <CourseEditor c={c} onSave={onSave} onDelete={onDelete} />
      <Accordion type="single" collapsible className="mt-4">
        <AccordionItem value="lessons">
          <AccordionTrigger className="text-sm">
            <span className="flex items-center gap-2"><ChevronDown className="h-4 w-4" /> Lessons</span>
          </AccordionTrigger>
          <AccordionContent>
            <LessonsPanel courseId={c.id} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

function CourseEditor({ c, onSave, onDelete }: { c?: any; onSave: (row: any) => void; onDelete?: () => void }) {
  const [title, setTitle] = useState(c?.title ?? "");
  const [description, setDescription] = useState(c?.description ?? "");
  const [tier, setTier] = useState<number>(c?.min_tier ?? 1);
  const [order, setOrder] = useState<number>(c?.sort_order ?? 0);
  const [published, setPublished] = useState<boolean>(c?.published ?? true);
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 md:grid-cols-2">
        <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div><Label>Min tier</Label><Input type="number" value={tier} onChange={(e) => setTier(+e.target.value)} /></div>
      </div>
      <div><Label>Description</Label><Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
      <div className="grid gap-3 md:grid-cols-3">
        <div><Label>Sort order</Label><Input type="number" value={order} onChange={(e) => setOrder(+e.target.value)} /></div>
        <div className="flex items-center gap-2 pt-6"><Switch checked={published} onCheckedChange={setPublished} /> <span className="text-sm">Published</span></div>
      </div>
      <div className="flex justify-between">
        <Button onClick={() => onSave({ id: c?.id, title, description, min_tier: tier, sort_order: order, published })}>
          {c ? "Save course" : <><Plus className="mr-1 h-4 w-4" /> Add course</>}
        </Button>
        {onDelete && <Button variant="outline" onClick={onDelete}><Trash2 className="mr-1 h-4 w-4" /> Delete</Button>}
      </div>
    </div>
  );
}

function LessonsPanel({ courseId }: { courseId: string }) {
  const lq = queryOptions({
    queryKey: ["admin", "lessons", courseId],
    queryFn: () => adminListLessons({ data: { courseId } }),
  });
  const { data: lessons } = useSuspenseQuery(lq);
  const qc = useQueryClient();
  const save = useServerFn(adminUpsertLesson);
  const del = useServerFn(adminDeleteLesson);

  async function onSave(row: any) {
    try {
      await save({ data: { ...row, course_id: courseId } });
      toast.success("Lesson saved");
      qc.invalidateQueries({ queryKey: ["admin", "lessons", courseId] });
    } catch (e: any) { toast.error(e.message); }
  }
  async function onDelete(id: string) {
    if (!confirm("Delete lesson?")) return;
    try {
      await del({ data: { id } });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "lessons", courseId] });
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="space-y-3 pt-2">
      {lessons.map((l: any) => <LessonEditor key={l.id} l={l} onSave={onSave} onDelete={() => onDelete(l.id)} />)}
      <LessonEditor onSave={onSave} />
    </div>
  );
}

function LessonEditor({ l, onSave, onDelete }: { l?: any; onSave: (row: any) => void; onDelete?: () => void }) {
  const [title, setTitle] = useState(l?.title ?? "");
  const [content, setContent] = useState(l?.content ?? "");
  const [video, setVideo] = useState(l?.video_url ?? "");
  const [order, setOrder] = useState<number>(l?.sort_order ?? 0);
  return (
    <Card className="p-4 bg-secondary/30">
      <div className="grid gap-2">
        <div className="grid gap-2 md:grid-cols-3">
          <div className="md:col-span-2"><Label>Lesson title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><Label>Sort order</Label><Input type="number" value={order} onChange={(e) => setOrder(+e.target.value)} /></div>
        </div>
        <div><Label>Video URL (YouTube embed, Vimeo, etc.)</Label><Input value={video} onChange={(e) => setVideo(e.target.value)} placeholder="https://www.youtube.com/embed/…" /></div>
        <div><Label>Content (plain text / markdown)</Label><Textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} /></div>
      </div>
      <div className="mt-3 flex justify-between">
        <Button size="sm" onClick={() => onSave({ id: l?.id, title, content, video_url: video, sort_order: order })}>
          {l ? "Save lesson" : <><Plus className="mr-1 h-4 w-4" /> Add lesson</>}
        </Button>
        {onDelete && <Button size="sm" variant="outline" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>}
      </div>
    </Card>
  );
}
