import { createFileRoute, Outlet, redirect, Link, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Shield, LayoutDashboard, BookOpen, User, LogOut, Settings, Menu, Mail, BarChart3, ShoppingCart, DollarSign, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";

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
  const [open, setOpen] = useState(false);

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

  const nav = (
    <>
      <nav className="flex-1 space-y-1 p-3 text-sm">
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" onNav={() => setOpen(false)} />
        <NavItem to="/practice" icon={BookOpen} label="Practice" onNav={() => setOpen(false)} />
        <NavItem to="/account" icon={User} label="Account" onNav={() => setOpen(false)} />
        {isAdmin && (
          <>
            <div className="mt-6 px-3 text-xs font-semibold uppercase text-muted-foreground">Admin</div>
            <NavItem to="/admin" icon={Settings} label="Overview" onNav={() => setOpen(false)} />
            <NavItem to="/admin/analytics" icon={BarChart3} label="Analytics" onNav={() => setOpen(false)} />
            <NavItem to="/admin/users" icon={User} label="Users & subs" onNav={() => setOpen(false)} />
            <NavItem to="/admin/orders" icon={ShoppingCart} label="Orders" onNav={() => setOpen(false)} />
            <NavItem to="/admin/plans" icon={DollarSign} label="Plans & pricing" onNav={() => setOpen(false)} />
            <NavItem to="/admin/content" icon={FileText} label="Site content" onNav={() => setOpen(false)} />
            <NavItem to="/admin/messages" icon={Mail} label="Messages" onNav={() => setOpen(false)} />
            <NavItem to="/admin/tutorial" icon={BookOpen} label="Tutorial quiz" onNav={() => setOpen(false)} />
            <NavItem to="/admin/practice" icon={BookOpen} label="Practice bank" onNav={() => setOpen(false)} />
          </>
        )}
      </nav>
      <div className="border-t p-3">
        <Button variant="ghost" size="sm" onClick={signOut} className="w-full justify-start"><LogOut className="mr-2 h-4 w-4" /> Sign out</Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <aside className="hidden w-60 flex-col border-r bg-card md:flex">
        <div className="flex h-16 items-center gap-2 border-b px-5 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-hero text-navy-foreground"><Shield className="h-4 w-4" /></span>
          ASVAB Pro
        </div>
        {nav}
      </aside>
      <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <div className="flex items-center justify-between gap-2 border-b bg-card px-4 py-3 md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-64 flex-col p-0">
              <SheetHeader className="flex h-16 flex-row items-center gap-2 border-b px-5">
                <span className="grid h-8 w-8 place-items-center rounded-md bg-hero text-navy-foreground"><Shield className="h-4 w-4" /></span>
                <SheetTitle className="text-base">ASVAB Pro</SheetTitle>
              </SheetHeader>
              {nav}
            </SheetContent>
          </Sheet>
          <Link to="/" className="font-semibold">ASVAB Pro</Link>
          <div className="w-9" />
        </div>
        <div className="min-w-0 p-4 sm:p-6 md:p-10"><Outlet /></div>
      </main>
    </div>
  );
}

function NavItem({ to, icon: Icon, label, onNav }: { to: string; icon: any; label: string; onNav?: () => void }) {
  return (
    <Link
      to={to}
      onClick={onNav}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
      activeProps={{ className: "flex items-center gap-2 rounded-md px-3 py-2 bg-primary text-primary-foreground" }}
      activeOptions={{ exact: to === "/admin" }}
    >
      <Icon className="h-4 w-4" /> {label}
    </Link>
  );
}
