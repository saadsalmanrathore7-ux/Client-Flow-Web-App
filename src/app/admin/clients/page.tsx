import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ClientStatusToggle } from "@/components/admin/ClientStatusToggle";

type ClientRowStatus = "active" | "suspended";

async function getClientsWithStats() {
  const [clients, statusLogs] = await Promise.all([
    prisma.user.findMany({
      where: { role: "CLIENT" },
      orderBy: { createdAt: "desc" },
      include: {
        subscriptions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        projects: true,
      },
    }),
    prisma.activityLog.findMany({
      where: {
        action: "CLIENT_STATUS_UPDATED",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        userId: true,
        meta: true,
      },
    }),
  ]);

  const latestStatusByUser = new Map<string, ClientRowStatus>();

  for (const log of statusLogs) {
    if (!log.userId || latestStatusByUser.has(log.userId)) continue;
    const meta = log.meta as unknown as { status?: ClientRowStatus } | null;
    if (meta?.status === "suspended" || meta?.status === "active") {
      latestStatusByUser.set(log.userId, meta.status);
    }
  }

  const rows = clients.map((client) => {
    const subscription = client.subscriptions[0];
    const projectsCount = client.projects.length;
    const status: ClientRowStatus =
      latestStatusByUser.get(client.id) ?? "active";

    return {
      id: client.id,
      name: client.name,
      email: client.email,
      plan: subscription?.plan ?? "Free",
      projectsCount,
      joinedAt: client.createdAt,
      status,
    };
  });

  return rows;
}

export default async function AdminClientsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  const clients = await getClientsWithStats();

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Clients
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View and manage client accounts, plans, and access status.
          </p>
        </div>
      </header>

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
        <div className="min-w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-100/70">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Client
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Plan
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Projects
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Joined
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Status
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">
                        {client.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {client.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 ring-1 ring-violet-100">
                      {client.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {client.projectsCount}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {client.joinedAt.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${
                        client.status === "suspended"
                          ? "bg-rose-50 text-rose-700 ring-rose-200"
                          : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      }`}
                    >
                      <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-current" />
                      {client.status === "suspended" ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                      >
                        View
                      </Link>
                      <ClientStatusToggle
                        clientId={client.id}
                        initialStatus={client.status}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-xs text-slate-500"
                  >
                    No client accounts found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

