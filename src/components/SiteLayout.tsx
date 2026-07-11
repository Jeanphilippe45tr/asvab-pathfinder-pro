import { Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const [email, setEmail] = useState<string | null>(null);
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
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-hero text-navy-foreground">
            <Shield className="h-4 w-4" />
          </span>
          <span>ASVAB Pro</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <Link to="/asvab" className="hover:text-foreground transition">The ASVAB</Link>
          <Link to="/tutorial" className="hover:text-foreground transition">Free Quiz</Link>
          <Link to="/pricing" className="hover:text-foreground transition">Pricing</Link>
          <Link to="/about" className="hover:text-foreground transition">About</Link>
          <Link to="/contact" className="hover:text-foreground transition">Contact</Link>
        </nav>
        <div className="flex items-center gap-2">
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
            {email && <li>{email}</li>}
            {phone && <li>{phone}</li>}
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
