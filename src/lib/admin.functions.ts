import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Error("Forbidden");
}

export const adminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const [users, orders, subs, msgs] = await Promise.all([
      supabase.from("profiles").select("id,banned,status"),
      supabase.from("orders").select("id,status,amount_cents"),
      supabase.from("subscriptions").select("id,approved,status"),
      supabase.from("contact_messages").select("id,handled"),
    ]);
    const u = users.data ?? [];
    const o = orders.data ?? [];
    const s = subs.data ?? [];
    return {
      totalUsers: u.length,
      bannedUsers: u.filter((x) => x.banned).length,
      activeUsers: u.filter((x) => !x.banned && x.status === "active").length,
      paidOrders: o.filter((x) => x.status === "paid").length,
      pendingApprovals: s.filter((x) => !x.approved).length,
      revenueCents: o.filter((x) => x.status === "paid").reduce((a, b) => a + (b.amount_cents ?? 0), 0),
      messages: (msgs.data ?? []).filter((m) => !m.handled).length,
    };
  });

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    const { data: subs } = await supabase.from("subscriptions").select("user_id,approved,status, plans(name,tier)");
    const byUser: Record<string, any[]> = {};
    (subs ?? []).forEach((s: any) => {
      byUser[s.user_id] = byUser[s.user_id] || [];
      byUser[s.user_id].push(s);
    });
    return (profiles ?? []).map((p: any) => ({
      ...p,
      subscriptions: byUser[p.id] ?? [],
      paid: (byUser[p.id] ?? []).length > 0,
    }));
  });

export const adminSetUserFlag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; banned?: boolean; status?: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const upd: any = {};
    if (data.banned !== undefined) upd.banned = data.banned;
    if (data.status !== undefined) upd.status = data.status;
    const { error } = await supabase.from("profiles").update(upd).eq("id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminApproveSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { subscriptionId: string; approve: boolean }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const upd = data.approve
      ? { approved: true, status: "active", approved_by: userId, approved_at: new Date().toISOString() }
      : { approved: false, status: "cancelled" };
    const { data: sub, error } = await supabase
      .from("subscriptions")
      .update(upd)
      .eq("id", data.subscriptionId)
      .select("order_id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (sub?.order_id) {
      await supabase
        .from("orders")
        .update({ status: data.approve ? "paid" : "cancelled" })
        .eq("id", sub.order_id);
    }
    return { ok: true };
  });

export const adminListOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data } = await supabase
      .from("orders")
      .select("*, plans(name), profiles(email,full_name)")
      .order("created_at", { ascending: false });
    return data ?? [];
  });

export const adminListSubscriptions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data } = await supabase
      .from("subscriptions")
      .select("*, plans(name,tier), profiles(email,full_name)")
      .order("created_at", { ascending: false });
    return data ?? [];
  });

export const adminSetOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { orderId: string; status: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { error } = await supabase.from("orders").update({ status: data.status }).eq("id", data.orderId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminGetPlans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data } = await supabase.from("plans").select("*").order("sort_order");
    return data ?? [];
  });

export const adminUpsertPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    id?: string;
    name: string;
    tier: number;
    price_cents: number;
    description?: string;
    features: string[];
    active: boolean;
    sort_order: number;
  }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const row = { ...data, features: data.features };
    if (data.id) {
      const { error } = await supabase.from("plans").update(row).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("plans").insert(row);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const adminDeletePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { error } = await supabase.from("plans").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminGetSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data } = await supabase.from("site_settings").select("*");
    const map: Record<string, string> = {};
    (data ?? []).forEach((r: any) => (map[r.key] = r.value));
    return map;
  });

export const adminSaveSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { settings: Record<string, string> }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const rows = Object.entries(data.settings).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }));
    const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminGetTutorial = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data } = await supabase.from("tutorial_questions").select("*").order("sort_order");
    return data ?? [];
  });

export const adminUpsertTutorial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    id?: string;
    prompt: string;
    choices: string[];
    correct_index: number;
    time_seconds: number;
    sort_order: number;
  }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    if (data.id) {
      const { error } = await supabase.from("tutorial_questions").update(data).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("tutorial_questions").insert(data);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const adminDeleteTutorial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { error } = await supabase.from("tutorial_questions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminGetPractice = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data } = await supabase.from("practice_questions").select("*").order("subtest");
    return data ?? [];
  });

export const adminUpsertPractice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    id?: string;
    subtest: string;
    prompt: string;
    choices: string[];
    correct_index: number;
    explanation?: string;
    min_tier: number;
  }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    if (data.id) {
      const { error } = await supabase.from("practice_questions").update(data).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("practice_questions").insert(data);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const adminDeletePractice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { error } = await supabase.from("practice_questions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    return data ?? [];
  });

export const adminMarkMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; handled: boolean }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { error } = await supabase.from("contact_messages").update({ handled: data.handled }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { error } = await supabase.from("contact_messages").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    if (data.userId === userId) throw new Error("You cannot delete yourself");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminResetUserPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; password: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    if (data.password.length < 6) throw new Error("Password too short");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, { password: data.password });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminGrantSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; planId: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const now = new Date().toISOString();
    const { error } = await supabase.from("subscriptions").insert({
      user_id: data.userId,
      plan_id: data.planId,
      approved: true,
      status: "active",
      approved_by: userId,
      approved_at: now,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminRevokeSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { subscriptionId: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { error } = await supabase.from("subscriptions").delete().eq("id", data.subscriptionId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const [attempts, orders, plans, subs] = await Promise.all([
      supabase.from("quiz_attempts").select("id,user_id,score,total,created_at, profiles(email)").order("created_at", { ascending: false }).limit(50),
      supabase.from("orders").select("amount_cents,status,created_at"),
      supabase.from("plans").select("id,name"),
      supabase.from("subscriptions").select("plan_id, plans(name)"),
    ]);
    const o = orders.data ?? [];
    const revenueByDay: Record<string, number> = {};
    o.filter((x) => x.status === "paid").forEach((x) => {
      const d = new Date(x.created_at).toISOString().slice(0, 10);
      revenueByDay[d] = (revenueByDay[d] ?? 0) + (x.amount_cents ?? 0);
    });
    const subsByPlan: Record<string, number> = {};
    (subs.data ?? []).forEach((s: any) => {
      const name = s.plans?.name ?? "Unknown";
      subsByPlan[name] = (subsByPlan[name] ?? 0) + 1;
    });
    return {
      attempts: attempts.data ?? [],
      revenueByDay,
      subsByPlan,
      totalOrders: o.length,
      paidCount: o.filter((x) => x.status === "paid").length,
      refundedCount: o.filter((x) => x.status === "refunded").length,
    };
  });
