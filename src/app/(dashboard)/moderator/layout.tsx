import DashboardShell from "@/components/dashboard/DashboardShell";

// Moderator routes are auth-gated and fetch per-user data via headers(),
// so they must always render dynamically (never statically pre-rendered).
export const dynamic = "force-dynamic";

export default function ModeratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell role="Moderator">{children}</DashboardShell>;
}
