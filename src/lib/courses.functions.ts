import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function getUserTier(supabase: any, userId: string) {
  const { data } = await supabase
    .from("subscriptions")
    .select("approved,status, plans(tier)")
    .eq("user_id", userId)
    .eq("approved", true)
    .eq("status", "active");
  return Math.max(0, ...(data ?? []).map((s: any) => s.plans?.tier ?? 0));
}

async function isAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  return !!data;
}

export const getMyCourses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const admin = await isAdmin(supabase, userId);
    const tier = admin ? 99 : await getUserTier(supabase, userId);
    if (!tier) return { locked: true as const, tier: 0, courses: [] };
    const { data: courses } = await supabase
      .from("courses")
      .select("*")
      .eq("published", true)
      .lte("min_tier", tier)
      .order("sort_order");
    return { locked: false as const, tier, courses: courses ?? [] };
  });

export const getCourseDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { courseId: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const admin = await isAdmin(supabase, userId);
    const tier = admin ? 99 : await getUserTier(supabase, userId);
    const { data: course } = await supabase.from("courses").select("*").eq("id", data.courseId).maybeSingle();
    if (!course) throw new Error("Course not found");
    if (!admin && (!tier || tier < course.min_tier)) throw new Error("Locked");
    const { data: lessons } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", data.courseId)
      .order("sort_order");
    const { data: files } = await supabase
      .from("protected_files")
      .select("id,file_name,mime_type,size_bytes,lesson_id,created_at")
      .eq("scope", "course")
      .eq("course_id", data.courseId);
    return { course, lessons: lessons ?? [], files: files ?? [] };
  });

export const getMyPersonalFiles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("protected_files")
      .select("id,file_name,mime_type,size_bytes,created_at")
      .eq("scope", "user")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return data ?? [];
  });

// Returns a short-lived signed URL after authorizing access
export const getFileViewUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { fileId: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const admin = await isAdmin(supabase, userId);
    const { data: file, error } = await supabase
      .from("protected_files")
      .select("*, courses(min_tier)")
      .eq("id", data.fileId)
      .maybeSingle();
    if (error || !file) throw new Error("File not found");

    if (!admin) {
      if (file.scope === "user") {
        if (file.user_id !== userId) throw new Error("Forbidden");
      } else if (file.scope === "course") {
        const tier = await getUserTier(supabase, userId);
        const required = file.courses?.min_tier ?? 999;
        if (!tier || tier < required) throw new Error("Locked");
      } else {
        throw new Error("Forbidden");
      }
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error: sErr } = await supabaseAdmin.storage
      .from("protected-files")
      .createSignedUrl(file.storage_path, 300);
    if (sErr) throw new Error(sErr.message);
    return {
      url: signed.signedUrl,
      fileName: file.file_name,
      mimeType: file.mime_type as string | null,
    };
  });
