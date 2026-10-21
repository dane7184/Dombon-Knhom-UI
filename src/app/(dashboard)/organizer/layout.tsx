import DashboardShell from "@/components/dashboard/DashboardShell";

export const dynamic = "force-dynamic";

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell role="Organizer">{children}</DashboardShell>;
}
