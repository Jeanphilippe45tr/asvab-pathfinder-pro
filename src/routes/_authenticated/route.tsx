import { createFileRoute, Outlet, redirect, Link, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Shield, LayoutDashboard, BookOpen, User, LogOut, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth", search: { redirect: location.href } });
    return { user: data.user };
  },
  component: AuthLayout,
});

function AuthLayout() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
      setIsAdmin(!!roles?.some((r) => r.role === "admin"));
    });
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <aside className="hidden w-60 flex-col border-r bg-card md:flex">
        <div className="flex h-16 items-center gap-2 border-b px-5 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-hero text-navy-foreground"><Shield className="h-4 w-4" /></span>
          ASVAB Pro
        </div>
        <nav className="flex-1 space-y-1 p-3 text-sm">
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/practice" icon={BookOpen} label="Practice" />
          <NavItem to="/account" icon={User} label="Account" />
          {isAdmin && (
            <>
              <div className="mt-6 px-3 text-xs font-semibold uppercase text-muted-foreground">Admin</div>
              <NavItem to="/admin" icon={Settings} label="Overview" />
              <NavItem to="/admin/users" icon={User} label="Users" />
              <NavItem to="/admin/orders" icon={LayoutDashboard} label="Orders" />
              <NavItem to="/admin/plans" icon={Settings} label="Plans" />
              <NavItem to="/admin/content" icon={Settings} label="Site content" />
              <NavItem to="/admin/tutorial" icon={BookOpen} label="Tutorial quiz" />
              <NavItem to="/admin/practice" icon={BookOpen} label="Practice bank" />
            </>
          )}
        </nav>
        <div className="border-t p-3">
          <Button variant="ghost" size="sm" onClick={signOut} className="w-full justify-start"><LogOut className="mr-2 h-4 w-4" /> Sign out</Button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden">
        <div className="border-b bg-card px-6 py-3 md:hidden">
          <Link to="/" className="font-semibold">ASVAB Pro</Link>
        </div>
        <div className="p-6 md:p-10"><Outlet /></div>
      </main>
    </div>
  );
}

function NavItem({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
      activeProps={{ className: "flex items-center gap-2 rounded-md px-3 py-2 bg-primary text-primary-foreground" }}
      activeOptions={{ exact: to === "/admin" }}
    >
      <Icon className="h-4 w-4" /> {label}
    </Link>
  );
}
