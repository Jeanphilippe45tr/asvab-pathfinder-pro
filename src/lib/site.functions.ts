import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function serverPublic() {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

export const getSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await serverPublic().from("site_settings").select("key,value");
  const map: Record<string, string> = {};
  (data ?? []).forEach((r) => (map[r.key] = r.value));
  return map;
});

export const getPlans = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await serverPublic()
    .from("plans")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  return data ?? [];
});

export const getTutorialQuestions = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await serverPublic()
    .from("tutorial_questions")
    .select("id,prompt,choices,correct_index,time_seconds,sort_order")
    .order("sort_order");
  return data ?? [];
});

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((d: { name: string; email: string; message: string }) => d)
  .handler(async ({ data }) => {
    const { error } = await serverPublic().from("contact_messages").insert({
      name: data.name.slice(0, 100),
      email: data.email.slice(0, 200),
      message: data.message.slice(0, 4000),
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const recordQuizAttempt = createServerFn({ method: "POST" })
  .inputValidator((d: { score: number; total: number }) => d)
  .handler(async ({ data }) => {
    await serverPublic().from("quiz_attempts").insert({ score: data.score, total: data.total, kind: "tutorial" });
    return { ok: true };
  });
