import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getCourseDetail } from "@/lib/courses.functions";
import { getMyContext } from "@/lib/user.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { ProtectedFileViewer } from "@/components/ProtectedFileViewer";

const meQ = queryOptions({ queryKey: ["me"], queryFn: () => getMyContext() });

export const Route = createFileRoute("/_authenticated/courses/$courseId")({
  head: () => ({ meta: [{ title: "Course — ASVAB Pro" }] }),
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(
      queryOptions({
        queryKey: ["course", params.courseId],
        queryFn: () => getCourseDetail({ data: { courseId: params.courseId } }),
      }),
    );
    context.queryClient.ensureQueryData(meQ);
  },
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl">
      <Card className="p-8 text-center">
        <h1 className="text-2xl font-bold">Cannot open course</h1>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
        <Button asChild className="mt-6"><Link to="/courses">Back to courses</Link></Button>
      </Card>
    </div>
  ),
  notFoundComponent: () => <div className="p-8">Not found</div>,
  component: CourseDetail,
});

function CourseDetail() {
  const { courseId } = Route.useParams();
  const { data } = useSuspenseQuery(
    queryOptions({
      queryKey: ["course", courseId],
      queryFn: () => getCourseDetail({ data: { courseId } }),
    }),
  );
  const { data: me } = useSuspenseQuery(meQ);
  const watermark = me.profile?.email ?? "ASVAB Pro user";

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/courses" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All courses
      </Link>
      <h1 className="mt-2 text-3xl font-bold">{data.course.title}</h1>
      {data.course.description && <p className="mt-2 text-muted-foreground">{data.course.description}</p>}

      <div className="mt-8 space-y-6">
        {data.lessons.map((l: any, idx: number) => {
          const lessonFiles = data.files.filter((f: any) => f.lesson_id === l.id);
          return (
            <Card key={l.id} className="p-6">
              <div className="text-xs uppercase text-muted-foreground">Lesson {idx + 1}</div>
              <h2 className="mt-1 text-xl font-semibold">{l.title}</h2>
              {l.video_url && (
                <div className="mt-4 aspect-video overflow-hidden rounded-md bg-black">
                  <iframe
                    title={l.title}
                    src={l.video_url}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              {l.content && (
                <div className="prose prose-sm mt-4 max-w-none whitespace-pre-wrap select-none" onCopy={(e) => e.preventDefault()}>
                  {l.content}
                </div>
              )}
              {lessonFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-sm font-medium">Attached materials</div>
                  {lessonFiles.map((f: any) => (
                    <FileRow key={f.id} f={f} watermark={watermark} />
                  ))}
                </div>
              )}
            </Card>
          );
        })}
        {data.lessons.length === 0 && (
          <Card className="p-6 text-muted-foreground">No lessons published yet.</Card>
        )}

        {/* Course-level files (not attached to a specific lesson) */}
        {data.files.filter((f: any) => !f.lesson_id).length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Course materials</h2>
            <div className="mt-3 space-y-2">
              {data.files.filter((f: any) => !f.lesson_id).map((f: any) => (
                <FileRow key={f.id} f={f} watermark={watermark} />
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function FileRow({ f, watermark }: { f: any; watermark: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div className="flex items-center gap-2 min-w-0">
        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="truncate text-sm">{f.file_name}</span>
      </div>
      <ProtectedFileViewer fileId={f.id} fileName={f.file_name} mimeType={f.mime_type} watermark={watermark} />
    </div>
  );
}
