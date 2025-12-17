import type { PropsWithChildren } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireSession } from "@/lib/auth";

export default async function DashboardLayout({ children }: PropsWithChildren) {
  const { profile } = await requireSession();
  return <DashboardShell role={profile.role}>{children}</DashboardShell>;
}
