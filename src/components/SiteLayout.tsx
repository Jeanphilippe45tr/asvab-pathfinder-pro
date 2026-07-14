import { Link } from "@tanstack/react-router";
import { Menu, Shield } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const CONTACT_EMAIL = "marklarry111111111@gmail.com";
const CONTACT_PHONE = "+1 (618) 315-4497";

const publicNavItems = [
  { to: "/asvab", label: "The ASVAB" },
  { to: "/tutorial", label: "Free Quiz" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [email, setEmail] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-72 flex-col p-0">
              <SheetHeader className="flex h-16 flex-row items-center gap-2 border-b px-5">
                <span className="grid h-8 w-8 place-items-center rounded-md bg-hero text-navy-foreground">
                  <Shield className="h-4 w-4" />
                </span>
                <SheetTitle className="text-base">ASVAB Pro</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-3 text-sm">
                {publicNavItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-3 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto border-t p-3">
                {email ? (
                  <Button asChild className="w-full" onClick={() => setMobileOpen(false)}>
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                ) : (
                  <div className="grid gap-2">
                    <Button asChild variant="outline" onClick={() => setMobileOpen(false)}>
                      <Link to="/auth">Sign in</Link>
                    </Button>
                    <Button asChild className="bg-gold text-gold-foreground hover:opacity-90" onClick={() => setMobileOpen(false)}>
                      <Link to="/pricing">Get started</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-hero text-navy-foreground">
            <Shield className="h-4 w-4" />
          </span>
          <span>ASVAB Pro</span>
          </Link>
        </div>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          {publicNavItems.map((item) => (
            <Link key={item.to} to={item.to} className="hover:text-foreground transition">{item.label}</Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 sm:flex">
          {email ? (
            <Button asChild size="sm">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="bg-gold text-gold-foreground hover:opacity-90">
                <Link to="/pricing">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ email, phone, address }: { email?: string; phone?: string; address?: string }) {
  const displayEmail = email || CONTACT_EMAIL;
  const displayPhone = phone || CONTACT_PHONE;

  return (
    <footer className="border-t border-border/60 bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4 md:px-8">
        <div>
          <div className="flex items-center gap-2 font-semibold">
            <Shield className="h-4 w-4 text-accent" /> ASVAB Pro
          </div>
          <p className="mt-3 text-sm opacity-80">Professional ASVAB preparation for serious candidates.</p>
        </div>
        <div className="text-sm">
          <div className="font-semibold">Product</div>
          <ul className="mt-3 space-y-2 opacity-80">
            <li><Link to="/pricing">Pricing</Link></li>
            <li><Link to="/tutorial">Free quiz</Link></li>
            <li><Link to="/asvab">About the ASVAB</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <div className="font-semibold">Company</div>
          <ul className="mt-3 space-y-2 opacity-80">
            <li><Link to="/about">About us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <div className="font-semibold">Contact</div>
          <ul className="mt-3 space-y-2 opacity-80">
            <li><a href={`mailto:${displayEmail}`}>{displayEmail}</a></li>
            <li><a href="tel:+16183154497">{displayPhone}</a></li>
            {address && <li>{address}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs opacity-60">
        © {new Date().getFullYear()} ASVAB Pro. Not affiliated with the U.S. Department of Defense.
      </div>
    </footer>
  );
}

export function SitePage({ children, footerData }: { children: ReactNode; footerData?: Record<string, string> }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter
        email={footerData?.contact_email}
        phone={footerData?.contact_phone}
        address={footerData?.contact_address}
      />
    </div>
  );
}
