import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getSiteSettings } from "@/lib/site.functions";
import { SitePage } from "@/components/SiteLayout";

const q = queryOptions({ queryKey: ["settings"], queryFn: () => getSiteSettings() });

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — ASVAB Pro" }, { name: "description", content: "Learn about ASVAB Pro's mission and methodology." }] }),
  loader: ({ context }) => { context.queryClient.ensureQueryData(q); },
  component: About,
});

function About() {
  const { data: settings } = useSuspenseQuery(q);
  return (
    <SitePage footerData={settings}>
      <section className="mx-auto max-w-4xl px-4 py-20 md:px-8">
        <h1 className="text-4xl font-bold md:text-5xl">About ASVAB Pro</h1>
        <p className="mt-6 text-lg text-muted-foreground whitespace-pre-line">{settings.about_html}</p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border p-6"><h3 className="font-semibold">Our Mission</h3><p className="mt-2 text-sm text-muted-foreground">Give every candidate access to modern, honest ASVAB preparation.</p></div>
          <div className="rounded-lg border p-6"><h3 className="font-semibold">Our Method</h3><p className="mt-2 text-sm text-muted-foreground">Adaptive drills, full-length simulations, and clear explanations for every question.</p></div>
        </div>
      </section>
    </SitePage>
  );
}
