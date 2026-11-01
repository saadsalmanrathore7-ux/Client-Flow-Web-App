import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type RevenuePoint = {
  month: string;
  revenue: number;
};

async function getAdminOverviewData() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const oneYearAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const [
    totalClients,
    paymentsLast30Days,
    activeProjects,
    newClientsThisMonth,
    paymentsLastYear,
    recentActivity,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        role: "CLIENT",
      },
    }),
    prisma.payment.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: { amount: true },
    }),
    prisma.project.count({
      where: {
        NOT: {
          status: "COMPLETED",
        },
      },
    }),
    prisma.user.count({
      where: {
        role: "CLIENT",
        createdAt: {
          gte: startOfMonth,
        },
      },
    }),
    prisma.payment.findMany({
      where: {
        createdAt: {
          gte: oneYearAgo,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        amount: true,
        createdAt: true,
        user: {
          select: {
            id: true,
          },
        },
      },
    }),
    prisma.activityLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    }),
  ]);

  const monthlyRevenueMap = new Map<string, number>();

  for (let i = 0; i < 12; i += 1) {
    const date = new Date(oneYearAgo.getFullYear(), oneYearAgo.getMonth() + i, 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    monthlyRevenueMap.set(key, 0);
  }

  for (const payment of paymentsLastYear) {
    const date = payment.createdAt;
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    monthlyRevenueMap.set(
      key,
      (monthlyRevenueMap.get(key) ?? 0) + payment.amount,
    );
  }

  const revenueSeries: RevenuePoint[] = Array.from(
    { length: 12 },
    (_, index) => {
      const date = new Date(oneYearAgo.getFullYear(), oneYearAgo.getMonth() + index, 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const label = date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });

      return {
        month: label,
        revenue: (monthlyRevenueMap.get(key) ?? 0) / 100,
      };
    },
  );

  const monthlyRevenue =
    paymentsLast30Days.reduce((sum, p) => sum + p.amount, 0) / 100;

  return {
    totalClients,
    monthlyRevenue,
    activeProjects,
    newClientsThisMonth,
    revenueSeries: revenueSeries,
    recentActivity,
  };
}

export default async function AdminOverviewPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    // The /admin layout already handles redirects, but we keep this
    // here to satisfy the requirement of per-page guards as well.
    return null;
  }

  const data = await getAdminOverviewData();

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Admin overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            High-level view of clients, revenue, and recent activity across the
            platform.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            Total clients
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {data.totalClients}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Accounts with the client role.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            Revenue (last 30 days)
          </p>
          <p className="mt-3 text-3xl font-semibold text-emerald-600">
            ${data.monthlyRevenue.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Sum of successful payments recorded.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            Active projects
          </p>
          <p className="mt-3 text-3xl font-semibold text-indigo-600">
            {data.activeProjects}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Projects not yet marked as completed.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            New signups (this month)
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {data.newClientsThisMonth}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Client accounts created since the 1st.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.25fr)]">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Revenue (last 12 months)
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Approximate monthly recurring revenue based on recorded payments.
              </p>
            </div>
          </div>
          {/* Pseudo-code: wire up Recharts line chart */}
          {/* 
            In a client component, import from "recharts":
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.revenueSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#330fe6" />
              </LineChart>
            </ResponsiveContainer>
          */}
          <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-xs text-slate-400">
            Revenue chart placeholder — connect Recharts to{" "}
            <code className="mx-1 rounded bg-slate-100 px-1 py-0.5">
              revenueSeries
            </code>{" "}
            data.
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Recent activity
            </h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              Last {data.recentActivity.length} events
            </span>
          </div>
          <ol className="space-y-3 text-sm">
            {data.recentActivity.map((log) => (
              <li
                key={log.id}
                className="flex items-start justify-between gap-3 rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-100"
              >
                <div className="space-y-0.5">
                  <p className="font-medium text-slate-900">
                    {log.action.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-slate-500">
                    {log.project
                      ? `Project: ${log.project.title}`
                      : "No project context"}
                    {" • "}
                    {log.user ? `By ${log.user.name}` : "System"}
                  </p>
                </div>
                <time
                  className="shrink-0 text-xs text-slate-400"
                  dateTime={log.createdAt.toISOString()}
                >
                  {log.createdAt.toLocaleString()}
                </time>
              </li>
            ))}
            {data.recentActivity.length === 0 && (
              <li className="rounded-xl bg-white px-3 py-3 text-xs text-slate-500 ring-1 ring-dashed ring-slate-200">
                No activity has been recorded yet.
              </li>
            )}
          </ol>
        </div>
      </section>
    </div>
  );
}

