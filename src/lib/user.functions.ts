import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyContext = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [profileRes, rolesRes, subsRes, ordersRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase
        .from("subscriptions")
        .select("*, plans(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase.from("orders").select("*, plans(name)").eq("user_id", userId).order("created_at", { ascending: false }),
    ]);
    const roles = (rolesRes.data ?? []).map((r) => r.role as string);
    return {
      profile: profileRes.data,
      roles,
      isAdmin: roles.includes("admin"),
      subscriptions: subsRes.data ?? [],
      orders: ordersRes.data ?? [],
    };
  });

export const simulatePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { planId: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: plan, error: planErr } = await supabase
      .from("plans")
      .select("id,price_cents,active")
      .eq("id", data.planId)
      .maybeSingle();
    if (planErr || !plan || !plan.active) throw new Error("Plan not found");

    const { data: order, error: oErr } = await supabase
      .from("orders")
      .insert({ user_id: userId, plan_id: plan.id, amount_cents: plan.price_cents, status: "paid" })
      .select()
      .single();
    if (oErr) throw new Error(oErr.message);

    const { error: sErr } = await supabase.from("subscriptions").insert({
      user_id: userId,
      plan_id: plan.id,
      order_id: order.id,
      status: "pending",
      approved: false,
    });
    if (sErr) throw new Error(sErr.message);
    return { ok: true, orderId: order.id };
  });

export const getPracticeQuestions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { subtest?: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // approved active subscription check
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("approved,status, plans(tier)")
      .eq("user_id", userId)
      .eq("approved", true)
      .eq("status", "active");
    const tier = Math.max(0, ...(subs ?? []).map((s: any) => s.plans?.tier ?? 0));
    if (!tier) return { locked: true as const, questions: [] };
    let q = supabase.from("practice_questions").select("*").lte("min_tier", tier);
    if (data.subtest) q = q.eq("subtest", data.subtest);
    const { data: questions } = await q;
    return { locked: false as const, questions: questions ?? [], tier };
  });
