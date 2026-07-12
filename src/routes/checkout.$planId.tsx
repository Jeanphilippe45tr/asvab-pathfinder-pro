import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SitePage } from "@/components/SiteLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createPendingOrder } from "@/lib/user.functions";
import { getPlans } from "@/lib/site.functions";
import { toast } from "sonner";
import { MessageCircle, ShieldCheck } from "lucide-react";

const WHATSAPP_NUMBER = "16183154497"; // +1 (618) 315-4497

export const Route = createFileRoute("/checkout/$planId")({
  head: () => ({ meta: [{ title: "Checkout — ASVAB Pro" }] }),
  component: Checkout,
});

function Checkout() {
  const { planId } = Route.useParams();
  const nav = useNavigate();
  const start = useServerFn(createPendingOrder);
  const [plan, setPlan] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    getPlans().then((plans) => setPlan(plans.find((p: any) => p.id === planId)));
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
  }, [planId]);

  async function handleContinue() {
    if (!session) {
      nav({ to: "/auth", search: { redirect: `/checkout/${planId}` } });
      return;
    }
    setProcessing(true);
    try {
      const res = await start({ data: { planId } });
      const price = (res.priceCents / 100).toFixed(2);
      const msg = `Hello Admin,\n\nI would like to subscribe to the *${res.planName}* plan ($${price}/mo) on ASVAB Pro.\n\nAccount email: ${res.email}\nName: ${res.fullName || "—"}\nOrder ID: ${res.orderId}\n\nPlease guide me on how to complete the payment. Thank you!`;
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
      toast.success("Order created — opening WhatsApp to contact admin");
      window.open(url, "_blank", "noopener,noreferrer");
      nav({ to: "/dashboard" });
    } catch (e: any) {
      toast.error(e.message ?? "Failed to start order");
      setProcessing(false);
    }
  }

  if (!plan) return <SitePage><div className="mx-auto max-w-2xl px-4 py-20">Loading…</div></SitePage>;

  return (
    <SitePage>
      <section className="mx-auto max-w-2xl px-4 py-16 md:px-8">
        <div className="mb-6 text-sm text-muted-foreground">Checkout</div>
        <Card className="p-8 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{plan.name}</div>
              <div className="mt-1 text-3xl font-bold">${(plan.price_cents / 100).toFixed(2)}<span className="text-base font-normal text-muted-foreground">/mo</span></div>
            </div>
            <div className="rounded-md bg-[#25D366]/10 p-3"><MessageCircle className="h-5 w-5 text-[#25D366]" /></div>
          </div>
          <div className="mt-6 rounded-md border-l-4 border-accent bg-accent/10 p-4 text-sm">
            <strong>How payment works.</strong> Click the button below to open WhatsApp and message the admin directly. The admin will guide you through the payment steps, then activate your subscription from the dashboard.
          </div>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            {(plan.features as string[]).map((f: string) => <li key={f}>• {f}</li>)}
          </ul>
          <Button
            size="lg"
            className="mt-8 w-full bg-[#25D366] text-white hover:bg-[#20bd5a]"
            onClick={handleContinue}
            disabled={processing}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            {processing ? "Preparing your order…" : session ? "Contact admin on WhatsApp" : "Sign in to continue"}
          </Button>
          <p className="mt-4 flex items-center justify-center gap-1 text-center text-xs text-muted-foreground">
            <ShieldCheck className="h-3 w-3" /> Your subscription is activated by the admin after payment is confirmed.
          </p>
          {!session && <p className="mt-2 text-center text-xs"><Link to="/auth" className="underline">Sign in</Link></p>}
        </Card>
      </section>
    </SitePage>
  );
}
