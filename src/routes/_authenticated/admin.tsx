import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { getMyContext } from "@/lib/user.functions";

const meQ = queryOptions({ queryKey: ["me"], queryFn: () => getMyContext() });

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ context }) => {
    const me = await context.queryClient.ensureQueryData(meQ);
    if (!me.isAdmin) throw redirect({ to: "/dashboard" });
  },
  component: () => <Outlet />,
});
