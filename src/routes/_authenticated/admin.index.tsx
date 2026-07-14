import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { adminOverview } from "@/lib/admin.functions";
import { getMyContext } from "@/lib/user.functions";
import { Card } from "@/components/ui/card";
import { Users, DollarSign, Clock, ShieldAlert, Mail, BarChart3, ShoppingCart, FileText, BookOpen, Settings, GraduationCap, FolderLock } from "lucide-react";

const meQ = queryOptions({ queryKey: ["me"], queryFn: () => getMyContext() });
const q = queryOptions({ queryKey: ["admin", "overview"], queryFn: () => adminOverview() });

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin — ASVAB Pro" }] }),
  beforeLoad: async ({ context }) => {
    const me = await context.queryClient.ensureQueryData(meQ);
    if (!me.isAdmin) throw redirect({ to: "/dashboard" });
  },
  loader: ({ context }) => { context.queryClient.ensureQueryData(q); },
  component: AdminOverview,
});

function AdminOverview() {
  const { data } = useSuspenseQuery(q);
  const stats = [
    { icon: Users, label: "Total users", value: data.totalUsers, to: "/admin/users" },
    { icon: Users, label: "Active users", value: data.activeUsers, to: "/admin/users" },
    { icon: ShieldAlert, label: "Banned users", value: data.bannedUsers, to: "/admin/users" },
    { icon: DollarSign, label: "Paid orders", value: data.paidOrders, to: "/admin/orders" },
    { icon: Clock, label: "Pending approvals", value: data.pendingApprovals, to: "/admin/users" },
    { icon: DollarSign, label: "Revenue (sim)", value: `$${(data.revenueCents / 100).toFixed(2)}`, to: "/admin/analytics" },
    { icon: Mail, label: "New messages", value: data.messages, to: "/admin/messages" },
  ];
  const shortcuts = [
    { icon: BarChart3, label: "Analytics", desc: "Revenue trends & attempts", to: "/admin/analytics" },
    { icon: Users, label: "Users & subs", desc: "Ban, activate, grant plans, reset passwords", to: "/admin/users" },
    { icon: ShoppingCart, label: "Orders", desc: "Mark paid / refund / cancel", to: "/admin/orders" },
    { icon: DollarSign, label: "Plans & pricing", desc: "Set prices and features", to: "/admin/plans" },
    { icon: FileText, label: "Site content", desc: "Hero, about, contact info", to: "/admin/content" },
    { icon: Mail, label: "Messages", desc: "Contact form inbox", to: "/admin/messages" },
    { icon: BookOpen, label: "Tutorial quiz", desc: "10-question, 7-minute pre-signup test", to: "/admin/tutorial" },
    { icon: BookOpen, label: "Practice bank", desc: "Full ASVAB question library", to: "/admin/practice" },
    { icon: GraduationCap, label: "Courses & lessons", desc: "Author paid ASVAB courses", to: "/admin/courses" },
    { icon: FolderLock, label: "Protected files", desc: "Upload course docs or per-user private files", to: "/admin/files" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold">Admin overview</h1>
      <p className="mt-2 text-muted-foreground">You are the supreme commander of ASVAB Pro. Manage every part of the site from here.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {stats.map((it) => (
          <Link key={it.label} to={it.to} className="block">
            <Card className="p-6 transition hover:shadow-md">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><it.icon className="h-4 w-4" /> {it.label}</div>
              <div className="mt-2 text-3xl font-bold">{it.value}</div>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="mt-12 text-xl font-semibold flex items-center gap-2"><Settings className="h-5 w-5" /> Management shortcuts</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {shortcuts.map((s) => (
          <Link key={s.label} to={s.to} className="block">
            <Card className="p-5 h-full transition hover:shadow-md hover:border-primary">
              <div className="flex items-center gap-2 font-semibold"><s.icon className="h-4 w-4" /> {s.label}</div>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
