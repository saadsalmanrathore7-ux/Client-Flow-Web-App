import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { RecentProjectsTable } from "@/components/dashboard/RecentProjectsTable";
import { UpcomingDeadlines } from "@/components/dashboard/UpcomingDeadlines";
import { QuickLinks } from "@/components/dashboard/QuickLinks";
import { ProjectStatus } from "@/generated/prisma/enums";

async function getDashboardData(userId: string) {
  const [
    activeProjectsCount,
    completedProjectsCount,
    subscription,
    unreadCount,
    recentProjects,
    upcomingProjects,
    user,
  ] = await Promise.all([
    prisma.project.count({
      where: { clientId: userId, NOT: { status: ProjectStatus.COMPLETED } },
    }),
    prisma.project.count({
      where: { clientId: userId, status: ProjectStatus.COMPLETED },
    }),
    prisma.subscription.findFirst({
      where: { userId, status: "active" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.count({ where: { userId, read: false } }),
    prisma.project.findMany({
      where: { clientId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.project.findMany({
      where: { clientId: userId, deadline: { not: null } },
      orderBy: { deadline: "asc" },
      take: 3,
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    }),
  ]);

  return {
    activeProjectsCount,
    completedProjectsCount,
    subscriptionPlan: subscription?.plan ?? "Free",
    unreadCount,
    recentProjects,
    upcomingProjects,
    userName: user?.name ?? null,
  };
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/auth/login");
  if (user.role === "ADMIN") redirect("/admin");

  if (user.role !== "CLIENT") {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h1 className="text-lg font-semibold text-amber-900">Access restricted</h1>
          <p className="mt-1 text-sm text-amber-700">
            This dashboard is only available to client accounts.
          </p>
        </div>
      </main>
    );
  }

  const data = await getDashboardData(user.id!);

  const stats = [
    {
      label: "Active Projects",
      value: data.activeProjectsCount,
      description: "Projects currently in progress or pending.",
    },
    {
      label: "Completed Projects",
      value: data.completedProjectsCount,
      description: "Finished projects across your account.",
    },
    {
      label: "Subscription Plan",
      value: data.subscriptionPlan,
      description: "Manage billing and upgrades in settings.",
    },
    {
      label: "Unread Notifications",
      value: data.unreadCount,
      description: "New updates across your projects.",
    },
  ];

  const firstName = data.userName?.split(" ")[0] ?? "there";

  return (
    <main className="mx-auto max-w-6xl px-6 py-8 md:py-10">

      {/* ── Welcome banner ─────────────────────────────── */}
      <header className="animate-fade-up mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {/* greeting */}
          <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-stone-400">
            <Sparkles className="h-3.5 w-3.5" />
            {getGreeting()}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">
            {firstName}&apos;s Dashboard
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Here&apos;s an overview of your projects, deadlines, and activity.
          </p>
        </div>

        <Link
          href="/dashboard/projects"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-stone-700 hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </header>

      <div className="space-y-6">

        {/* ── Stats row ──────────────────────────────────── */}
        <StatsGrid stats={stats} />

        {/* ── Main two-column grid ───────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">

          {/* Left: recent projects */}
          <RecentProjectsTable
            projects={data.recentProjects.map((p) => ({
              id: p.id,
              title: p.title,
              status: p.status,
              budget: p.budget.toString(),
              deadline: p.deadline,
            }))}
          />

          {/* Right: side column */}
          <div className="flex flex-col gap-6">
            <UpcomingDeadlines
              projects={data.upcomingProjects.map((p) => ({
                id: p.id,
                title: p.title,
                deadline: p.deadline,
                status: p.status,
              }))}
            />
            <QuickLinks />
          </div>
        </div>

      </div>
    </main>
  );
}
